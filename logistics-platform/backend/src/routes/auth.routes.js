const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/profile', auth, controller.getProfile);
router.post('/regenerate-keys', auth, controller.regenerateApiKeys);
router.post('/kyc', auth, controller.updateKyc);

module.exports = router;
