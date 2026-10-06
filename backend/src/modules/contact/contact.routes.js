const express = require('express');
const contactController = require('./contact.controller');

const router = express.Router();

// Public route for submitting contact messages
router.post('/', contactController.createMessage);

// Admin routes (GET, PATCH, DELETE)
router.get('/', contactController.getAllMessages);
router.get('/:id', contactController.getMessageById);
router.patch('/:id/status', contactController.updateMessageStatus);
router.delete('/:id', contactController.deleteMessage);

module.exports = router;
