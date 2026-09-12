const express = require('express');
const controller = require('./cart.controller');
const authenticate = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getCart);
router.post('/items', controller.addItem);
router.put('/items/:itemId', controller.updateItem);
router.delete('/items/:itemId', controller.removeItem);
router.delete('/', controller.clearCart);
router.post('/coupon', controller.applyCoupon);
router.delete('/coupon', controller.removeCoupon);

module.exports = router;
