const express = require('express');
const controller = require('./review.controller');
const authenticate = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const optionalAuth = authenticate.optionalAuth || authenticate;

const router = express.Router();

// Public routes
router.get('/', controller.list);
router.get('/stats/:productId', controller.getStats);
router.post('/', optionalAuth, controller.create);

// Authenticated user routes
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.remove);

// Admin moderation routes
router.get('/admin/all', authenticate, role('admin'), controller.adminList);
router.patch('/admin/:id/toggle-approve', authenticate, role('admin'), controller.toggleApproval);

module.exports = router;
