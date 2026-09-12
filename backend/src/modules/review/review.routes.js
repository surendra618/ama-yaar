const express = require('express');
const controller = require('./review.controller');
const authenticate = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/', controller.list);
router.get('/stats/:productId', controller.getStats);
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.remove);

module.exports = router;
