const Address = require('./address.model');
const User = require('../user/user.model');
const ApiError = require('../../utils/ApiError');

async function list(userId) {
  return Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
}

async function getById(id, userId) {
  const doc = await Address.findOne({ _id: id, user: userId });
  if (!doc) throw new ApiError(404, 'Address not found');
  return doc;
}

async function create(userId, data) {
  // If marked as default, unset other defaults
  if (data.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  } else {
    // If first address, make it default automatically
    const count = await Address.countDocuments({ user: userId });
    if (count === 0) data.isDefault = true;
  }

  const address = await Address.create({ ...data, user: userId });
  await User.findByIdAndUpdate(userId, { $addToSet: { addresses: address._id } });
  return address;
}

async function update(id, userId, data) {
  if (data.isDefault) {
    await Address.updateMany({ user: userId, _id: { $ne: id } }, { isDefault: false });
  }

  const doc = await Address.findOneAndUpdate(
    { _id: id, user: userId },
    data,
    { new: true, runValidators: true }
  );
  if (!doc) throw new ApiError(404, 'Address not found');
  return doc;
}

async function setDefault(id, userId) {
  await Address.updateMany({ user: userId }, { isDefault: false });
  const doc = await Address.findOneAndUpdate(
    { _id: id, user: userId },
    { isDefault: true },
    { new: true }
  );
  if (!doc) throw new ApiError(404, 'Address not found');
  return doc;
}

async function remove(id, userId) {
  const doc = await Address.findOneAndDelete({ _id: id, user: userId });
  if (!doc) throw new ApiError(404, 'Address not found');
  await User.findByIdAndUpdate(userId, { $pull: { addresses: id } });

  // If the deleted address was default, make the most recent one default
  if (doc.isDefault) {
    const nextAddr = await Address.findOne({ user: userId }).sort({ createdAt: -1 });
    if (nextAddr) {
      nextAddr.isDefault = true;
      await nextAddr.save();
    }
  }

  return doc;
}

module.exports = { list, getById, create, update, setDefault, remove };
