const Notification = require('./notification.model');
const ApiError = require('../../utils/ApiError');

async function list(userId) {
  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(30);
  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
  return { notifications, unreadCount };
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
  const doc = await Notification.findOneAndDelete({ _id: id, user: userId });
  if (!doc) throw new ApiError(404, 'Notification not found');
  return doc;
}

module.exports = { list, markAsRead, remove };
