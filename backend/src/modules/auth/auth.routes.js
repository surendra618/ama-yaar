const express = require('express');
const controller = require('./auth.controller');
const authenticate = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/quick-login', controller.quickLogin);
router.post('/phone-login', controller.phoneLogin);
router.post('/google', controller.googleLogin);
router.post('/send-otp', controller.sendOtp);
router.post('/verify-otp', controller.verifyOtp);
router.post('/fcm-token', (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
}, controller.saveFcmToken);
router.post('/refresh-token', controller.refreshToken);
router.post('/logout', controller.logout);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
router.get('/me', authenticate, controller.getMe);

module.exports = router;
