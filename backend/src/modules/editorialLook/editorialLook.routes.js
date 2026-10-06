const express = require('express');
const controller = require('./editorialLook.controller');

const router = express.Router();

router.get('/', controller.getLooks);
router.get('/admin', controller.getAllLooks);
router.post('/', controller.createLook);
router.put('/:id', controller.updateLook);
router.delete('/:id', controller.deleteLook);

module.exports = router;
