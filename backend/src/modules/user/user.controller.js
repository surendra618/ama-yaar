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

const changePassword = asyncHandler(async (req, res) => {
  const result = await service.changePassword(req.user.id, req.body);
  res.status(200).json(new ApiResponse(200, result, 'Password changed successfully'));
});

const createAdmin = asyncHandler(async (req, res) => {
  const isAllowed = req.user.isSuperAdmin || req.user.role === 'admin' || (req.user.email && req.user.email.toLowerCase() === (process.env.ADMIN_SEED_EMAIL || '').toLowerCase());
  if (!isAllowed) {
    res.status(403).json(new ApiResponse(403, null, 'Access denied: Admin access required to add team members'));
    return;
  }
  const item = await service.createAdminUser(req.body);
  res.status(201).json(new ApiResponse(201, item, 'Admin added successfully'));
});

const updateRole = asyncHandler(async (req, res) => {
  const isAllowed = req.user.isSuperAdmin || req.user.role === 'admin' || (req.user.email && req.user.email.toLowerCase() === (process.env.ADMIN_SEED_EMAIL || '').toLowerCase());
  if (!isAllowed) {
    res.status(403).json(new ApiResponse(403, null, 'Access denied: Admin access required to modify roles'));
    return;
  }
  const item = await service.updateRole(req.params.id, req.body.role);
  res.status(200).json(new ApiResponse(200, item, 'User role updated'));
});

module.exports = { list, getById, getProfile, updateProfile, updateStatus, remove, changePassword, createAdmin, updateRole };
