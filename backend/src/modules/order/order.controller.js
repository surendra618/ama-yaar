const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./order.service');

const createOrder = asyncHandler(async (req, res) => {
  const data = await service.createOrder(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, data, 'Order placed successfully'));
});

const listMyOrders = asyncHandler(async (req, res) => {
  const data = await service.listUserOrders(req.user.id, req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const listAdminOrders = asyncHandler(async (req, res) => {
  const data = await service.listAdminOrders(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const getById = asyncHandler(async (req, res) => {
  const data = await service.getById(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, data));
});

const updateStatus = asyncHandler(async (req, res) => {
  const data = await service.updateStatus(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, data, 'Order status updated'));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const data = await service.cancelOrder(req.params.id, req.user, req.body);
  res.status(200).json(new ApiResponse(200, data, 'Order cancelled'));
});

module.exports = {
  createOrder,
  listMyOrders,
  listAdminOrders,
  getById,
  updateStatus,
  cancelOrder,
};
