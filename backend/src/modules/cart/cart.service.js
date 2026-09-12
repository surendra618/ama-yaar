const Cart = require('./cart.model');
const Product = require('../product/product.model');
const Coupon = require('../coupon/coupon.model');
const ApiError = require('../../utils/ApiError');

function calculateSummary(cart) {
  let subtotal = 0;
  let mrpTotal = 0;

  const items = cart.items
    .filter((item) => item.product) // filter out any deleted products
    .map((item) => {
      const p = item.product;
      const price = item.price || p.price;
      const mrp = p.mrp || price;
      const itemSubtotal = price * item.quantity;
      const itemMrpTotal = mrp * item.quantity;

      subtotal += itemSubtotal;
      mrpTotal += itemMrpTotal;

      return {
        _id: item._id,
        product: {
          _id: p._id,
          name: p.name,
          slug: p.slug,
          images: p.images,
          price: p.price,
          mrp: p.mrp,
          stock: p.stock,
          brand: p.brand,
        },
        variant: item.variant,
        quantity: item.quantity,
        price,
        itemSubtotal,
      };
    });

  const productDiscount = Math.max(0, mrpTotal - subtotal);

  let couponDiscount = 0;
  let couponDetails = null;

  if (cart.coupon && cart.coupon.isActive) {
    const c = cart.coupon;
    const now = new Date();
    if (c.startDate <= now && c.expiryDate >= now && subtotal >= (c.minOrderValue || 0)) {
      if (c.discountType === 'percentage') {
        couponDiscount = (subtotal * c.discountValue) / 100;
        if (c.maxDiscount) couponDiscount = Math.min(couponDiscount, c.maxDiscount);
      } else if (c.discountType === 'fixed') {
        couponDiscount = Math.min(subtotal, c.discountValue);
      } else if (c.discountType === 'freeDelivery') {
        couponDiscount = 0; // handled via free delivery
      }
      couponDetails = {
        _id: c._id,
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
      };
    }
  }

  // Delivery charge: Free above 500, or if freeDelivery coupon applied
  const isFreeDelivery = subtotal >= 500 || cart.coupon?.discountType === 'freeDelivery';
  const deliveryCharge = items.length === 0 || isFreeDelivery ? 0 : 49;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = Math.max(0, subtotal - couponDiscount + deliveryCharge + tax);

  return {
    _id: cart._id,
    user: cart.user,
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    coupon: couponDetails,
    summary: {
      mrpTotal,
      subtotal,
      productDiscount,
      couponDiscount: Math.round(couponDiscount),
      deliveryCharge,
      tax,
      total: Math.round(total),
    },
  };
}

async function getCart(userId) {
  let cart = await Cart.findOne({ user: userId })
    .populate('items.product')
    .populate('coupon');

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return calculateSummary(cart);
}

async function addItem(userId, { productId, quantity = 1, variant = {} }) {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not available');
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      (!variant.size || item.variant?.size === variant.size) &&
      (!variant.color || item.variant?.color === variant.color)
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += Number(quantity);
    cart.items[existingIndex].price = product.price;
  } else {
    cart.items.push({
      product: productId,
      variant,
      quantity: Number(quantity),
      price: product.price,
    });
  }

  await cart.save();
  return getCart(userId);
}

async function updateItem(userId, { itemId, quantity }) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, 'Cart not found');

  if (Number(quantity) <= 0) {
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  } else {
    const item = cart.items.id(itemId);
    if (!item) throw new ApiError(404, 'Item not found in cart');
    item.quantity = Number(quantity);
  }

  await cart.save();
  return getCart(userId);
}

async function removeItem(userId, itemId) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, 'Cart not found');

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  await cart.save();
  return getCart(userId);
}

async function clearCart(userId) {
  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    cart.coupon = null;
    await cart.save();
  }
  return getCart(userId);
}

async function applyCoupon(userId, { code }) {
  if (!code) throw new ApiError(400, 'Coupon code is required');

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
  if (!coupon) throw new ApiError(404, 'Invalid coupon code');

  const now = new Date();
  if (coupon.startDate > now || coupon.expiryDate < now) {
    throw new ApiError(400, 'Coupon has expired');
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit reached');
  }

  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  const subtotal = cart.items.reduce((acc, item) => acc + (item.price || item.product?.price || 0) * item.quantity, 0);
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    throw new ApiError(400, `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`);
  }

  cart.coupon = coupon._id;
  await cart.save();

  return getCart(userId);
}

async function removeCoupon(userId) {
  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.coupon = null;
    await cart.save();
  }
  return getCart(userId);
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
};
