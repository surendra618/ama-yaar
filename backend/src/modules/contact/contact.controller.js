const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const contactService = require('./contact.service');

const createMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    throw new ApiError(400, 'Name, email, and message are required');
  }
  const newMessage = await contactService.createMessage(req.body);
  res.status(201).json(new ApiResponse(201, { message: newMessage }, 'Message sent successfully'));
});

const getAllMessages = asyncHandler(async (req, res) => {
  const result = await contactService.getAllMessages(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Messages fetched successfully'));
});

const getMessageById = asyncHandler(async (req, res) => {
  const message = await contactService.getMessageById(req.params.id);
  if (!message) throw new ApiError(404, 'Message not found');
  res.status(200).json(new ApiResponse(200, { message }, 'Message fetched successfully'));
});

const updateMessageStatus = asyncHandler(async (req, res) => {
  const message = await contactService.updateMessageStatus(req.params.id, req.body);
  if (!message) throw new ApiError(404, 'Message not found');
  res.status(200).json(new ApiResponse(200, { message }, 'Message status updated successfully'));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const message = await contactService.deleteMessage(req.params.id);
  if (!message) throw new ApiError(404, 'Message not found');
  res.status(200).json(new ApiResponse(200, null, 'Message deleted successfully'));
});

module.exports = {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
};
