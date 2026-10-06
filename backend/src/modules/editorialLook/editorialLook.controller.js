const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const service = require('./editorialLook.service');

const getLooks = asyncHandler(async (req, res) => {
  const looks = await service.getActiveLooks();
  res.status(200).json(new ApiResponse(200, looks, 'Active editorial looks fetched successfully'));
});

const getAllLooks = asyncHandler(async (req, res) => {
  const looks = await service.getAllLooks();
  res.status(200).json(new ApiResponse(200, looks, 'All editorial looks fetched successfully'));
});

const createLook = asyncHandler(async (req, res) => {
  const { title, subtitle, tag, season, drop, status, category1, category2, image, fallback, gradient, isCutout, displayOrder, isActive } = req.body;
  if (!title || !image) {
    throw new ApiError(400, 'Title and Image are required');
  }

  const newLook = await service.createLook({
    title,
    subtitle: subtitle || '',
    tag: tag || 'STREETWEAR',
    season: season || '2026 EDITION',
    drop: drop || 'EXCLUSIVE',
    status: status || 'IN STOCK',
    category1: category1 || 'HOODIE',
    category2: category2 || 'SNEAKER',
    image,
    fallback: fallback || '/boyse.png',
    gradient: gradient || 'from-[#202125] via-[#3a3d44] to-[#bfc4c9]',
    isCutout: isCutout !== undefined ? Boolean(isCutout) : true,
    displayOrder: Number(displayOrder || 0),
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  res.status(201).json(new ApiResponse(201, newLook, 'Editorial look created successfully'));
});

const updateLook = asyncHandler(async (req, res) => {
  const updated = await service.updateLook(req.params.id, req.body);
  if (!updated) throw new ApiError(404, 'Editorial look not found');
  res.status(200).json(new ApiResponse(200, updated, 'Editorial look updated successfully'));
});

const deleteLook = asyncHandler(async (req, res) => {
  const deleted = await service.deleteLook(req.params.id);
  if (!deleted) throw new ApiError(404, 'Editorial look not found');
  res.status(200).json(new ApiResponse(200, deleted, 'Editorial look deleted successfully'));
});

module.exports = {
  getLooks,
  getAllLooks,
  createLook,
  updateLook,
  deleteLook,
};
