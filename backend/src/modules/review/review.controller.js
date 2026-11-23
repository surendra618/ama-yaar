const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./review.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.list(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const getStats = asyncHandler(async (req, res) => {
  const data = await service.getProductReviewStats(req.params.productId);
  res.status(200).json(new ApiResponse(200, data));
});

const create = asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const data = await service.create(userId, req.body);
  res.status(201).json(new ApiResponse(201, data, 'Review submitted successfully'));
});

const update = asyncHandler(async (req, res) => {
  const data = await service.update(req.params.id, req.user?.id, req.body);
  res.status(200).json(new ApiResponse(200, data, 'Review updated'));
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, null, 'Review deleted'));
});

const adminList = asyncHandler(async (req, res) => {
  const data = await service.listAdmin(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const toggleApproval = asyncHandler(async (req, res) => {
  const data = await service.toggleApproval(req.params.id);
  res.status(200).json(new ApiResponse(200, data, 'Review status updated'));
});

module.exports = {
  list,
  getStats,
  create,
  update,
  remove,
  adminList,
  toggleApproval,
};
