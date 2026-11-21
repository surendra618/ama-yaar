const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./creator.service');

const apply = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const data = await service.applyCreator({
    userId,
    payload: req.body,
  });
  res.status(201).json(new ApiResponse(201, data, 'Creator application submitted successfully'));
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const data = await service.getCreatorProfile(userId);
  res.status(200).json(new ApiResponse(200, data));
});

const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const data = await service.getCreatorDashboard(userId);
  res.status(200).json(new ApiResponse(200, data));
});

const track = asyncHandler(async (req, res) => {
  const data = await service.trackClick({
    creatorCode: req.body.ref || req.query.ref,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    sourceUrl: req.body.sourceUrl,
    targetUrl: req.body.targetUrl,
  });
  res.status(200).json(new ApiResponse(200, data, 'Click tracked'));
});

const updateBank = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const data = await service.updateBankDetails(userId, req.body);
  res.status(200).json(new ApiResponse(200, data, 'Bank details updated'));
});

const requestPayout = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const data = await service.requestPayout(userId, req.body.amount);
  res.status(201).json(new ApiResponse(201, data, 'Payout requested successfully'));
});

// Admin Controllers
const listAdmin = asyncHandler(async (req, res) => {
  const data = await service.listCreatorsAdmin(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const updateStatusAdmin = asyncHandler(async (req, res) => {
  const data = await service.updateCreatorStatusAdmin(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, data, 'Creator status updated'));
});

const listPayoutsAdmin = asyncHandler(async (req, res) => {
  const data = await service.listPayoutsAdmin(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const processPayoutAdmin = asyncHandler(async (req, res) => {
  const data = await service.processPayoutAdmin(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, data, 'Payout processed'));
});

module.exports = {
  apply,
  getProfile,
  getDashboard,
  track,
  updateBank,
  requestPayout,
  listAdmin,
  updateStatusAdmin,
  listPayoutsAdmin,
  processPayoutAdmin,
};
