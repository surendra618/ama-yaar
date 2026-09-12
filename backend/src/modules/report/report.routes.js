const express = require('express');
const controller = require('./report.controller');
const authenticate = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate, role('admin'));

router.get('/sales', controller.getSalesReport);
router.get('/revenue', controller.getRevenueReport);
router.get('/products', controller.getProductPerformanceReport);
router.get('/users', controller.getUserGrowthReport);

module.exports = router;
