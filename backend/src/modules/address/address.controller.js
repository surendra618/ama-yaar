const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./address.service');

const list = asyncHandler(async (req, res) => {
  const items = await service.list(req.user.id);
  res.status(200).json(new ApiResponse(200, items));
});

const getById = asyncHandler(async (req, res) => {
  const item = await service.getById(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, item));
});

const create = asyncHandler(async (req, res) => {
  const item = await service.create(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, item, 'Address created'));
});

const update = asyncHandler(async (req, res) => {
  const item = await service.update(req.params.id, req.user.id, req.body);
  res.status(200).json(new ApiResponse(200, item, 'Address updated'));
});

const setDefault = asyncHandler(async (req, res) => {
  const item = await service.setDefault(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, item, 'Default address set'));
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, null, 'Address deleted'));
});

module.exports = { list, getById, create, update, setDefault, remove };
