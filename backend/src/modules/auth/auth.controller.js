const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const data = await service.register(req.body);
  res.status(201).json(new ApiResponse(201, data, 'Registration successful'));
});

const login = asyncHandler(async (req, res) => {
  const data = await service.login(req.body);
  res.status(200).json(new ApiResponse(200, data, 'Login successful'));
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.token || req.cookies?.refreshToken;
  const data = await service.refreshToken({ token });
  res.status(200).json(new ApiResponse(200, data, 'Token refreshed'));
});

const logout = asyncHandler(async (req, res) => {
  const data = await service.logout();
  res.status(200).json(new ApiResponse(200, data, 'Logout successful'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const data = await service.forgotPassword(req.body);
  res.status(200).json(new ApiResponse(200, data, data.message));
});

const resetPassword = asyncHandler(async (req, res) => {
  const data = await service.resetPassword(req.body);
  res.status(200).json(new ApiResponse(200, data, data.message));
});

const getMe = asyncHandler(async (req, res) => {
  const data = await service.getMe(req.user.id);
  res.status(200).json(new ApiResponse(200, data, 'Profile fetched'));
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
