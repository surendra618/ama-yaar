const express = require('express');
const controller = require('./user.controller');
const authenticate = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);
router.get('/', role('admin'), controller.list);
router.get('/:id', role('admin'), controller.getById);
router.patch('/:id/status', role('admin'), controller.updateStatus);
router.put('/:id', role('admin'), controller.updateProfile);
router.delete('/:id', role('admin'), controller.remove);

module.exports = router;
