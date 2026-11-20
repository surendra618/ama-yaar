const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const service = require('./product.service');
const bulkService = require('./productBulkImport.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.list(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const getById = asyncHandler(async (req, res) => {
  const item = await service.getByIdOrSlug(req.params.id, req.query);
  res.status(200).json(new ApiResponse(200, item));
});

const getFilterOptions = asyncHandler(async (req, res) => {
  const data = await service.getFilterOptions(req.query);
  res.status(200).json(new ApiResponse(200, data));
});

const create = asyncHandler(async (req, res) => {
  const item = await service.create(req.body);
  res.status(201).json(new ApiResponse(201, item, 'Product created'));
});

const update = asyncHandler(async (req, res) => {
  const item = await service.update(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, item, 'Product updated'));
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Product deleted'));
});

const bulkUpload = asyncHandler(async (req, res) => {
  let fileBuffer = null;
  let originalName = 'upload.xlsx';

  if (req.file && req.file.buffer) {
    fileBuffer = req.file.buffer;
    originalName = req.file.originalname || originalName;
  } else if (req.body && req.body.csvData) {
    fileBuffer = Buffer.from(req.body.csvData, 'utf-8');
    originalName = 'paste.csv';
  }

  if (!fileBuffer) {
    throw new ApiError(400, 'Please upload an Excel (.xlsx / .xls) or CSV file, or provide csvData in the request body.');
  }

  const result = await bulkService.bulkImportProductsFromBuffer(fileBuffer, originalName);
  res.status(200).json(new ApiResponse(200, result, `Bulk import successful! Processed ${result.totalProcessed} products.`));
});

module.exports = { list, getById, getFilterOptions, create, update, remove, bulkUpload };
