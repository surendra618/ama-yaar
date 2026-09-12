const express = require('express');
const controller = require('./notification.controller');
const authenticate = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.list);
router.patch('/:id/read', controller.markAsRead);
router.delete('/:id', controller.remove);

module.exports = router;
