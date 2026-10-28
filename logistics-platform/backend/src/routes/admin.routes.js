const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middlewares/auth');

// All routes require authentication + super admin role
router.use(auth);
router.use(auth.requireAdmin);

// 1. Overview Analytics
router.get('/overview', adminController.getOverview);

// 2. Merchants Management
router.get('/merchants', adminController.getMerchants);
router.patch('/merchants/:id/kyc', adminController.updateMerchantKyc);
router.post('/merchants/:id/adjust-wallet', adminController.adjustMerchantWallet);

// 3. Global Shipments Master
router.get('/shipments', adminController.getAllShipments);

// 4. Courier Partners & Platform Pricing Settings
router.get('/settings/carriers', adminController.getCarrierSettings);
router.put('/settings/carriers', adminController.updateCarrierSettings);

// 5. COD Remittances
router.get('/remittances', adminController.getRemittances);
router.post('/remittances', adminController.createRemittance);
router.patch('/remittances/:id', adminController.updateRemittanceStatus);

module.exports = router;
