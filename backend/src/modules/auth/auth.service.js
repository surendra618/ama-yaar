const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const Cart = require('../cart/cart.model');
const Wishlist = require('../wishlist/wishlist.model');
const ApiError = require('../../utils/ApiError');
const { generateAccessToken, generateRefreshToken } = require('../../utils/generateTokens');
const { sendEmail } = require('../../config/mailer');
const { notifyAdmins } = require('../notification/adminNotifier');
const { newUserTemplate, emailOtpTemplate } = require('../../utils/emailTemplates');
const env = require('../../config/env');

async function register({ name, email, password, phone, role = 'customer' }) {
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone,
    role: role === 'admin' ? 'admin' : 'customer',
  });

  // Create initial empty cart and wishlist
  await Cart.create({ user: user._id, items: [] }).catch(() => {});
  await Wishlist.create({ user: user._id, products: [] }).catch(() => {});

  sendEmail({
    to: user.email,
    subject: 'Welcome to AMA-YAAR!',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4f46e5">Welcome to AMA-YAAR, ${user.name}!</h2>
        <p>Your account has been created successfully. Start exploring the latest fashion, electronics, and more.</p>
        <a href="${env.clientUrl}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px">
          Start Shopping
        </a>
      </div>
    `,
  }).catch(() => {});

  // Notify Admins about new registration with styled template
  notifyAdmins({
    event: 'newUser',
    subject: `New User Registered: ${user.name}`,
    html: newUserTemplate({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      viewUrl: `${env.adminUrl}/customers`,
    }),
    text: `New user registration: ${user.name} (${user.email}, ${user.phone || 'no phone'})`,
  }).catch(() => {});

  const isMainAdmin = user.isSuperAdmin || (user.email && user.email.toLowerCase() === (env.adminSeed.email || '').toLowerCase());
  const tokenPayload = { id: user._id, role: user.role, email: user.email, name: user.name, isSuperAdmin: isMainAdmin };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const sanitizedUser = user.toObject();
  sanitizedUser.isSuperAdmin = isMainAdmin;
  delete sanitizedUser.password;

  return { user: sanitizedUser, accessToken, refreshToken };
}

async function login({ email, password, role }) {
  if (!email || !password) {
    throw new ApiError(400, 'Email/Mobile and password are required');
  }

  const cleanInput = email.trim().toLowerCase();
  const cleanPhone = cleanInput.replace(/\D/g, '').slice(-10);

  const queryOr = [{ email: cleanInput }];
  if (cleanPhone.length === 10) {
    queryOr.push({ phone: cleanPhone });
  }

  const user = await User.findOne({ $or: queryOr }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email/mobile or password');
  }

  if (user.status === 'blocked') {
    throw new ApiError(403, 'Your account has been suspended. Please contact support.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (role === 'admin' && user.role !== 'admin') {
    throw new ApiError(403, 'Access denied: Admin credentials required');
  }

  const isMainAdmin = user.isSuperAdmin || (user.email && user.email.toLowerCase() === (env.adminSeed.email || '').toLowerCase());
  const tokenPayload = { id: user._id, role: user.role, email: user.email, name: user.name, isSuperAdmin: isMainAdmin };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const sanitizedUser = user.toObject();
  sanitizedUser.isSuperAdmin = isMainAdmin;
  delete sanitizedUser.password;

  return { user: sanitizedUser, accessToken, refreshToken };
}

async function refreshToken({ token }) {
  if (!token) throw new ApiError(401, 'Refresh token is required');

  try {
    const decoded = jwt.verify(token, env.jwt.refreshSecret);
    const user = await User.findById(decoded.id);
    if (!user || user.status === 'blocked') {
      throw new ApiError(401, 'Invalid user session');
    }

    const tokenPayload = { id: user._id, role: user.role, email: user.email, name: user.name };
    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
}

async function logout() {
  return { message: 'Logged out successfully' };
}

async function forgotPassword({ email }) {
  const user = await User.findOne({ email: email?.toLowerCase() });

  // Always return the same message whether or not the account exists, so this
  // endpoint can't be used to enumerate registered emails.
  const genericResponse = { message: 'If that email exists, a password reset link has been sent.' };
  if (!user) return genericResponse;

  const resetUrl = `${env.clientUrl}/reset-password?email=${encodeURIComponent(user.email)}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset your AMA-YAAR password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4f46e5">Password Reset Request</h2>
        <p>Hi ${user.name}, we received a request to reset your password.</p>
        <a href="${resetUrl}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px">
          Reset Password
        </a>
        <p style="margin-top:16px;color:#64748b;font-size:12px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  return genericResponse;
}

async function resetPassword({ email, newPassword }) {
  if (!email || !newPassword) {
    throw new ApiError(400, 'Email and new password are required');
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(404, 'User not found');

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  sendEmail({
    to: user.email,
    subject: 'Your AMA-YAAR password was changed',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4f46e5">Password Changed</h2>
        <p>Hi ${user.name}, your password was just changed. If this wasn't you, please contact support immediately.</p>
      </div>
    `,
  }).catch(() => {});

  return { message: 'Password reset successfully' };
}

async function getMe(userId) {
  const user = await User.findById(userId).populate('addresses');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

async function quickLogin({ email, phone, name, password }) {
  const cleanEmail = email ? email.trim().toLowerCase() : null;
  const cleanPhone = phone ? phone.trim().replace(/\D/g, '').slice(-10) : null;
  const identifierEmail = cleanEmail || (cleanPhone ? `${cleanPhone}@guest.ama-yaar.com` : `guest_${Date.now()}@ama-yaar.com`);

  const queryOr = [];
  if (cleanEmail) queryOr.push({ email: cleanEmail });
  if (cleanPhone) queryOr.push({ phone: cleanPhone });

  let user = null;
  if (queryOr.length > 0) {
    user = await User.findOne({ $or: queryOr });
  }

  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const pwdToHash = password && password.length >= 6 ? password : `quick_${Date.now()}_pwd`;
    const hashedPassword = await bcrypt.hash(pwdToHash, salt);
    user = await User.create({
      name: name || (cleanEmail ? cleanEmail.split('@')[0] : 'Customer'),
      email: identifierEmail,
      phone: cleanPhone || '',
      password: hashedPassword,
      role: 'customer',
    });
    await Cart.create({ user: user._id, items: [] }).catch(() => {});
    await Wishlist.create({ user: user._id, products: [] }).catch(() => {});

    notifyAdmins({
      event: 'newUser',
      subject: `New User Joined (Quick Login): ${user.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:540px;margin:auto;border:1px solid #e2e8f0;border-radius:8px;padding:24px;background:#ffffff">
          <h2 style="color:#4f46e5;margin-top:0">🎉 New User via Quick Login</h2>
          <div style="background:#f8fafc;border-left:4px solid #4f46e5;padding:12px 16px;margin:16px 0;border-radius:4px">
            <p style="margin:4px 0"><strong>Name:</strong> ${user.name}</p>
            <p style="margin:4px 0"><strong>Email:</strong> ${user.email}</p>
            <p style="margin:4px 0"><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
          </div>
          <a href="${env.adminUrl}/customers" style="display:inline-block;padding:10px 18px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px">
            View Customers
          </a>
        </div>
      `,
      text: `New user via Quick Login: ${user.name} (${user.email}, ${user.phone || 'no phone'})`,
    }).catch(() => {});
  } else {
    let updated = false;
    if (name && name.trim()) {
      user.name = name.trim();
      updated = true;
    }
    if (cleanEmail && (!user.email || user.email.includes('@guest.') || user.email.includes('@mobile.'))) {
      user.email = cleanEmail;
      updated = true;
    }
    if (cleanPhone && !user.phone) {
      user.phone = cleanPhone;
      updated = true;
    }
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      updated = true;
    }
    if (updated) {
      await user.save();
    }
  }

  const isMainAdmin = user.isSuperAdmin || (user.email && user.email.toLowerCase() === (env.adminSeed.email || '').toLowerCase());
  const tokenPayload = { id: user._id, role: user.role, email: user.email, name: user.name, isSuperAdmin: isMainAdmin };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const sanitizedUser = user.toObject();
  sanitizedUser.isSuperAdmin = isMainAdmin;
  delete sanitizedUser.password;

  return { user: sanitizedUser, accessToken, refreshToken };
}

async function phoneLogin({ phone, name, password, firebaseUid, idToken }) {
  if (!phone) {
    throw new ApiError(400, 'Mobile phone number is required');
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    throw new ApiError(400, 'Please enter a valid 10-digit mobile number');
  }

  // Find existing user by phone or mobile guest email
  const existingUser = await User.findOne({
    $or: [
      { phone: cleanPhone },
      { email: `${cleanPhone}@guest.ama-yaar.com` },
      { email: `${cleanPhone}@mobile.ama-yaar.com` },
    ],
  });

  const userName =
    name && name.trim()
      ? name.trim()
      : existingUser && existingUser.name && existingUser.name !== 'Customer'
      ? existingUser.name
      : `Customer ${cleanPhone.slice(-4)}`;

  const result = await quickLogin({
    phone: cleanPhone,
    name: userName,
    password: password && password.length >= 6 ? password : `ay_phone_${cleanPhone}_pwd`,
  });

  return result;
}

const otpStore = new Map();

async function sendOtp({ phone, email }) {
  if (!phone && !email) {
    throw new ApiError(400, 'Mobile number or Email address is required');
  }

  // Email OTP flow
  if (email) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new ApiError(400, 'Please enter a valid email address');
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    const isExisting = !!existingUser;

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanEmail, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send email with custom OTP template
    const mailResult = await sendEmail({
      to: cleanEmail,
      subject: `Your AMA-YAAR Verification Code: ${otp}`,
      html: emailOtpTemplate({ otp, email: cleanEmail }),
      text: `Your AMA-YAAR verification code is: ${otp}. It will expire in 10 minutes.`,
    });

    if (mailResult?.skipped && mailResult?.error) {
      console.error(`[auth.service] Email delivery failed:`, mailResult.error);
      if (mailResult.error.includes('Username and Password not accepted') || mailResult.error.includes('BadCredentials')) {
        throw new ApiError(
          500,
          'Gmail authentication failed. Please update your 16-character Google App Password in backend .env (SMTP_PASS).'
        );
      }
      throw new ApiError(500, `Failed to send verification code email: ${mailResult.error}`);
    }

    return {
      type: 'email',
      email: cleanEmail,
      isExisting,
      name: existingUser?.name || '',
      message: 'Verification code sent to your email',
    };
  }

  // Phone OTP flow
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length < 10) {
    throw new ApiError(400, 'Please enter a valid 10-digit mobile number');
  }

  const existingUser = await User.findOne({ phone: cleanPhone });
  const isExisting = !!existingUser;

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore.set(cleanPhone, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return {
    type: 'phone',
    phone: cleanPhone,
    otp,
    isExisting,
    name: existingUser?.name || '',
    email: existingUser && !existingUser.email.includes('@guest.') && !existingUser.email.includes('@mobile.') ? existingUser.email : '',
    message: 'OTP sent successfully',
  };
}

async function verifyOtp({ phone, email, otp, name, password }) {
  if ((!phone && !email) || !otp) {
    throw new ApiError(400, 'Mobile/Email and OTP are required');
  }

  const identifier = email
    ? email.trim().toLowerCase()
    : phone.replace(/\D/g, '').slice(-10);

  const record = otpStore.get(identifier);

  if (!record || record.otp !== otp.toString().trim()) {
    throw new ApiError(400, 'Invalid or expired verification code');
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(identifier);
    throw new ApiError(400, 'Verification code has expired. Please request a new one.');
  }

  otpStore.delete(identifier);

  if (email) {
    return await quickLogin({ email: identifier, name, password });
  } else {
    return await quickLogin({ phone: identifier, name, email, password });
  }
}

async function googleLogin({ email, name, avatar, googleId, phone }) {
  if (!email) {
    throw new ApiError(400, 'Google email is required');
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = await User.findOne({
    $or: [{ email: cleanEmail }, { googleId: googleId || '__none__' }],
  });

  if (!user) {
    const defaultPassword = `google_${Date.now()}_auth`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    user = await User.create({
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      avatar: avatar || '',
      googleId: googleId || '',
      phone: phone ? phone.replace(/\D/g, '') : '',
      password: hashedPassword,
      role: 'customer',
    });

    await Cart.create({ user: user._id, items: [] }).catch(() => {});
    await Wishlist.create({ user: user._id, products: [] }).catch(() => {});

    notifyAdmins({
      event: 'newUser',
      subject: `New User Joined via Google: ${user.name}`,
      html: newUserTemplate({
        name: user.name,
        email: user.email,
        phone: user.phone || 'Google Sign-In',
        role: user.role,
        viewUrl: `${env.adminUrl}/customers`,
      }),
      text: `New user via Google: ${user.name} (${user.email})`,
    }).catch(() => {});
  } else {
    let updated = false;
    if (googleId && !user.googleId) {
      user.googleId = googleId;
      updated = true;
    }
    if (avatar && !user.avatar) {
      user.avatar = avatar;
      updated = true;
    }
    if (name && (!user.name || user.name === 'Customer')) {
      user.name = name;
      updated = true;
    }
    if (phone && (!user.phone || user.phone === 'Google Sign-In')) {
      user.phone = phone.replace(/\D/g, '');
      updated = true;
    }
    if (updated) await user.save();
  }

  if (user.status === 'blocked') {
    throw new ApiError(403, 'Your account has been suspended. Please contact support.');
  }

  const isMainAdmin = user.isSuperAdmin || (user.email && user.email.toLowerCase() === (env.adminSeed.email || '').toLowerCase());
  const tokenPayload = { id: user._id, role: user.role, email: user.email, name: user.name, isSuperAdmin: isMainAdmin };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const sanitizedUser = user.toObject();
  sanitizedUser.isSuperAdmin = isMainAdmin;
  delete sanitizedUser.password;

  const cleanPhone = (sanitizedUser.phone || '').replace(/\D/g, '');
  const needsPhone = !cleanPhone || cleanPhone.length < 10 || sanitizedUser.phone === 'Google Sign-In';

  return { user: sanitizedUser, accessToken, refreshToken, needsPhone };
}

async function saveFcmToken(userId, { token }) {
  if (!token) throw new ApiError(400, 'FCM token is required');
  if (userId) {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token },
    });
  }
  return { message: 'FCM token registered successfully' };
}

module.exports = {
  register,
  login,
  quickLogin,
  phoneLogin,
  sendOtp,
  verifyOtp,
  googleLogin,
  saveFcmToken,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
