const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./admin.service');

const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await service.getDashboardStats();
  res.status(200).json(new ApiResponse(200, data));
});

module.exports = { getDashboardStats };
