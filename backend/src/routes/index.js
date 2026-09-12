const express = require('express');

const authRoutes = require('../modules/auth');
const userRoutes = require('../modules/user');
const productRoutes = require('../modules/product');
const categoryRoutes = require('../modules/category');
const cartRoutes = require('../modules/cart');
const wishlistRoutes = require('../modules/wishlist');
const orderRoutes = require('../modules/order');
const paymentRoutes = require('../modules/payment');
const reviewRoutes = require('../modules/review');
const couponRoutes = require('../modules/coupon');
const bannerRoutes = require('../modules/banner');
const addressRoutes = require('../modules/address');
const returnRequestRoutes = require('../modules/returnRequest');
const notificationRoutes = require('../modules/notification');
const adminRoutes = require('../modules/admin');
const uploadRoutes = require('../modules/upload');
const reportRoutes = require('../modules/report');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/banners', bannerRoutes);
router.use('/addresses', addressRoutes);
router.use('/returns', returnRequestRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/uploads', uploadRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
