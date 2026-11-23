const mongoose = require('mongoose');
const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const Product = require('../product/product.model');
const Address = require('../address/address.model');
const Coupon = require('../coupon/coupon.model');
const Payment = require('../payment/payment.model');
const Notification = require('../notification/notification.model');
const User = require('../user/user.model');
const bcrypt = require('bcryptjs');
const ApiError = require('../../utils/ApiError');
const settingService = require('../setting/setting.service');
const shiprocketService = require('../shiprocket/shiprocket.service');
const { notifyAdmins } = require('../notification/adminNotifier');
const { newOrderTemplate } = require('../../utils/emailTemplates');
const { emitAdminEvent, emitUserEvent, emitOrderEvent } = require('../../config/socket');
const {
  attributeOrderCommission,
  confirmOrderCommission,
  reverseOrderCommission,
} = require('../creator/creator.service');

async function createOrder(userId, payload) {
  const { shippingAddressId, shippingAddress: directAddress, paymentProvider = 'cod', paymentMethod = 'Cash on Delivery', paymentId } = payload;

  let finalUserId = userId;
  let finalAddress = directAddress;

  if (!finalUserId) {
    const cleanPhone = directAddress?.phone?.trim() || '';
    const cleanEmail = payload.email || (cleanPhone ? `${cleanPhone.replace(/\D/g, '')}@guest.ama-yaar.com` : `guest_${Date.now()}@ama-yaar.com`);
    let guestUser = await User.findOne({
      $or: [{ email: cleanEmail }, ...(cleanPhone ? [{ phone: cleanPhone }] : [])]
    });
    if (!guestUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(`guest_pwd_${Date.now()}`, salt);
      guestUser = await User.create({
        name: directAddress?.fullName || 'Guest Customer',
        email: cleanEmail,
        phone: cleanPhone,
        password: hashedPassword,
        role: 'customer',
      });
    }
    finalUserId = guestUser._id;
  }

  if (!finalAddress && shippingAddressId) {
    const addrDoc = await Address.findOne({ _id: shippingAddressId });
    if (addrDoc) {
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
  }

  if (!finalAddress || !finalAddress.line1 || !finalAddress.city || !finalAddress.pincode) {
    throw new ApiError(400, 'Valid shipping address is required');
  }

  // Get cart or use payload items
  let cart = finalUserId ? await Cart.findOne({ user: finalUserId }).populate('items.product').populate('coupon') : null;

  // Build items and calculate totals
  let subtotal = 0;
  let mrpTotal = 0;
  const orderItems = [];

  if (cart && cart.items && cart.items.length > 0) {
    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive) {
        throw new ApiError(400, `Product "${product?.name || 'Unknown'}" is no longer available`);
      }

      const maxStock = product.variants?.length > 0 && item.variant?.size
        ? (product.variants.find((v) => String(v.size || '').trim().toUpperCase() === String(item.variant.size || '').trim().toUpperCase())?.stock ?? product.stock)
        : product.stock;

      if (maxStock < item.quantity) {
        throw new ApiError(400, `Not enough stock available for "${product.name}"${item.variant?.size ? ` (Size: ${item.variant.size})` : ''}. Only ${maxStock} left in stock.`);
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
  } else if (payload.items && payload.items.length > 0) {
    const defaultProduct = await Product.findOne({});
    for (const item of payload.items) {
      const rawProdId = item.product?._id || item.product || item.productId || item._id;
      const isValidObjectId = rawProdId && mongoose.Types.ObjectId.isValid(rawProdId);
      let product = isValidObjectId ? await Product.findById(rawProdId) : null;
      if (!product) {
        product = defaultProduct;
      }

      const finalProductId = product?._id || (isValidObjectId ? new mongoose.Types.ObjectId(rawProdId) : new mongoose.Types.ObjectId());
      const price = Number(item.price || product?.price || 0);
      const mrp = Number(item.mrp || product?.mrp || price);
      const qty = Number(item.quantity || 1);
      subtotal += price * qty;
      mrpTotal += mrp * qty;

      orderItems.push({
        product: finalProductId,
        name: item.title || item.name || product?.name || 'Product',
        image: item.image || item.images?.[0] || product?.images?.[0] || '',
        variant: item.variant || { size: item.size || 'M' },
        quantity: qty,
        price,
      });
    }
  } else {
    throw new ApiError(400, 'Cart is empty');
  }

  const productDiscount = Math.max(0, mrpTotal - subtotal);
  let couponDiscount = 0;
  let couponCode = null;

  if (cart && cart.coupon && cart.coupon.isActive) {
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

  // Delivery charge configuration from admin settings
  let deliverySettings;
  try {
    deliverySettings = await settingService.getDeliverySettings();
  } catch {
    deliverySettings = { deliveryCharge: 49, freeDeliveryThreshold: 500, isFreeDeliveryEnabled: true, isDeliveryFeeActive: true };
  }

  const threshold = deliverySettings?.freeDeliveryThreshold ?? 500;
  const isFreeThreshold = deliverySettings?.isFreeDeliveryEnabled !== false && subtotal >= threshold;
  const isCouponFree = cart?.coupon?.discountType === 'freeDelivery';
  const feeActive = deliverySettings?.isDeliveryFeeActive !== false;
  const baseCharge = feeActive ? (deliverySettings?.deliveryCharge ?? 49) : 0;

  const isFreeDelivery = !feeActive || isFreeThreshold || isCouponFree;
  const deliveryCharge = isFreeDelivery ? 0 : baseCharge;
  const tax = Math.round(subtotal * 0.05);
  const total = Math.max(0, Math.round(subtotal - couponDiscount + deliveryCharge + tax));

  const isOnlinePayment = paymentProvider !== 'cod';
  const paymentStatus = 'pending';
  const initialOrderStatus = isOnlinePayment ? 'pending' : 'placed';

  const order = await Order.create({
    user: finalUserId,
    items: orderItems,
    shippingAddress: finalAddress,
    paymentInfo: {
      provider: paymentProvider,
      paymentId: paymentId || undefined,
      method: paymentMethod,
      status: paymentStatus,
    },
    status: initialOrderStatus,
    statusHistory: [
      {
        status: initialOrderStatus,
        note: isOnlinePayment ? 'Order initiated, awaiting online payment confirmation' : 'Order placed via Cash on Delivery',
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
    creatorRef: payload.creatorRef || undefined,
  });

  // Check creator affiliate commission attribution
  if (payload.creatorRef || couponCode) {
    attributeOrderCommission({
      order,
      creatorCode: payload.creatorRef,
      couponCode,
    }).catch((err) => console.warn('Creator attribution notice:', err.message));
  }

  // Create payment record
  await Payment.create({
    order: order._id,
    user: finalUserId,
    provider: paymentProvider,
    paymentId: order.paymentInfo.paymentId,
    method: paymentMethod,
    amount: total,
    status: 'pending',
  }).catch(() => {});

  // Reduce product inventory only for confirmed COD orders immediately.
  // For online payments, inventory is reduced upon verified payment.
  if (!isOnlinePayment) {
    for (const item of orderItems) {
      if (item.product) {
        // Decrement overall product stock
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        }).catch(() => {});

        // If item has a specific size variant, also decrement that variant's stock
        if (item.variant?.size) {
          await Product.updateOne(
            { _id: item.product, 'variants.size': item.variant.size },
            { $inc: { 'variants.$.stock': -item.quantity } }
          ).catch(() => {});
        }
      }
    }
  }

  // Clear cart only if this was an immediate success (e.g. COD)
  if (!isOnlinePayment) {
    if (cart) {
      cart.items = [];
      cart.coupon = null;
      await cart.save().catch(() => {});
    }
    if (finalUserId) {
      await Cart.findOneAndUpdate(
        { user: finalUserId },
        { $set: { items: [], coupon: null } }
      ).catch(() => {});
    }

    // Create user notification for COD
    await Notification.create({
      user: finalUserId,
      type: 'order',
      title: 'Order Placed Successfully!',
      message: `Your order #${order.orderNumber || order._id} for ₹${total} has been received.`,
    }).catch(() => {});

    // Notify Admins about new COD order
    notifyAdmins({
      event: 'newOrder',
      subject: `New Order Placed: #${order.orderNumber || String(order._id).slice(-6).toUpperCase()} (₹${total})`,
      html: newOrderTemplate({
        orderNumber: order.orderNumber || String(order._id).slice(-6).toUpperCase(),
        customerName: finalAddress?.fullName || 'Customer',
        customerPhone: finalAddress?.phone || 'No phone',
        total,
        itemCount: orderItems.length,
        paymentMethod,
        paymentStatus,
        address: `${finalAddress?.line1 || ''}, ${finalAddress?.city || ''}, ${finalAddress?.state || ''} - ${finalAddress?.postalCode || ''}`,
        viewUrl: `${process.env.ADMIN_URL || 'http://localhost:5174'}/orders/${order._id}`,
      }),
      text: `New COD order #${order.orderNumber || order._id} for ₹${total} by ${finalAddress?.fullName || 'Customer'}`,
    }).catch(() => {});
  }

  // Auto-push order to Shiprocket if enabled in settings
  if (deliverySettings?.shiprocketEnabled && deliverySettings?.shiprocketAutoCreateOrder) {
    shiprocketService.createShiprocketOrder(order._id).catch((err) => {
      console.warn('Auto Shiprocket order creation error for order', order._id, err.message);
    });
  }

  // Real-time broadcast for Admin dashboard orders list & badge
  try {
    emitAdminEvent('order_placed', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      total,
      paymentMethod,
      customerName: finalAddress?.fullName || 'Customer',
      createdAt: order.createdAt,
    });
  } catch (_) {}

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
  if (status === 'delivered') {
    if (order.paymentInfo.provider === 'cod') {
      order.paymentInfo.status = 'paid';
      await Payment.findOneAndUpdate({ order: id }, { status: 'success' });
    }
    // Confirm creator commission upon successful delivery
    confirmOrderCommission(order._id).catch((err) =>
      console.warn('Commission confirmation notice:', err.message)
    );
  } else if (['cancelled', 'returned', 'refunded'].includes(status)) {
    if (order.paymentInfo) {
      if (order.paymentInfo.status === 'pending' || order.paymentInfo.provider === 'cod') {
        order.paymentInfo.status = 'cancelled';
      }
    }
    // Reverse creator commission if order is cancelled, returned or refunded
    reverseOrderCommission(order._id, note || `Order marked as ${status}`).catch((err) =>
      console.warn('Commission reversal notice:', err.message)
    );
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

  // Real-time Push to user & live tracking room
  try {
    emitUserEvent(String(order.user), 'order_status_updated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status,
      note,
      updatedAt: new Date().toISOString(),
    });
    emitOrderEvent(String(order._id), 'order_tracking_updated', {
      orderId: order._id,
      status,
      note,
      statusHistory: order.statusHistory,
    });
  } catch (_) {}

  // If status is updated to confirmed/processing/shipped/out_for_delivery and not yet in Shiprocket, auto-push
  if (['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery'].includes(status) && !order.shiprocket?.orderId) {
    shiprocketService.createShiprocketOrder(order._id).catch((err) => {
      console.warn('Auto Shiprocket push on updateStatus error:', err.message);
    });
  }

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
  if (order.paymentInfo) {
    if (order.paymentInfo.status === 'pending' || order.paymentInfo.provider === 'cod' || (order.paymentInfo.method && order.paymentInfo.method.toLowerCase().includes('cash'))) {
      order.paymentInfo.status = 'cancelled';
    } else if (order.paymentInfo.status === 'paid') {
      order.paymentInfo.status = 'refund_pending';
    }
  }
  order.statusHistory.push({
    status: 'cancelled',
    note: `Order cancelled: ${reason}`,
    at: new Date(),
  });

  // Reverse creator commission if order is cancelled
  reverseOrderCommission(order._id, reason).catch((err) =>
    console.warn('Commission reversal on cancel notice:', err.message)
  );

  // Restore inventory
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
    if (item.variant?.size) {
      await Product.updateOne(
        { _id: item.product, 'variants.size': item.variant.size },
        { $inc: { 'variants.$.stock': item.quantity } }
      ).catch(() => {});
    }
  }

  await order.save();

  // Cancel order in Shiprocket if previously pushed
  if (order.shiprocket?.orderId) {
    shiprocketService.cancelShiprocketOrder(order._id).catch((err) => {
      console.warn('Shiprocket cancellation notice:', err.message);
    });
  }

  // Notify User
  await Notification.create({
    user: order.user,
    type: 'order',
    title: 'Order Cancelled',
    message: `Your order #${order.orderNumber} has been cancelled.`,
  }).catch(() => {});

  // Notify Admins about cancelled order
  notifyAdmins({
    event: 'orderCancelled',
    subject: `Order Cancelled: #${order.orderNumber || String(order._id).slice(-6).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:auto;border:1px solid #e2e8f0;border-radius:8px;padding:24px;background:#ffffff">
        <h2 style="color:#e11d48;margin-top:0">⚠️ Order Cancelled</h2>
        <div style="background:#fff1f2;border-left:4px solid #e11d48;padding:12px 16px;margin:16px 0;border-radius:4px">
          <p style="margin:4px 0"><strong>Order Number:</strong> #${order.orderNumber || String(order._id).slice(-6).toUpperCase()}</p>
          <p style="margin:4px 0"><strong>Reason:</strong> ${reason}</p>
          <p style="margin:4px 0"><strong>Total Amount:</strong> ₹${(order.total || 0).toLocaleString('en-IN')}</p>
        </div>
        <a href="${process.env.ADMIN_URL || 'http://localhost:5174'}/orders/${order._id}" style="display:inline-block;padding:10px 18px;background:#e11d48;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px">
          View Order
        </a>
      </div>
    `,
    text: `Order #${order.orderNumber || order._id} was cancelled. Reason: ${reason}`,
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
