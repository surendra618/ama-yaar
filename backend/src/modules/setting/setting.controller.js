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

module.exports = {
  getDeliverySettings,
  updateDeliverySettings,
};
