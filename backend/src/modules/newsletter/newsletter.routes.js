const express = require('express');
const { subscribe } = require('./newsletter.controller');

const router = express.Router();

router.post('/subscribe', subscribe);

module.exports = router;

