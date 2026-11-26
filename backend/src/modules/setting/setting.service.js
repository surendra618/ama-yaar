const Setting = require('./setting.model');
const User = require('../user/user.model');
const Subscriber = require('../newsletter/subscriber.model');
const Order = require('../order/order.model');
const { sendEmail } = require('../../config/mailer');
const env = require('../../config/env');
const {
  broadcastEmailTemplate,
  testEmailTemplate,
  customerWelcomeTemplate,
  customerOrderConfirmationTemplate,
} = require('../../utils/emailTemplates');
const ApiError = require('../../utils/ApiError');

const MAX_BROADCAST_LIMIT = 50;

async function getDeliverySettings() {
  let doc = await Setting.findOne({ key: 'delivery' });
  if (!doc) {
    doc = await Setting.create({
      key: 'delivery',
      deliveryCharge: 49,
      freeDeliveryThreshold: 500,
      isFreeDeliveryEnabled: true,
      isDeliveryFeeActive: true,
      estimatedDeliveryDays: '2-4 business days',
      exchangePolicyEnabled: true,
      exchangeDays: 7,
      exchangeCharge: 0,
      isExchangeFree: true,
      exchangePolicyText:
        'Hassle-free 7-day doorstep exchange & return. Items must be in original condition, unworn, unwashed with original brand tags attached.',
      returnPolicyText:
        'Easy returns within 7 days of delivery. Refunds are credited to the original payment mode or store credit within 24-48 hours after quality check.',
      defaultFabric: '100% Super Combed Terry Cotton',
      defaultGsm: '380 GSM Heavyweight Fabric',
      defaultFit: 'Oversized Streetwear Fit, Dropped Shoulder',
      defaultCare:
        'Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low.',
      defaultCountryOfOrigin: 'India',
      defaultStylingTip:
        'Complete the look with our Black Rugged Jeans or Cargo Pants and clean white sneakers for an effortless street vibe.',
      defaultWhatsOnPrint:
        'High-density puff and screen print with reinforced twin needle stitching.',
    });
  } else if (!doc.exchangePolicyText) {
    doc.exchangePolicyEnabled = doc.exchangePolicyEnabled ?? true;
    doc.exchangeDays = doc.exchangeDays ?? 7;
    doc.exchangeCharge = doc.exchangeCharge ?? 0;
    doc.isExchangeFree = doc.isExchangeFree ?? true;
    doc.exchangePolicyText =
      doc.exchangePolicyText ||
      'Hassle-free 7-day doorstep exchange & return. Items must be in original condition, unworn, unwashed with original brand tags attached.';
    doc.returnPolicyText =
      doc.returnPolicyText ||
      'Easy returns within 7 days of delivery. Refunds are credited to the original payment mode or store credit within 24-48 hours after quality check.';
    doc.defaultFabric = doc.defaultFabric || '100% Super Combed Terry Cotton';
    doc.defaultGsm = doc.defaultGsm || '380 GSM Heavyweight Fabric';
    doc.defaultFit = doc.defaultFit || 'Oversized Streetwear Fit, Dropped Shoulder';
    doc.defaultCare =
      doc.defaultCare ||
      'Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low.';
    doc.defaultCountryOfOrigin = doc.defaultCountryOfOrigin || 'India';
    doc.defaultStylingTip =
      doc.defaultStylingTip ||
      'Complete the look with our Black Rugged Jeans or Cargo Pants and clean white sneakers for an effortless street vibe.';
    doc.defaultWhatsOnPrint =
      doc.defaultWhatsOnPrint ||
      'High-density puff and screen print with reinforced twin needle stitching.';
    await doc.save();
  }
  return doc;
}

async function updateDeliverySettings(data = {}) {
  const update = {};

  // 1. Delivery
  if (data.deliveryCharge !== undefined) update.deliveryCharge = Math.max(0, Number(data.deliveryCharge));
  if (data.freeDeliveryThreshold !== undefined) update.freeDeliveryThreshold = Math.max(0, Number(data.freeDeliveryThreshold));
  if (data.isFreeDeliveryEnabled !== undefined) update.isFreeDeliveryEnabled = Boolean(data.isFreeDeliveryEnabled);
  if (data.isDeliveryFeeActive !== undefined) update.isDeliveryFeeActive = Boolean(data.isDeliveryFeeActive);
  if (data.estimatedDeliveryDays !== undefined) update.estimatedDeliveryDays = String(data.estimatedDeliveryDays).trim();

  // 2. Exchange Policy & Charges
  if (data.exchangePolicyEnabled !== undefined) update.exchangePolicyEnabled = Boolean(data.exchangePolicyEnabled);
  if (data.exchangeDays !== undefined) update.exchangeDays = Math.max(0, Number(data.exchangeDays));
  if (data.exchangeCharge !== undefined) update.exchangeCharge = Math.max(0, Number(data.exchangeCharge));
  if (data.isExchangeFree !== undefined) update.isExchangeFree = Boolean(data.isExchangeFree);
  if (data.exchangePolicyText !== undefined) update.exchangePolicyText = String(data.exchangePolicyText).trim();
  if (data.returnPolicyText !== undefined) update.returnPolicyText = String(data.returnPolicyText).trim();

  // 3. Product Description & Details Defaults
  if (data.defaultFabric !== undefined) update.defaultFabric = String(data.defaultFabric).trim();
  if (data.defaultGsm !== undefined) update.defaultGsm = String(data.defaultGsm).trim();
  if (data.defaultFit !== undefined) update.defaultFit = String(data.defaultFit).trim();
  if (data.defaultCare !== undefined) update.defaultCare = String(data.defaultCare).trim();
  if (data.defaultCountryOfOrigin !== undefined) update.defaultCountryOfOrigin = String(data.defaultCountryOfOrigin).trim();
  if (data.defaultStylingTip !== undefined) update.defaultStylingTip = String(data.defaultStylingTip).trim();
  if (data.defaultWhatsOnPrint !== undefined) update.defaultWhatsOnPrint = String(data.defaultWhatsOnPrint).trim();

  // Storefront Contact & Support Info
  if (data.contactPhone !== undefined) update.contactPhone = String(data.contactPhone).trim();
  if (data.contactPhoneHours !== undefined) update.contactPhoneHours = String(data.contactPhoneHours).trim();
  if (data.contactEmail !== undefined) update.contactEmail = String(data.contactEmail).trim();
  if (data.contactEmailNote !== undefined) update.contactEmailNote = String(data.contactEmailNote).trim();
  if (data.contactAddress !== undefined) update.contactAddress = String(data.contactAddress).trim();
  if (data.contactHours !== undefined) update.contactHours = String(data.contactHours).trim();
  if (data.contactHoursNote !== undefined) update.contactHoursNote = String(data.contactHoursNote).trim();

  // 4. Shiprocket Logistics Integration
  if (data.shiprocketEnabled !== undefined) update.shiprocketEnabled = Boolean(data.shiprocketEnabled);
  if (data.shiprocketEmail !== undefined) update.shiprocketEmail = String(data.shiprocketEmail).trim();
  if (data.shiprocketPassword !== undefined) update.shiprocketPassword = String(data.shiprocketPassword).trim();
  if (data.shiprocketToken !== undefined) update.shiprocketToken = String(data.shiprocketToken).trim();
  if (data.shiprocketPickupLocation !== undefined) update.shiprocketPickupLocation = String(data.shiprocketPickupLocation).trim();
  if (data.shiprocketSenderPincode !== undefined) update.shiprocketSenderPincode = String(data.shiprocketSenderPincode).trim();
  if (data.shiprocketAutoCreateOrder !== undefined) update.shiprocketAutoCreateOrder = Boolean(data.shiprocketAutoCreateOrder);
  if (data.shiprocketAutoGenerateAwb !== undefined) update.shiprocketAutoGenerateAwb = Boolean(data.shiprocketAutoGenerateAwb);
  if (data.defaultPackageWeight !== undefined) update.defaultPackageWeight = Math.max(0.05, Number(data.defaultPackageWeight));
  if (data.defaultPackageLength !== undefined) update.defaultPackageLength = Math.max(1, Number(data.defaultPackageLength));
  if (data.defaultPackageBreadth !== undefined) update.defaultPackageBreadth = Math.max(1, Number(data.defaultPackageBreadth));
  if (data.defaultPackageHeight !== undefined) update.defaultPackageHeight = Math.max(1, Number(data.defaultPackageHeight));
  if (data.shiprocketWebhookSecret !== undefined) update.shiprocketWebhookSecret = String(data.shiprocketWebhookSecret).trim();

  // 5. Admin Email & In-App Notification Preferences
  if (data.notifyNewUser !== undefined) update.notifyNewUser = Boolean(data.notifyNewUser);
  if (data.notifyNewOrder !== undefined) update.notifyNewOrder = Boolean(data.notifyNewOrder);
  if (data.notifyOrderCancelled !== undefined) update.notifyOrderCancelled = Boolean(data.notifyOrderCancelled);
  if (data.notifyNewReturn !== undefined) update.notifyNewReturn = Boolean(data.notifyNewReturn);
  if (data.notifyNewContact !== undefined) update.notifyNewContact = Boolean(data.notifyNewContact);
  if (data.notifyLowStock !== undefined) update.notifyLowStock = Boolean(data.notifyLowStock);
  if (data.notifyAdminEmails !== undefined) {
    if (Array.isArray(data.notifyAdminEmails)) {
      update.notifyAdminEmails = data.notifyAdminEmails.map((e) => String(e).trim().toLowerCase()).filter(Boolean);
    } else if (typeof data.notifyAdminEmails === 'string') {
      update.notifyAdminEmails = data.notifyAdminEmails
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.includes('@'));
    }
  }

  // 6. Customer Automated Email Preferences
  if (data.customerWelcomeEmail !== undefined) update.customerWelcomeEmail = Boolean(data.customerWelcomeEmail);
  if (data.customerOrderConfirmationEmail !== undefined) update.customerOrderConfirmationEmail = Boolean(data.customerOrderConfirmationEmail);
  if (data.customerOrderStatusEmail !== undefined) update.customerOrderStatusEmail = Boolean(data.customerOrderStatusEmail);

  const doc = await Setting.findOneAndUpdate(
    { key: 'delivery' },
    { $set: update },
    { new: true, upsert: true }
  );
  return doc;
}

/**
 * Fetch overview stats for audience & email system
 */
async function getEmailStats() {
  const users = await User.find({
    status: { $ne: 'blocked' },
    email: { $not: /@guest\.|@mobile\./i },
  }).select('email');

  const subscribers = await Subscriber.find({ status: 'active' }).select('email');

  const uniqueEmails = new Set();
  users.forEach((u) => {
    if (u.email && u.email.includes('@') && u.email.includes('.')) uniqueEmails.add(u.email.toLowerCase().trim());
  });
  subscribers.forEach((s) => {
    if (s.email && s.email.includes('@') && s.email.includes('.')) uniqueEmails.add(s.email.toLowerCase().trim());
  });

  const setting = await Setting.findOne({ key: 'delivery' }).lean();

  const smtpUser = env.smtp?.user ? String(env.smtp.user).trim() : '';
  const maskedSmtpUser = smtpUser ? smtpUser.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '***' + c) : 'Not Configured';

  return {
    totalAudience: uniqueEmails.size,
    totalCustomers: users.length,
    totalSubscribers: subscribers.length,
    smtpConfigured: Boolean(env.smtp?.host && env.smtp?.user && env.smtp?.pass),
    smtpUser: maskedSmtpUser,
    broadcastLimit: MAX_BROADCAST_LIMIT,
    notifyAdminEmails: setting?.notifyAdminEmails || [],
    customerWelcomeEmail: setting?.customerWelcomeEmail ?? true,
    customerOrderConfirmationEmail: setting?.customerOrderConfirmationEmail ?? true,
    customerOrderStatusEmail: setting?.customerOrderStatusEmail ?? true,
  };
}

/**
 * Send Test Email to verify SMTP configuration
 */
async function sendTestEmail({ to, type = 'system' }) {
  if (!to || !to.includes('@') || !to.includes('.')) {
    throw new ApiError(400, 'Please provide a valid recipient email address for test email.');
  }

  const cleanTo = to.trim().toLowerCase();
  let subject = '🚀 AMA-YAAR Email System Test: Operational';
  let html = testEmailTemplate({ toEmail: cleanTo, senderEmail: env.smtp?.user });

  if (type === 'welcome') {
    subject = 'Welcome to AMA-YAAR! (Test Preview)';
    html = customerWelcomeTemplate({
      name: 'Valued Customer',
      email: cleanTo,
      storeUrl: env.clientUrl || 'https://amayaar.in',
    });
  } else if (type === 'order') {
    subject = 'Order Confirmed: #AY-TEST99 (Test Preview)';
    html = customerOrderConfirmationTemplate({
      order: {
        orderNumber: 'AY-TEST99',
        totalAmount: 1899,
        paymentStatus: 'PAID',
        shippingAddress: {
          fullName: 'Test Customer',
          addressLine1: 'Flat 402, Streetwear Residency, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          phone: '9876543210',
        },
        items: [
          {
            title: 'Vintage Acid Wash Oversized Hoodie',
            size: 'XL',
            quantity: 1,
            price: 1899,
          },
        ],
      },
      storeUrl: env.clientUrl || 'https://amayaar.in',
    });
  }

  const result = await sendEmail({
    to: cleanTo,
    subject,
    html,
  });

  if (result?.skipped && result?.error) {
    throw new ApiError(500, `Failed to send test email: ${result.error}`);
  }

  return {
    success: true,
    to: cleanTo,
    type,
    messageId: result.messageId,
    message: `Test email successfully dispatched to ${cleanTo}!`,
  };
}

/**
 * Broadcast an email to selected audience (capped at MAX_BROADCAST_LIMIT to protect Gmail limits)
 */
async function broadcastEmail({
  subject,
  title,
  message,
  badge = 'COMMUNITY DROP',
  actionLabel,
  actionUrl,
  recipientType = 'all',
  customEmails = '',
}) {
  if (!subject || !subject.trim()) {
    throw new ApiError(400, 'Campaign subject is required');
  }
  if (!title || !title.trim()) {
    throw new ApiError(400, 'Campaign title / headline is required');
  }
  if (!message || !message.trim()) {
    throw new ApiError(400, 'Campaign message content is required');
  }

  const emailSet = new Set();

  if (recipientType === 'custom') {
    const rawList = Array.isArray(customEmails) ? customEmails : String(customEmails || '').split(/[,\n]/);
    rawList.forEach((e) => {
      const em = String(e).trim().toLowerCase();
      if (em.includes('@') && em.includes('.')) emailSet.add(em);
    });
    if (emailSet.size === 0) {
      throw new ApiError(400, 'Please enter at least one valid recipient email address for custom broadcast.');
    }
  } else {
    if (['all', 'customers', 'buyers'].includes(recipientType)) {
      let userQuery = { status: { $ne: 'blocked' }, email: { $not: /@guest\.|@mobile\./i } };
      if (recipientType === 'buyers') {
        const buyerIds = await Order.distinct('user', { status: { $in: ['placed', 'confirmed', 'processing', 'shipped', 'delivered'] } });
        userQuery._id = { $in: buyerIds };
      }
      const users = await User.find(userQuery).select('email').lean();
      users.forEach((u) => {
        if (u.email && u.email.includes('@') && u.email.includes('.')) emailSet.add(u.email.toLowerCase().trim());
      });
    }

    if (['all', 'subscribers'].includes(recipientType)) {
      const subscribers = await Subscriber.find({ status: 'active' }).select('email').lean();
      subscribers.forEach((s) => {
        if (s.email && s.email.includes('@') && s.email.includes('.')) emailSet.add(s.email.toLowerCase().trim());
      });
    }
  }

  const allEligible = Array.from(emailSet);
  if (allEligible.length === 0) {
    throw new ApiError(400, 'No recipients found for the selected audience.');
  }

  // Safety Limit: Enforce maximum of MAX_BROADCAST_LIMIT (50) emails per broadcast batch
  const isCapped = allEligible.length > MAX_BROADCAST_LIMIT;
  const targetRecipients = allEligible.slice(0, MAX_BROADCAST_LIMIT);

  const actionBtn = actionLabel && actionUrl ? { label: actionLabel.trim(), url: actionUrl.trim(), color: '#090d16' } : null;

  const html = broadcastEmailTemplate({
    title: title.trim(),
    message: message.trim(),
    badge: badge ? badge.trim() : 'COMMUNITY DROP',
    actionBtn,
  });

  let sentCount = 0;
  let failedCount = 0;
  const errors = [];

  for (const email of targetRecipients) {
    try {
      const res = await sendEmail({
        to: email,
        subject: subject.trim(),
        html,
        text: `${title}\n\n${message}`,
      });
      if (res?.skipped) {
        failedCount++;
        errors.push({ email, error: res.error });
      } else {
        sentCount++;
      }
    } catch (err) {
      failedCount++;
      errors.push({ email, error: err.message });
    }
    // Throttle 200ms delay to keep within safe burst rates
    await new Promise((r) => setTimeout(r, 200));
  }

  return {
    totalRequested: allEligible.length,
    totalTargeted: targetRecipients.length,
    sentCount,
    failedCount,
    isCapped,
    limitApplied: MAX_BROADCAST_LIMIT,
    recipientsPreview: targetRecipients.slice(0, 5),
    errors: errors.slice(0, 5),
    message: isCapped
      ? `Broadcast dispatched to ${sentCount} recipients (capped at safety limit of ${MAX_BROADCAST_LIMIT} per batch).`
      : `Broadcast successfully dispatched to ${sentCount} recipients.`,
  };
}

module.exports = {
  getDeliverySettings,
  updateDeliverySettings,
  getEmailStats,
  sendTestEmail,
  broadcastEmail,
};
