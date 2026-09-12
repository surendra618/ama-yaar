const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./category.service');

const list = asyncHandler(async (req, res) => {
  const items = await service.list(req.query);
  res.status(200).json(new ApiResponse(200, items));
});

const getById = asyncHandler(async (req, res) => {
  const item = await service.getByIdOrSlug(req.params.id);
  res.status(200).json(new ApiResponse(200, item));
});

const create = asyncHandler(async (req, res) => {
  const item = await service.create(req.body);
  res.status(201).json(new ApiResponse(201, item, 'Category created'));
});

const update = asyncHandler(async (req, res) => {
  const item = await service.update(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, item, 'Category updated'));
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Category deleted'));
});

module.exports = { list, getById, create, update, remove };
