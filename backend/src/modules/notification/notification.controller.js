const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./notification.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.list(req.user.id);
  res.status(200).json(new ApiResponse(200, data));
});

const markAsRead = asyncHandler(async (req, res) => {
  const data = await service.markAsRead(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, data, 'Marked as read'));
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Notification deleted'));
});

module.exports = { list, markAsRead, remove };
