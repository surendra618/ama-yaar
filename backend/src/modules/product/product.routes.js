const express = require('express');
const controller = require('./product.controller');
const authenticate = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = express.Router();

router.get('/', controller.list);
router.get('/filters', controller.getFilterOptions);
router.get('/:id', controller.getById);

router.post('/', authenticate, role('admin'), controller.create);
router.put('/:id', authenticate, role('admin'), controller.update);
router.delete('/:id', authenticate, role('admin'), controller.remove);

module.exports = router;
