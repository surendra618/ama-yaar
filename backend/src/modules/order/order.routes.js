const express = require('express');
const controller = require('./order.controller');
const authenticate = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', controller.createOrder);
router.get('/my-orders', controller.listMyOrders);
router.get('/admin', role('admin'), controller.listAdminOrders);
router.get('/:id', controller.getById);
router.patch('/:id/status', role('admin'), controller.updateStatus);
router.post('/:id/cancel', controller.cancelOrder);

module.exports = router;
