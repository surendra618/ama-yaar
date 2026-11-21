const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('./payment.model');
const Order = require('../order/order.model');
const Cart = require('../cart/cart.model');
const Product = require('../product/product.model');
const Notification = require('../notification/notification.model');
const { notifyAdmins } = require('../notification/adminNotifier');
const { newOrderTemplate } = require('../../utils/emailTemplates');
const { attributeOrderCommission } = require('../creator/creator.service');
const ApiError = require('../../utils/ApiError');
const env = require('../../config/env');

let razorpayInstance = null;
if (env.razorpay.keyId && env.razorpay.keySecret) {
  razorpayInstance = new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret,
  });
}

async function list(query = {}) {
  const { status, provider, page = 1, limit = 20 } = query;
  const filter = {};
  if (status) filter.status = status;
  if (provider) filter.provider = provider;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter)
    .populate('user', 'name email phone')
    .populate('order', 'orderNumber total status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    payments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getById(id) {
  const doc = await Payment.findById(id)
    .populate('user', 'name email')
    .populate('order');
  if (!doc) throw new ApiError(404, 'Payment record not found');
  return doc;
}

async function createPaymentOrder({ amount, currency = 'INR', receipt }) {
  const paiseAmount = Math.round(Number(amount) * 100);
  const mode = (env.paymentMode || 'fake').toLowerCase();

  // FAKE / MOCK PAYMENT MODE
  if (mode === 'fake' || mode === 'mock') {
    const mockOrderId = `order_mock_${Date.now()}`;
    return {
      id: mockOrderId,
      amount: paiseAmount,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      keyId: 'rzp_test_mock',
      isMock: true,
      mode: 'fake',
    };
  }

  // REAL PAYMENT MODE (Razorpay Gateway)
  const envKey = (env.razorpay.keyId || '').trim();
  const envSecret = (env.razorpay.keySecret || '').trim();

  if (!envKey || !envSecret) {
    throw new ApiError(500, 'Razorpay keys (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are missing in backend/.env for real payment mode.');
  }

  const client = new Razorpay({
    key_id: envKey,
    key_secret: envSecret,
  });

  try {
    const razorpayOrder = await client.orders.create({
      amount: paiseAmount,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });
    return {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      keyId: envKey,
      isMock: false,
      mode: 'real',
    };
  } catch (err) {
    console.error('Razorpay order creation failed:', err.error || err.message);
    throw new ApiError(500, `Razorpay error: ${err.error?.description || err.message}`);
  }
}

async function verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, method = 'Razorpay Online' }) {
  let isVerified = false;
  const mode = (env.paymentMode || 'fake').toLowerCase();
  const isMockOrder =
    mode === 'fake' ||
    mode === 'mock' ||
    (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) ||
    (razorpay_payment_id && razorpay_payment_id.startsWith('pay_mock_'));

  if (isMockOrder) {
    // Simulated instant verification for testing
    isVerified = true;
  } else {
    // Real Razorpay signature verification
    const envSecret = (env.razorpay.keySecret || '').trim();
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature && envSecret) {
      const generatedSignature = crypto
        .createHmac('sha256', envSecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isVerified = (generatedSignature === razorpay_signature);
    } else {
      isVerified = false;
    }
  }

  if (!isVerified) {
    throw new ApiError(400, 'Invalid payment signature. Verification failed.');
  }

  const paymentId = razorpay_payment_id || `PAY-${Date.now()}`;

  if (orderId) {
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentInfo.status = 'paid';
      order.paymentInfo.paymentId = paymentId;
      order.paymentInfo.method = method;
      order.paymentInfo.provider = 'razorpay';
      if (order.status === 'placed' || order.status === 'pending') {
        order.status = 'confirmed';
      }
      await order.save();

      await Payment.findOneAndUpdate(
        { order: orderId },
        {
          order: orderId,
          user: order.user,
          amount: order.total,
          currency: 'INR',
          provider: 'razorpay',
          method,
          paymentId,
          status: 'success',
          rawResponse: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
        },
        { upsert: true, new: true }
      );

      // Now that online payment is verified successfully, clear the user's cart
      if (order.user) {
        await Cart.findOneAndUpdate(
          { user: order.user },
          { $set: { items: [], coupon: null } }
        ).catch(() => { });
      }

      // Deduct inventory
      for (const item of (order.items || [])) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          }).catch(() => { });
        }
      }

      // Create user notification
      await Notification.create({
        user: order.user,
        type: 'order',
        title: 'Payment Successful & Order Confirmed!',
        message: `Your payment of ₹${order.total} for order #${order.orderNumber || order._id} was successful.`,
      }).catch(() => { });

      // Check creator commission attribution for verified online order
      if (order.creatorRef || order.coupon) {
        attributeOrderCommission({
          order,
          creatorCode: order.creatorRef,
          couponCode: order.coupon?.code || order.coupon,
        }).catch((err) => console.warn('Creator attribution notice on payment verify:', err.message));
      }

      // Notify Admins
      notifyAdmins({
        event: 'newOrder',
        subject: `New Paid Order: #${order.orderNumber || String(order._id).slice(-6).toUpperCase()} (₹${order.total})`,
        html: newOrderTemplate({
          orderNumber: order.orderNumber || String(order._id).slice(-6).toUpperCase(),
          customerName: order.shippingAddress?.fullName || 'Customer',
          customerPhone: order.shippingAddress?.phone || 'No phone',
          total: order.total,
          itemCount: order.items?.length || 1,
          paymentMethod: method || 'Razorpay Online',
          paymentStatus: 'paid',
          address: `${order.shippingAddress?.line1 || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || order.shippingAddress?.postalCode || ''}`,
        }),
        text: `New paid order #${order.orderNumber || order._id} (₹${order.total}) verified via Razorpay`,
      }).catch(() => { });
    }
  }

  return { verified: true, paymentId };
}

async function handleWebhook(payload) {
  return { received: true };
}

module.exports = {
  list,
  getById,
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
};
