const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./homepageSection.service');

const getByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const bypassCache = Boolean(req.query._t || req.query.noCache);
  const data = await service.getByKey(key, bypassCache);
  res.status(200).json(new ApiResponse(200, data, `Homepage section "${key}" retrieved successfully`));
});

const updateByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { data, isActive } = req.body;
  const updated = await service.updateByKey(key, data !== undefined ? data : req.body, isActive);
  res.status(200).json(new ApiResponse(200, updated, `Homepage section "${key}" updated successfully`));
});

const listAll = asyncHandler(async (req, res) => {
  const all = await service.listAll();
  res.status(200).json(new ApiResponse(200, all, 'Homepage sections retrieved successfully'));
});

module.exports = {
  getByKey,
  updateByKey,
  listAll,
};
