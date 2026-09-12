const Wishlist = require('./wishlist.model');
const Cart = require('../cart/cart.model');
const Product = require('../product/product.model');
const ApiError = require('../../utils/ApiError');

async function getWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: 'products',
    populate: { path: 'category', select: 'name slug' },
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  return wishlist;
}

async function addItem(userId, productId) {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [productId] });
  } else {
    if (!wishlist.products.some((p) => p.toString() === productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }
  }

  return getWishlist(userId);
}

async function removeItem(userId, productId) {
  const wishlist = await Wishlist.findOne({ user: userId });
  if (wishlist) {
    wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
    await wishlist.save();
  }
  return getWishlist(userId);
}

async function toggle(userId, productId) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [productId] });
    return { added: true, wishlist: await getWishlist(userId) };
  }

  const exists = wishlist.products.some((p) => p.toString() === productId);
  if (exists) {
    wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
    await wishlist.save();
    return { added: false, wishlist: await getWishlist(userId) };
  } else {
    wishlist.products.push(productId);
    await wishlist.save();
    return { added: true, wishlist: await getWishlist(userId) };
  }
}

async function moveToCart(userId, productId) {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  // Add to cart
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.items.push({ product: productId, quantity: 1, price: product.price });
  }
  await cart.save();

  // Remove from wishlist
  await removeItem(userId, productId);

  return { message: 'Item moved to cart' };
}

module.exports = { getWishlist, addItem, removeItem, toggle, moveToCart };
