const express = require('express');
const controller = require('./order.controller');
const authenticate = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const { optionalAuth } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/', optionalAuth, controller.createOrder);
router.get('/my-orders', authenticate, controller.listMyOrders);
router.get('/admin', authenticate, role('admin'), controller.listAdminOrders);
router.get('/:id', authenticate, controller.getById);
router.patch('/:id/status', authenticate, role('admin'), controller.updateStatus);
router.post('/:id/cancel', authenticate, controller.cancelOrder);

module.exports = router;
