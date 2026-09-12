const multer = require('multer');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const service = require('./upload.service');

// Files are held in memory just long enough to stream to Cloudinary — never written to disk.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only image files are allowed'), false);
    }
  },
});

const uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const data = await service.uploadImage(req.file);
  res.status(200).json(new ApiResponse(200, data, 'Image uploaded successfully'));
});

const uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new ApiError(400, 'No files uploaded');
  const results = await Promise.all(req.files.map((file) => service.uploadImage(file)));
  res.status(200).json(new ApiResponse(200, results, 'Images uploaded successfully'));
});

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
};
