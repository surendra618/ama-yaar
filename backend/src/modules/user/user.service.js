const User = require('./user.model');
const Order = require('../order/order.model');
const ApiError = require('../../utils/ApiError');

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

module.exports = { list, getById, updateProfile, updateStatus, remove };
