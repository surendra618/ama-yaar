const Notification = require('./notification.model');
const ApiError = require('../../utils/ApiError');

async function list(userId, query = {}) {
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
  const page = Math.max(1, Number(query.page) || 1);
  const skip = (page - 1) * limit;

  const filter = { user: userId };
  if (query.unread === 'true') filter.isRead = false;
  if (query.type) filter.type = query.type;

  const total = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

async function markAsRead(userId, notificationId) {
  if (notificationId === 'all') {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read' };
  }

  const doc = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
  if (!doc) throw new ApiError(404, 'Notification not found');
  return doc;
}

async function remove(userId, id) {
  if (id === 'all') {
    await Notification.deleteMany({ user: userId });
    return { message: 'All notifications deleted' };
  }
  const doc = await Notification.findOneAndDelete({ _id: id, user: userId });
  if (!doc) throw new ApiError(404, 'Notification not found');
  return doc;
}

module.exports = { list, markAsRead, remove };
