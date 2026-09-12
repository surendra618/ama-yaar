const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./report.service');

const getSalesReport = asyncHandler(async (req, res) => {
  const data = await service.getSalesReport(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const getRevenueReport = asyncHandler(async (req, res) => {
  const data = await service.getRevenueReport(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const getProductPerformanceReport = asyncHandler(async (req, res) => {
  const data = await service.getProductPerformanceReport(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const getUserGrowthReport = asyncHandler(async (req, res) => {
  const data = await service.getUserGrowthReport(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

module.exports = {
  getSalesReport,
  getRevenueReport,
  getProductPerformanceReport,
  getUserGrowthReport,
};
