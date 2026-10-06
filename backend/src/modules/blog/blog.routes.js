const express = require('express');
const controller = require('./blog.controller');

const router = express.Router();

router.get('/', controller.getBlogs);
router.get('/admin/all', controller.getAllBlogs);
router.get('/:id', controller.getBlogById);
router.post('/', controller.createBlog);
router.put('/:id', controller.updateBlog);
router.delete('/:id', controller.deleteBlog);

module.exports = router;
