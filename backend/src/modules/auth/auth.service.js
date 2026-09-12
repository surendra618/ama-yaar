const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const Cart = require('../cart/cart.model');
const Wishlist = require('../wishlist/wishlist.model');
const ApiError = require('../../utils/ApiError');
const { generateAccessToken, generateRefreshToken } = require('../../utils/generateTokens');
const { sendEmail } = require('../../config/mailer');
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

  const tokenPayload = { id: user._id, role: user.role, email: user.email, name: user.name };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;

  return { user: sanitizedUser, accessToken, refreshToken };
}

async function login({ email, password, role }) {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
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

  const tokenPayload = { id: user._id, role: user.role, email: user.email, name: user.name };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const sanitizedUser = user.toObject();
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

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
