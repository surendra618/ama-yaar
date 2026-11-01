const mongoose = require('mongoose');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const service = require('./reel.service');

const getReels = asyncHandler(async (req, res) => {
  const { reels, displayCount } = await service.getActiveReels();
  res.status(200).json(new ApiResponse(200, { reels, displayCount }, 'Active reels fetched successfully'));
});

const getAllReels = asyncHandler(async (req, res) => {
  const { reels, displayCount } = await service.getAllReels();
  res.status(200).json(new ApiResponse(200, { reels, displayCount }, 'All reels fetched successfully'));
});

const getSettings = asyncHandler(async (req, res) => {
  const settings = await service.getReelSettings();
  res.status(200).json(new ApiResponse(200, settings, 'Reel settings fetched successfully'));
});

const updateSettings = asyncHandler(async (req, res) => {
  const { displayCount } = req.body;
  const settings = await service.updateReelSettings(displayCount);
  res.status(200).json(new ApiResponse(200, settings, 'Reel settings updated successfully'));
});

const createReel = asyncHandler(async (req, res) => {
  const { product, productId, product2, product2Id, title, price, mrp, discount, views, badge, poster, altPoster, video, displayOrder, isActive } = req.body;
  if (!title || !price || !poster || !video) {
    throw new ApiError(400, 'Title, price, poster, and video are required');
  }

  const cleanProduct =
    product && product !== '' && mongoose.Types.ObjectId.isValid(product)
      ? product
      : productId && productId !== '' && mongoose.Types.ObjectId.isValid(productId)
      ? productId
      : null;
  const cleanProduct2 =
    product2 && product2 !== '' && mongoose.Types.ObjectId.isValid(product2)
      ? product2
      : product2Id && product2Id !== '' && mongoose.Types.ObjectId.isValid(product2Id)
      ? product2Id
      : null;

  const calculatedDiscount = discount || (mrp ? `${Math.round(((mrp - price) / mrp) * 100)}% OFF` : '50% OFF');

  const newReel = await service.createReel({
    product: cleanProduct,
    product2: cleanProduct2,
    title,
    price: Number(price),
    mrp: Number(mrp || price * 2),
    discount: calculatedDiscount,
    views: views || '15.2K views',
    badge: badge || 'Top Selling',
    poster,
    altPoster: altPoster || '',
    video,
    displayOrder: Number(displayOrder || 0),
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  res.status(201).json(new ApiResponse(201, newReel, 'Reel created successfully'));
});

const updateReel = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (!data.product || data.product === '' || data.product === 'null' || !mongoose.Types.ObjectId.isValid(data.product)) {
    data.product = null;
  }
  if (!data.product2 || data.product2 === '' || data.product2 === 'null' || !mongoose.Types.ObjectId.isValid(data.product2)) {
    data.product2 = null;
  }
  const updated = await service.updateReel(req.params.id, data);
  if (!updated) throw new ApiError(404, 'Reel not found');
  res.status(200).json(new ApiResponse(200, updated, 'Reel updated successfully'));
});

const deleteReel = asyncHandler(async (req, res) => {
  const deleted = await service.deleteReel(req.params.id);
  if (!deleted) throw new ApiError(404, 'Reel not found');
  res.status(200).json(new ApiResponse(200, deleted, 'Reel deleted successfully'));
});

module.exports = {
  getReels,
  getAllReels,
  getSettings,
  updateSettings,
  createReel,
  updateReel,
  deleteReel,
};
