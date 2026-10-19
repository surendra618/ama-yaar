const express = require('express');
const controller = require('./setting.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

const router = express.Router();

// Public endpoint for customer clients to inspect active delivery configuration
router.get('/delivery', controller.getDeliverySettings);

// Admin-only endpoints to manage delivery configuration
router.put('/delivery', authenticate, authorize('admin'), controller.updateDeliverySettings);
router.post('/delivery', authenticate, authorize('admin'), controller.updateDeliverySettings);

module.exports = router;
