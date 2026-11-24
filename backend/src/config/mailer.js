const nodemailer = require('nodemailer');
const env = require('./env');

let transporter = null;

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;

  if (!transporter) {
    const isGmail = env.smtp.host.includes('gmail.com');
    transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: { user: env.smtp.user.trim(), pass: env.smtp.pass.trim() },
            tls: { rejectUnauthorized: false },
          }
        : {
            host: env.smtp.host,
            port: env.smtp.port,
            secure: env.smtp.port === 465,
            auth: { user: env.smtp.user.trim(), pass: env.smtp.pass.trim() },
            tls: { rejectUnauthorized: false },
          }
    );
  }
  return transporter;
}

/**
 * Sends an email using configured SMTP transporter.
 */
async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.warn(`[mailer] SMTP not configured — skipped email to ${to}: "${subject}"`);
    return { skipped: true, error: 'SMTP configuration is missing in backend .env' };
  }

  try {
    const info = await t.sendMail({
      from: `"AMA-YAAR" <${env.smtp.user.trim()}>`,
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
