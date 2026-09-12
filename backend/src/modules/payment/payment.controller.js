const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./payment.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.list(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const getById = asyncHandler(async (req, res) => {
  const item = await service.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, item));
});

const createPaymentOrder = asyncHandler(async (req, res) => {
  const data = await service.createPaymentOrder(req.body);
  res.status(200).json(new ApiResponse(200, data, 'Payment order created'));
});

const verifyPayment = asyncHandler(async (req, res) => {
  const data = await service.verifyPayment(req.body);
  res.status(200).json(new ApiResponse(200, data, 'Payment verified'));
});

const handleWebhook = asyncHandler(async (req, res) => {
  const data = await service.handleWebhook(req.body);
  res.status(200).json(new ApiResponse(200, data));
});

module.exports = {
  list,
  getById,
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
};
