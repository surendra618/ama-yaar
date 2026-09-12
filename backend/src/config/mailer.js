const nodemailer = require('nodemailer');
const env = require('./env');

let transporter = null;

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465, // true for 465, false for other ports (STARTTLS)
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

/**
 * Sends an email. If SMTP isn't configured, logs a warning and no-ops instead
 * of throwing — email delivery should never break the request that triggered it.
 */
async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.warn(`[mailer] SMTP not configured — skipped email to ${to}: "${subject}"`);
    return { skipped: true };
  }

  try {
    const info = await t.sendMail({
      from: `"AMA-YAAR" <${env.smtp.user}>`,
      to,
      subject,
      text: text || html?.replace(/<[^>]+>/g, ' '),
      html,
    });
    return { skipped: false, messageId: info.messageId };
  } catch (err) {
    console.error(`[mailer] Failed to send email to ${to}:`, err.message);
    return { skipped: true, error: err.message };
  }
}

module.exports = { sendEmail };
