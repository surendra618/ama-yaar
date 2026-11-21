const express = require('express');
const controller = require('./creator.controller');
const authenticate = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = express.Router();

// Public click tracking
router.post('/track', controller.track);

// Creator Authenticated Routes
router.post('/apply', authenticate, controller.apply);
router.get('/profile', authenticate, controller.getProfile);
router.get('/dashboard', authenticate, controller.getDashboard);
router.put('/bank-details', authenticate, controller.updateBank);
router.post('/payout-request', authenticate, controller.requestPayout);

// Admin Routes
router.get('/admin/list', authenticate, role('admin', 'superadmin'), controller.listAdmin);
router.patch('/admin/:id/status', authenticate, role('admin', 'superadmin'), controller.updateStatusAdmin);
router.get('/admin/payouts', authenticate, role('admin', 'superadmin'), controller.listPayoutsAdmin);
router.patch('/admin/payouts/:id', authenticate, role('admin', 'superadmin'), controller.processPayoutAdmin);

module.exports = router;
