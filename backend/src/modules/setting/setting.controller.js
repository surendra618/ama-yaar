const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const settingService = require('./setting.service');

const getDeliverySettings = asyncHandler(async (req, res) => {
  const settings = await settingService.getDeliverySettings();
  res.status(200).json(new ApiResponse(200, settings, 'Delivery settings fetched successfully'));
});

const updateDeliverySettings = asyncHandler(async (req, res) => {
  const settings = await settingService.updateDeliverySettings(req.body);
  res.status(200).json(new ApiResponse(200, settings, 'Delivery settings updated successfully'));
});

const getEmailStats = asyncHandler(async (req, res) => {
  const stats = await settingService.getEmailStats();
  res.status(200).json(new ApiResponse(200, stats, 'Email statistics fetched successfully'));
});

const sendTestEmail = asyncHandler(async (req, res) => {
  const recipient = req.body.to || req.user?.email;
  const result = await settingService.sendTestEmail({
    to: recipient,
    type: req.body.type || 'system',
  });
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const broadcastEmail = asyncHandler(async (req, res) => {
  const result = await settingService.broadcastEmail(req.body);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

module.exports = {
  getDeliverySettings,
  updateDeliverySettings,
  getEmailStats,
  sendTestEmail,
  broadcastEmail,
};
