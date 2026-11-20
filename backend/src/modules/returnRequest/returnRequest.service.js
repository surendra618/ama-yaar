const ReturnRequest = require('./returnRequest.model');
const Order = require('../order/order.model');
const Notification = require('../notification/notification.model');
const ApiError = require('../../utils/ApiError');
const { notifyAdmins } = require('../notification/adminNotifier');

async function list(user, query = {}) {
  const { status, page = 1, limit = 20 } = query;
  const filter = {};
  if (user.role !== 'admin') {
    filter.user = user.id;
  }
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await ReturnRequest.countDocuments(filter);
  const returns = await ReturnRequest.find(filter)
    .populate('user', 'name email phone')
    .populate('order')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    returns,
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
  if (user.role !== 'admin') query.user = user.id;

  const doc = await ReturnRequest.findOne(query)
    .populate('user', 'name email phone')
    .populate('order');
  if (!doc) throw new ApiError(404, 'Return request not found');
  return doc;
}

async function create(userId, data) {
  const { orderId, orderItemId, reason, comment, images } = data;
  if (!orderId || !reason) {
    throw new ApiError(400, 'Order ID and return reason are required');
  }

  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new ApiError(404, 'Order not found');

  const item = order.items.find((i) => i._id.toString() === orderItemId) || order.items[0];
  const refundAmount = item ? item.price * item.quantity : order.total;

  const returnReq = await ReturnRequest.create({
    order: orderId,
    orderItem: item?._id || order.items[0]._id,
    user: userId,
    reason,
    comment,
    images: images || [],
    status: 'requested',
    refundAmount,
  });

  await Notification.create({
    user: userId,
    type: 'return',
    title: 'Return Request Submitted',
    message: `Your return request for order #${order.orderNumber || order._id} has been received and is under review.`,
  }).catch(() => {});

  // Notify Admins about return request
  notifyAdmins({
    event: 'newReturn',
    subject: `New Return Request: #${order.orderNumber || String(order._id).slice(-6).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:auto;border:1px solid #e2e8f0;border-radius:8px;padding:24px;background:#ffffff">
        <h2 style="color:#d97706;margin-top:0">🔄 New Return / Exchange Request</h2>
        <div style="background:#fffbeb;border-left:4px solid #d97706;padding:12px 16px;margin:16px 0;border-radius:4px">
          <p style="margin:4px 0"><strong>Order Number:</strong> #${order.orderNumber || String(order._id).slice(-6).toUpperCase()}</p>
          <p style="margin:4px 0"><strong>Reason:</strong> ${reason}</p>
          <p style="margin:4px 0"><strong>Comment:</strong> ${comment || 'No comment provided'}</p>
          <p style="margin:4px 0"><strong>Estimated Refund:</strong> ₹${refundAmount}</p>
        </div>
        <a href="${process.env.ADMIN_URL || 'http://localhost:5174'}/returns/${returnReq._id}" style="display:inline-block;padding:10px 18px;background:#d97706;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px">
          Review Return
        </a>
      </div>
    `,
    text: `New return request for order #${order.orderNumber || order._id}. Reason: ${reason}`,
  }).catch(() => {});

  return returnReq;
}

async function updateStatus(id, { status, refundAmount, adminComment }) {
  const valid = ['requested', 'approved', 'rejected', 'picked_up', 'verified', 'refunded'];
  if (!valid.includes(status)) throw new ApiError(400, 'Invalid status');

  const updateData = { status };
  if (refundAmount !== undefined) updateData.refundAmount = refundAmount;
  if (status === 'refunded') updateData.refundStatus = 'processed';

  const doc = await ReturnRequest.findByIdAndUpdate(id, updateData, { new: true })
    .populate('user', 'name email')
    .populate('order', 'orderNumber');
  if (!doc) throw new ApiError(404, 'Return request not found');

  // Notify user
  await Notification.create({
    user: doc.user._id,
    type: 'return',
    title: `Return Request: ${status.replace(/_/g, ' ').toUpperCase()}`,
    message: `Your return request for order #${doc.order?.orderNumber || doc.order} is now ${status.replace(/_/g, ' ')}. ${adminComment || ''}`,
  }).catch(() => {});

  return doc;
}

module.exports = { list, getById, create, updateStatus };
