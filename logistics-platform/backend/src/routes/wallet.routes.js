const express = require('express');
const router = express.Router();
const controller = require('../controllers/wallet.controller');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/balance', controller.getBalance);
router.post('/recharge', controller.recharge);
router.get('/transactions', controller.getTransactions);

module.exports = router;
