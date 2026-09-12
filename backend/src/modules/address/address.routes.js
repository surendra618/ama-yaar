const express = require('express');
const controller = require('./address.controller');
const authenticate = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.patch('/:id/default', controller.setDefault);
router.delete('/:id', controller.remove);

module.exports = router;
