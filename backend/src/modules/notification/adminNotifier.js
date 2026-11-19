const Setting = require('../setting/setting.model');
const User = require('../user/user.model');
const Notification = require('./notification.model');
const { sendEmail } = require('../../config/mailer');
const env = require('../../config/env');
const { emitAdminEvent } = require('../../config/socket');

/**
 * Helper to fetch target recipient email addresses for admin notifications.
 * Defaults to all admin/superadmin emails in DB + env.adminSeed.email.
 */
async function getAdminNotificationEmails(customList = []) {
  const emails = new Set();
  
  if (Array.isArray(customList) && customList.length > 0) {
    customList.forEach((e) => {
      if (e && typeof e === 'string' && e.includes('@')) emails.add(e.trim().toLowerCase());
    });
  }

  // Also include all active registered admins
  const admins = await User.find({ role: { $in: ['admin', 'superadmin'] }, status: { $ne: 'blocked' } }).select('email');
  admins.forEach((a) => {
    if (a.email && !a.email.includes('@guest.')) emails.add(a.email.trim().toLowerCase());
  });

  if (env.adminSeed.email) {
    emails.add(env.adminSeed.email.trim().toLowerCase());
  }

  return Array.from(emails);
}

/**
 * Helper to create in-app notification for all admin users
 */
async function createAdminInAppNotification({ type, title, message }) {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('_id');
    const docs = admins.map((admin) => ({
      user: admin._id,
      type: type || 'system',
      title,
      message,
      isRead: false,
    }));
    if (docs.length > 0) {
      await Notification.insertMany(docs);
    }
  } catch (err) {
    console.error('[notifyAdmins] Error saving in-app notifications:', err.message);
  }
}

/**
 * Dispatch an admin notification if the corresponding toggle in settings is enabled.
 *
 * @param {Object} options
 * @param {'newUser' | 'newOrder' | 'orderCancelled' | 'newReturn' | 'newContact'} options.event
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.text]
 */
async function notifyAdmins({ event, subject, html, text }) {
  try {
    const settings = await Setting.findOne({ key: 'delivery' }).lean();

    // Map events to setting toggles
    const toggleMap = {
      newUser: settings?.notifyNewUser !== false, // default true
      newOrder: settings?.notifyNewOrder !== false, // default true
      orderCancelled: settings?.notifyOrderCancelled !== false,
      newReturn: settings?.notifyNewReturn !== false,
      newContact: settings?.notifyNewContact !== false,
    };

    const isEnabled = toggleMap[event];
    if (isEnabled === false) {
      console.log(`[notifyAdmins] Notification for event '${event}' is disabled in settings.`);
      return;
    }

    // In-app notification creation
    createAdminInAppNotification({
      type: event,
      title: subject,
      message: text || subject,
    }).catch(() => {});

    // Real-time WebSocket Push to all active Admin dashboards
    try {
      emitAdminEvent('new_admin_notification', {
        event,
        title: subject,
        message: text || subject,
        createdAt: new Date().toISOString(),
      });
    } catch (_) {}

    // Collect recipient emails
    const recipients = await getAdminNotificationEmails(settings?.notifyAdminEmails);
    if (!recipients.length) return;

    // Send emails in parallel (fire-and-forget, non-blocking)
    recipients.forEach((email) => {
      sendEmail({
        to: email,
        subject: `[AMA-YAAR Admin] ${subject}`,
        html,
        text,
      }).catch((err) => {
        console.error(`[notifyAdmins] Failed to send email to ${email}:`, err.message);
      });
    });
  } catch (err) {
    console.error('[notifyAdmins] Notification dispatcher error:', err.message);
  }
}

module.exports = {
  notifyAdmins,
  getAdminNotificationEmails,
  createAdminInAppNotification,
};

