const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./coupon.service');

const list = asyncHandler(async (req, res) => {
  const items = await service.list(req.query);
  res.status(200).json(new ApiResponse(200, items));
});

const getById = asyncHandler(async (req, res) => {
  const item = await service.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, item));
});

const validateCoupon = asyncHandler(async (req, res) => {
  const data = await service.validateCoupon(req.body);
  res.status(200).json(new ApiResponse(200, data, 'Coupon valid'));
});

const create = asyncHandler(async (req, res) => {
  const item = await service.create(req.body);
  res.status(201).json(new ApiResponse(201, item, 'Coupon created'));
});

const update = asyncHandler(async (req, res) => {
  const item = await service.update(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, item, 'Coupon updated'));
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Coupon deleted'));
});

module.exports = { list, getById, validateCoupon, create, update, remove };
