const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./user.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.list(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const getById = asyncHandler(async (req, res) => {
  const item = await service.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, item));
});

const getProfile = asyncHandler(async (req, res) => {
  const item = await service.getById(req.user.id);
  res.status(200).json(new ApiResponse(200, item));
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.role === 'admin' && req.params.id ? req.params.id : req.user.id;
  const item = await service.updateProfile(userId, req.body);
  res.status(200).json(new ApiResponse(200, item, 'Profile updated'));
});

const updateStatus = asyncHandler(async (req, res) => {
  const item = await service.updateStatus(req.params.id, req.body.status);
  res.status(200).json(new ApiResponse(200, item, `User status updated to ${req.body.status}`));
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'User deleted'));
});

module.exports = { list, getById, getProfile, updateProfile, updateStatus, remove };
