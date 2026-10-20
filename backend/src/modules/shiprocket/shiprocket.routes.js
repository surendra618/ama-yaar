const express = require('express');
const controller = require('./shiprocket.controller');
const authenticate = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { optionalAuth } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Public / Customer Serviceability & Tracking
router.get('/config', controller.getConfig);
router.get('/serviceability', controller.checkServiceability);
router.get('/track/:awbCode', controller.trackAwb);
router.get('/orders/:orderId/track', optionalAuth, controller.trackOrder);

// Shiprocket Webhook Callback
router.post('/webhook', controller.handleWebhook);

// Admin-only Shiprocket Management & Logistics Operations
router.use(authenticate, role('admin'));

router.post('/test-connection', controller.testConnection);
router.get('/pickup-locations', controller.getPickupLocations);

// Order fulfillment operations
router.post('/orders/:orderId/create', controller.createOrder);
router.post('/orders/:orderId/assign-awb', controller.assignAwb);
router.post('/orders/:orderId/pickup', controller.requestPickup);
router.get('/orders/:orderId/label', controller.generateLabel);
router.get('/orders/:orderId/invoice', controller.generateInvoice);
router.get('/orders/:orderId/manifest', controller.generateManifest);
router.post('/orders/:orderId/cancel', controller.cancelOrder);

module.exports = router;
