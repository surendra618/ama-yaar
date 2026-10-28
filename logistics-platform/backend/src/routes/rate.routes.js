const express = require('express');
const router = express.Router();
const controller = require('../controllers/rate.controller');

// Can be accessed with or without auth (e.g. for storefront pincode checking)
router.post('/compare', controller.calculateRates);
router.get('/serviceability', controller.checkServiceability);

module.exports = router;
