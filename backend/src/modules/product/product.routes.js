const express = require('express');
const multer = require('multer');
const controller = require('./product.controller');
const authenticate = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

const router = express.Router();

router.get('/', controller.list);
router.get('/filters', controller.getFilterOptions);
router.get('/sample-template', controller.downloadSampleTemplate);
router.get('/:id', controller.getById);

router.post('/bulk-upload', authenticate, role('admin'), upload.single('file'), controller.bulkUpload);
router.post('/', authenticate, role('admin'), controller.create);
router.put('/:id', authenticate, role('admin'), controller.update);
router.delete('/:id', authenticate, role('admin'), controller.remove);

module.exports = router;
