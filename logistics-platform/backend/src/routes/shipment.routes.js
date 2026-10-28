const express = require('express');
const router = express.Router();
const controller = require('../controllers/shipment.controller');
const auth = require('../middlewares/auth');

// Public label print (can be opened in new browser tab with auth token in query if needed, or with auth)
router.get('/:id/label', (req, res, next) => {
  if (req.query.token) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  next();
}, auth, controller.printLabel);

router.get('/manifest/:id/print', (req, res, next) => {
  if (req.query.token) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  next();
}, auth, controller.printManifest);

router.use(auth);

router.get('/', controller.listShipments);
router.post('/', controller.createShipment);
router.post('/bulk', controller.createBulkShipments);
router.get('/manifests/all', controller.listManifests);
router.post('/manifest', controller.createManifest);
router.get('/:id', controller.getShipment);

router.post('/:id/assign-awb', controller.assignAwb);
router.post('/:id/pickup', controller.schedulePickup);

// Testing & Lifecycle simulation endpoints
router.post('/:id/simulate', controller.simulateMilestone);
router.post('/:id/ndr-action', controller.handleNdrAction);

module.exports = router;
