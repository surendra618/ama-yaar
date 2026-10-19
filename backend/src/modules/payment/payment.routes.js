const express = require('express');
const controller = require('./payment.controller');
const authenticate = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const { optionalAuth } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/create-order', optionalAuth, controller.createPaymentOrder);
router.post('/verify', optionalAuth, controller.verifyPayment);
router.post('/webhook', controller.handleWebhook);
router.get('/', authenticate, role('admin'), controller.list);
router.get('/:id', authenticate, role('admin'), controller.getById);

module.exports = router;
