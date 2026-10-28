const express = require('express');
const router = express.Router();
const controller = require('../controllers/pickup.controller');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', controller.listLocations);
router.post('/', controller.createLocation);
router.delete('/:id', controller.deleteLocation);

module.exports = router;
