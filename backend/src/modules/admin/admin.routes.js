const express = require('express');
const controller = require('./admin.controller');
const authenticate = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate, role('admin'));

router.get('/dashboard', controller.getDashboardStats);

module.exports = router;
