const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./returnRequest.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.list(req.user, req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const getById = asyncHandler(async (req, res) => {
  const item = await service.getById(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, item));
});

const create = asyncHandler(async (req, res) => {
  const item = await service.create(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, item, 'Return request submitted'));
});

const updateStatus = asyncHandler(async (req, res) => {
  const item = await service.updateStatus(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, item, 'Return request status updated'));
});

module.exports = { list, getById, create, updateStatus };
