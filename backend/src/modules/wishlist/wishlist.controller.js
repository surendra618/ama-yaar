const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./wishlist.service');

const getWishlist = asyncHandler(async (req, res) => {
  const data = await service.getWishlist(req.user.id);
  res.status(200).json(new ApiResponse(200, data));
});

const addItem = asyncHandler(async (req, res) => {
  const data = await service.addItem(req.user.id, req.body.productId);
  res.status(200).json(new ApiResponse(200, data, 'Item added to wishlist'));
});

const removeItem = asyncHandler(async (req, res) => {
  const productId = req.params.productId || req.body.productId;
  const data = await service.removeItem(req.user.id, productId);
  res.status(200).json(new ApiResponse(200, data, 'Item removed from wishlist'));
});

const toggle = asyncHandler(async (req, res) => {
  const data = await service.toggle(req.user.id, req.body.productId);
  const msg = data.added ? 'Added to wishlist' : 'Removed from wishlist';
  res.status(200).json(new ApiResponse(200, data, msg));
});

const moveToCart = asyncHandler(async (req, res) => {
  const productId = req.params.productId || req.body.productId;
  const data = await service.moveToCart(req.user.id, productId);
  res.status(200).json(new ApiResponse(200, data, 'Item moved to cart'));
});

module.exports = { getWishlist, addItem, removeItem, toggle, moveToCart };
