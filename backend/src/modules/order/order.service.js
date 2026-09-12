const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const Product = require('../product/product.model');
const Address = require('../address/address.model');
const Coupon = require('../coupon/coupon.model');
const Payment = require('../payment/payment.model');
const Notification = require('../notification/notification.model');
const ApiError = require('../../utils/ApiError');

async function createOrder(userId, payload) {
  const { shippingAddressId, shippingAddress: directAddress, paymentProvider = 'cod', paymentMethod = 'Cash on Delivery', paymentId } = payload;

  let finalAddress = directAddress;
  if (!finalAddress && shippingAddressId) {
    const addrDoc = await Address.findOne({ _id: shippingAddressId, user: userId });
    if (!addrDoc) throw new ApiError(400, 'Selected shipping address not found');
    finalAddress = {
      fullName: addrDoc.fullName,
      phone: addrDoc.phone,
      line1: addrDoc.line1,
      line2: addrDoc.line2,
      city: addrDoc.city,
      state: addrDoc.state,
      pincode: addrDoc.pincode,
      country: addrDoc.country,
      addressType: addrDoc.addressType || 'Home',
    };
  }

  if (!finalAddress || !finalAddress.line1 || !finalAddress.city || !finalAddress.pincode) {
    throw new ApiError(400, 'Valid shipping address is required');
  }

  // Get cart
  const cart = await Cart.findOne({ user: userId }).populate('items.product').populate('coupon');
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  // Build items and calculate totals
  let subtotal = 0;
  let mrpTotal = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw new ApiError(400, `Product "${product?.name || 'Unknown'}" is no longer available`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(400, `Not enough stock available for "${product.name}"`);
    }

    const price = item.price || product.price;
    const mrp = product.mrp || price;
    subtotal += price * item.quantity;
    mrpTotal += mrp * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      variant: item.variant,
      quantity: item.quantity,
      price,
    });
  }

  const productDiscount = Math.max(0, mrpTotal - subtotal);
  let couponDiscount = 0;
  let couponCode = null;

  if (cart.coupon && cart.coupon.isActive) {
    const c = cart.coupon;
    if (c.discountType === 'percentage') {
      couponDiscount = (subtotal * c.discountValue) / 100;
      if (c.maxDiscount) couponDiscount = Math.min(couponDiscount, c.maxDiscount);
    } else if (c.discountType === 'fixed') {
      couponDiscount = Math.min(subtotal, c.discountValue);
    }
    couponCode = c.code;

    // Increment usage
    await Coupon.findByIdAndUpdate(c._id, { $inc: { usedCount: 1 } });
  }

  const isFreeDelivery = subtotal >= 500 || cart.coupon?.discountType === 'freeDelivery';
  const deliveryCharge = isFreeDelivery ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const total = Math.max(0, Math.round(subtotal - couponDiscount + deliveryCharge + tax));

  const isOnlinePayment = paymentProvider !== 'cod';
  const paymentStatus = isOnlinePayment ? 'paid' : 'pending';

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress: finalAddress,
    paymentInfo: {
      provider: paymentProvider,
      paymentId: paymentId || (isOnlinePayment ? `PAY-${Date.now()}` : undefined),
      method: paymentMethod,
      status: paymentStatus,
    },
    status: isOnlinePayment ? 'confirmed' : 'placed',
    statusHistory: [
      {
        status: isOnlinePayment ? 'confirmed' : 'placed',
        note: isOnlinePayment ? 'Order placed and payment verified' : 'Order placed via Cash on Delivery',
        at: new Date(),
      },
    ],
    subtotal,
    productDiscount,
    couponDiscount: Math.round(couponDiscount),
    couponCode,
    deliveryCharge,
    tax,
    total,
  });

  // Create payment record
  await Payment.create({
    order: order._id,
    user: userId,
    provider: paymentProvider,
    paymentId: order.paymentInfo.paymentId,
    method: paymentMethod,
    amount: total,
    status: isOnlinePayment ? 'success' : 'pending',
  }).catch(() => {});

  // Reduce product inventory
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear cart
  cart.items = [];
  cart.coupon = null;
  await cart.save();

  // Create user notification
  await Notification.create({
    user: userId,
    type: 'order',
    title: 'Order Placed Successfully!',
    message: `Your order #${order.orderNumber || order._id} for ₹${total} has been received.`,
  }).catch(() => {});

  return order;
}

async function listUserOrders(userId, query = {}) {
  const { page = 1, limit = 10 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Order.countDocuments({ user: userId });
  const orders = await Order.find({ user: userId })
    .populate('items.product', 'name slug images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
}

async function listAdminOrders(query = {}) {
  const { status, search, page = 1, limit = 20 } = query;
  const filter = {};

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'name email phone')
    .populate('items.product', 'name slug images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getById(id, user) {
  const query = { _id: id };
  if (user.role !== 'admin') {
    query.user = user.id;
  }

  const order = await Order.findOne(query)
    .populate('user', 'name email phone')
    .populate('items.product', 'name slug images brand');

  if (!order) throw new ApiError(404, 'Order not found');
  return order;
}

async function updateStatus(id, { status, note, trackingNumber }) {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, 'Order not found');

  const validStatuses = [
    'placed',
    'pending',
    'confirmed',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned',
    'refunded',
  ];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  order.status = status;
  if (status === 'delivered' && order.paymentInfo.provider === 'cod') {
    order.paymentInfo.status = 'paid';
    await Payment.findOneAndUpdate({ order: id }, { status: 'success' });
  }

  order.statusHistory.push({
    status,
    note: note || `Order marked as ${status.replace(/_/g, ' ')}`,
    at: new Date(),
  });

  await order.save();

  // Notify user
  await Notification.create({
    user: order.user,
    type: 'order',
    title: `Order Status: ${status.replace(/_/g, ' ').toUpperCase()}`,
    message: `Your order #${order.orderNumber} is now ${status.replace(/_/g, ' ')}. ${note || ''}`,
  }).catch(() => {});

  return order;
}

async function cancelOrder(id, user, { reason = 'Cancelled by user' }) {
  const query = { _id: id };
  if (user.role !== 'admin') {
    query.user = user.id;
  }

  const order = await Order.findOne(query);
  if (!order) throw new ApiError(404, 'Order not found');

  const cancellable = ['placed', 'pending', 'confirmed', 'processing'];
  if (!cancellable.includes(order.status) && user.role !== 'admin') {
    throw new ApiError(400, `Order cannot be cancelled in "${order.status}" status`);
  }

  order.status = 'cancelled';
  order.cancelReason = reason;
  order.statusHistory.push({
    status: 'cancelled',
    note: `Order cancelled: ${reason}`,
    at: new Date(),
  });

  // Restore inventory
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  await order.save();

  // Notify
  await Notification.create({
    user: order.user,
    type: 'order',
    title: 'Order Cancelled',
    message: `Your order #${order.orderNumber} has been cancelled.`,
  }).catch(() => {});

  return order;
}

module.exports = {
  createOrder,
  listUserOrders,
  listAdminOrders,
  getById,
  updateStatus,
  cancelOrder,
};
