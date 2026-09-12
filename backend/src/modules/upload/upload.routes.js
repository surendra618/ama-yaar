const express = require('express');
const controller = require('./upload.controller');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');

const router = express.Router();

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : req.cookies?.accessToken;

  if (token) {
    try {
      req.user = jwt.verify(token, env.jwt.accessSecret);
    } catch (err) {
      // Ignore token errors during dev upload
    }
  }
  next();
};

router.post('/single', optionalAuth, controller.upload.single('image'), controller.uploadSingle);
router.post('/multiple', optionalAuth, controller.upload.array('images', 8), controller.uploadMultiple);

module.exports = router;
