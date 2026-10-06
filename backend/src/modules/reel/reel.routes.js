const express = require('express');
const controller = require('./reel.controller');

const router = express.Router();

router.get('/', controller.getReels);
router.get('/admin', controller.getAllReels);
router.get('/settings', controller.getSettings);
router.post('/settings', controller.updateSettings);
router.post('/', controller.createReel);
router.put('/:id', controller.updateReel);
router.delete('/:id', controller.deleteReel);

module.exports = router;
