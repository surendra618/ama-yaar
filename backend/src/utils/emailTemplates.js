/**
 * Premium HTML Email Template Generator for AMA-YAAR Notifications
 */

const BRAND_NAME = 'AMA-YAAR';
// Cloudinary or live CDN URL for reliable image rendering across all email clients
const LOGO_URL = 'https://res.cloudinary.com/j32ielua/image/upload/v1730184000/logo_black.png'; 

function getBaseTemplate({ previewText = '', title = '', badge = 'ADMIN ALERT', badgeColor = '#4f46e5', contentHtml = '', actionBtn = null }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #0b0f19; padding: 40px 0; }
    .main-card { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3); }
    .header-bar { background: linear-gradient(135deg, #090d16 0%, #1e1b4b 100%); padding: 32px 36px; text-align: center; border-bottom: 2px solid #facc15; }
    .brand-logo-text { color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
    .brand-subtext { color: #facc15; font-size: 10px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }
    .content-body { padding: 36px 36px 28px; }
    .badge { display: inline-block; padding: 4px 12px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; border-radius: 9999px; background-color: ${badgeColor}15; color: ${badgeColor}; border: 1px solid ${badgeColor}30; margin-bottom: 16px; }
    .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 16px; line-height: 1.3; }
    .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-weight: 600; }
    .info-value { color: #0f172a; font-weight: 700; text-align: right; }
    .btn-action { display: inline-block; padding: 14px 28px; background-color: #090d16; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .footer { text-align: center; padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <div class="main-card">
            
            <!-- Brand Header with Logo / Wordmark -->
            <div class="header-bar">
              <table role="presentation" width="100%">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;padding:8px 18px;background:rgba(255,255,255,0.06);border-radius:12px;border:1px solid rgba(255,255,255,0.1)">
                      <h1 class="brand-logo-text">AMA<span style="color:#facc15">·</span>YAAR</h1>
                      <div class="brand-subtext">STREETWEAR STUDIO</div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Body -->
            <div class="content-body">
              <div class="badge">${badge}</div>
              <h2 class="title">${title}</h2>
              
              ${contentHtml}

              ${actionBtn ? `
                <div style="margin-top: 28px; text-align: center;">
                  <a href="${actionBtn.url}" class="btn-action" style="background:${actionBtn.color || '#090d16'};color:#ffffff">
                    ${actionBtn.label} &rarr;
                  </a>
                </div>
              ` : ''}
            </div>

            <!-- Footer -->
            <div class="footer">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #64748b;">
                AMA-YAAR Automated Store Notification System
              </p>
              <p style="margin: 0;">
                You received this because your email is configured as an Administrator on 
                <a href="https://amayaar.in" style="color: #6366f1; text-decoration: none;">amayaar.in</a>
              </p>
            </div>

          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
}

/**
 * Generate Template for New User Registration
 */
function newUserTemplate({ name, email, phone, role = 'Customer', source = 'Store Website', viewUrl = '#' }) {
  const contentHtml = `
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
      A new customer account has just been registered on <strong>AMA-YAAR</strong>. Here are the account profile details:
    </p>

    <div class="info-box">
      <table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="color:#64748b;font-weight:600;padding:8px 0;">Customer Name</td>
          <td align="right" style="color:#0f172a;font-weight:700;padding:8px 0;">${name || 'Anonymous User'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="color:#64748b;font-weight:600;padding:8px 0;">Email Address</td>
          <td align="right" style="color:#4f46e5;font-weight:700;padding:8px 0;">${email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="color:#64748b;font-weight:600;padding:8px 0;">Mobile Number</td>
          <td align="right" style="color:#0f172a;font-weight:700;padding:8px 0;">${phone || 'Not Provided'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="color:#64748b;font-weight:600;padding:8px 0;">Assigned Role</td>
          <td align="right" style="color:#059669;font-weight:700;padding:8px 0;">${role.toUpperCase()}</td>
        </tr>
        <tr>
          <td style="color:#64748b;font-weight:600;padding:8px 0;">Registration Date</td>
          <td align="right" style="color:#0f172a;font-weight:700;padding:8px 0;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</td>
        </tr>
      </table>
    </div>

    <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px;font-size:13px;color:#1e40af;margin-top:16px;">
      💡 <strong>Pro Tip:</strong> You can manage customer orders, promote them to Admin, or review their activity directly from the admin dashboard.
    </div>
  `;

  return getBaseTemplate({
    previewText: `New customer registered: ${name} (${email})`,
    title: `🎉 New Customer Signed Up!`,
    badge: 'NEW REGISTRATION',
    badgeColor: '#4f46e5',
    contentHtml,
    actionBtn: {
      label: 'View in Admin Panel',
      url: viewUrl,
      color: '#4f46e5',
    },
  });
}

/**
 * Generate Template for New Order Placed
 */
function newOrderTemplate({ orderNumber, customerName, customerPhone, total, itemCount, paymentMethod, paymentStatus, address, viewUrl = '#' }) {
  const contentHtml = `
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
      Ka-ching! A new customer order has been placed on <strong>AMA-YAAR</strong>.
    </p>

    <div class="info-box">
      <table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="color:#64748b;font-weight:600;padding:8px 0;">Order Number</td>
          <td align="right" style="color:#059669;font-weight:800;font-size:15px;padding:8px 0;">#${orderNumber}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="color:#64748b;font-weight:600;padding:8px 0;">Grand Total</td>
          <td align="right" style="color:#0f172a;font-weight:900;font-size:16px;padding:8px 0;">₹${Number(total).toLocaleString('en-IN')}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="color:#64748b;font-weight:600;padding:8px 0;">Customer</td>
          <td align="right" style="color:#0f172a;font-weight:700;padding:8px 0;">${customerName} (${customerPhone || 'No Phone'})</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="color:#64748b;font-weight:600;padding:8px 0;">Total Items</td>
          <td align="right" style="color:#0f172a;font-weight:700;padding:8px 0;">${itemCount} Item(s)</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="color:#64748b;font-weight:600;padding:8px 0;">Payment</td>
          <td align="right" style="color:#0f172a;font-weight:700;padding:8px 0;">${paymentMethod} <span style="font-size:11px;padding:2px 6px;border-radius:4px;background:#e2e8f0">${paymentStatus?.toUpperCase()}</span></td>
        </tr>
        <tr>
          <td style="color:#64748b;font-weight:600;padding:8px 0;">Shipping To</td>
          <td align="right" style="color:#475569;font-size:12px;font-weight:600;max-width:260px;padding:8px 0;">${address || 'Address provided on checkout'}</td>
        </tr>
      </table>
    </div>
  `;

  return getBaseTemplate({
    previewText: `New order #${orderNumber} received for ₹${total}`,
    title: `🛍️ New Order Received: ₹${Number(total).toLocaleString('en-IN')}`,
    badge: 'NEW ORDER',
    badgeColor: '#059669',
    contentHtml,
    actionBtn: {
      label: 'Fulfill & View Order',
      url: viewUrl,
      color: '#059669',
    },
  });
}

module.exports = {
  getBaseTemplate,
  newUserTemplate,
  newOrderTemplate,
};

