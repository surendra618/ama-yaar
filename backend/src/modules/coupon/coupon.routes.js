const express = require('express');
const controller = require('./coupon.controller');
const authenticate = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = express.Router();

router.get('/', authenticate, role('admin'), controller.list);
router.post('/validate', authenticate, controller.validateCoupon);
router.get('/:id', authenticate, role('admin'), controller.getById);
router.post('/', authenticate, role('admin'), controller.create);
router.put('/:id', authenticate, role('admin'), controller.update);
router.delete('/:id', authenticate, role('admin'), controller.remove);

module.exports = router;
