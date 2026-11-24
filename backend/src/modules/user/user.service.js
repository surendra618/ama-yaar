const User = require('./user.model');
const Order = require('../order/order.model');
const ApiError = require('../../utils/ApiError');
const bcrypt = require('bcryptjs');

async function list(query = {}) {
  const { search, role, status, page = 1, limit = 20 } = query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .populate('addresses')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Augment with order count and spend stats for admin view
  const augmentedUsers = await Promise.all(
    users.map(async (u) => {
      const userObj = u.toObject();
      const orderStats = await Order.aggregate([
        { $match: { user: u._id } },
        {
          $group: {
            _id: '$user',
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
          },
        },
      ]);
      userObj.totalOrders = orderStats[0]?.totalOrders || 0;
      userObj.totalSpent = orderStats[0]?.totalSpent || 0;
      return userObj;
    })
  );

  return {
    users: augmentedUsers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getById(id) {
  const user = await User.findById(id).populate('addresses');
  if (!user) throw new ApiError(404, 'User not found');

  const orders = await Order.find({ user: id }).sort({ createdAt: -1 }).limit(10);
  const userObj = user.toObject();
  userObj.orders = orders;
  return userObj;
}

async function updateProfile(id, data) {
  const allowed = ['name', 'phone', 'avatar'];
  const updateData = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }

  if (updateData.phone !== undefined && typeof updateData.phone === 'string') {
    const cleanPhone = updateData.phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone && (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone))) {
      throw new ApiError(400, 'Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)');
    }
    updateData.phone = cleanPhone;
  }

  if (data.email !== undefined) {
    const cleanEmail = data.email ? data.email.trim().toLowerCase() : '';
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new ApiError(400, 'Please enter a valid email address');
    }
    if (
      cleanEmail.includes('@guest.') ||
      cleanEmail.includes('@mobile.') ||
      cleanEmail.endsWith('@guest.ama-yaar.com') ||
      cleanEmail.endsWith('@mobile.ama-yaar.com')
    ) {
      throw new ApiError(400, 'Please enter your actual personal or business email address');
    }

    const existingEmailUser = await User.findOne({ email: cleanEmail, _id: { $ne: id } });
    if (existingEmailUser) {
      throw new ApiError(
        400,
        'This email address is already linked with another account. Please use a different email or sign in with that email.'
      );
    }
    updateData.email = cleanEmail;
  }

  const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

async function updateStatus(id, status) {
  if (!['active', 'blocked', 'inactive'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }
  const user = await User.findByIdAndUpdate(id, { status }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

async function remove(id) {
  const doc = await User.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, 'User not found');
  return doc;
}

async function changePassword(userId, { currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new password are required');
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return { message: 'Password changed successfully' };
}

async function createAdminUser({ name, email, password, phone }) {
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    if (existing.role === 'admin') {
      throw new ApiError(409, 'User with this email is already an Admin');
    }
    // Upgrade existing customer to admin
    existing.role = 'admin';
    if (name) existing.name = name;
    if (phone) existing.phone = phone;
    const salt = await bcrypt.genSalt(10);
    existing.password = await bcrypt.hash(password, salt);
    await existing.save();
    const sanitized = existing.toObject();
    delete sanitized.password;
    return sanitized;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newAdmin = await User.create({
    name,
    email: cleanEmail,
    password: hashedPassword,
    phone,
    role: 'admin',
    isSuperAdmin: false,
    status: 'active',
  });

  const sanitized = newAdmin.toObject();
  delete sanitized.password;
  return sanitized;
}

async function updateRole(userId, newRole) {
  if (!['admin', 'customer'].includes(newRole)) {
    throw new ApiError(400, 'Invalid role');
  }
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.isSuperAdmin) {
    throw new ApiError(403, 'Cannot change role of Main Super Admin');
  }
  user.role = newRole;
  await user.save();
  const sanitized = user.toObject();
  delete sanitized.password;
  return sanitized;
}

module.exports = { list, getById, updateProfile, updateStatus, remove, changePassword, createAdminUser, updateRole };
