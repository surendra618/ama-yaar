const multer = require('multer');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const service = require('./upload.service');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only image and video files are allowed'), false);
    }
  },
});

const uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const data = await service.uploadMediaFile(req.file);
  res.status(200).json(new ApiResponse(200, data, 'File uploaded successfully'));
});

const uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new ApiError(400, 'No files uploaded');
  const results = await Promise.all(req.files.map((file) => service.uploadMediaFile(file)));
  res.status(200).json(new ApiResponse(200, results, 'Files uploaded successfully'));
});

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
};
