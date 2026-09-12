const express = require('express');
const controller = require('./wishlist.controller');
const authenticate = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getWishlist);
router.post('/items', controller.addItem);
router.post('/toggle', controller.toggle);
router.delete('/items/:productId', controller.removeItem);
router.post('/move-to-cart/:productId', controller.moveToCart);

module.exports = router;
