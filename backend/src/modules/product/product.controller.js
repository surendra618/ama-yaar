const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./product.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.list(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const getById = asyncHandler(async (req, res) => {
  const item = await service.getByIdOrSlug(req.params.id);
  res.status(200).json(new ApiResponse(200, item));
});

const getFilterOptions = asyncHandler(async (req, res) => {
  const data = await service.getFilterOptions(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const create = asyncHandler(async (req, res) => {
  const item = await service.create(req.body);
  res.status(201).json(new ApiResponse(201, item, 'Product created'));
});

const update = asyncHandler(async (req, res) => {
  const item = await service.update(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, item, 'Product updated'));
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Product deleted'));
});

module.exports = { list, getById, getFilterOptions, create, update, remove };
