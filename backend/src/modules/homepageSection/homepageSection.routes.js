const express = require('express');
const controller = require('./homepageSection.controller');
const authenticate = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = express.Router();

router.get('/', controller.listAll);
router.get('/:key', controller.getByKey);

// Admin update endpoint
router.put('/:key', authenticate, role('admin'), controller.updateByKey);

module.exports = router;
