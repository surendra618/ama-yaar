const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./cart.service');

const getCart = asyncHandler(async (req, res) => {
  const data = await service.getCart(req.user.id);
  res.status(200).json(new ApiResponse(200, data));
});

const addItem = asyncHandler(async (req, res) => {
  const data = await service.addItem(req.user.id, req.body);
  res.status(200).json(new ApiResponse(200, data, 'Item added to cart'));
});

const updateItem = asyncHandler(async (req, res) => {
  const data = await service.updateItem(req.user.id, {
    itemId: req.params.itemId || req.body.itemId,
    quantity: req.body.quantity,
  });
  res.status(200).json(new ApiResponse(200, data, 'Cart updated'));
});

const removeItem = asyncHandler(async (req, res) => {
  const data = await service.removeItem(req.user.id, req.params.itemId);
  res.status(200).json(new ApiResponse(200, data, 'Item removed from cart'));
});

const clearCart = asyncHandler(async (req, res) => {
  const data = await service.clearCart(req.user.id);
  res.status(200).json(new ApiResponse(200, data, 'Cart cleared'));
});

const applyCoupon = asyncHandler(async (req, res) => {
  const data = await service.applyCoupon(req.user.id, req.body);
  res.status(200).json(new ApiResponse(200, data, 'Coupon applied successfully'));
});

const removeCoupon = asyncHandler(async (req, res) => {
  const data = await service.removeCoupon(req.user.id);
  res.status(200).json(new ApiResponse(200, data, 'Coupon removed'));
});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
};
