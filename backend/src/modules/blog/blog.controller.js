const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const service = require('./blog.service');

const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await service.getActiveBlogs();
  res.status(200).json(new ApiResponse(200, blogs, 'Active blogs fetched successfully'));
});

const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await service.getAllBlogs();
  res.status(200).json(new ApiResponse(200, blogs, 'All blogs fetched successfully'));
});

const getBlogById = asyncHandler(async (req, res) => {
  const blog = await service.getBlogById(req.params.id);
  if (!blog) throw new ApiError(404, 'Blog not found');
  res.status(200).json(new ApiResponse(200, blog, 'Blog fetched successfully'));
});

const createBlog = asyncHandler(async (req, res) => {
  const { title, category, author, role, date, readTime, image, featured, excerpt, content, displayOrder, isActive } = req.body;
  
  if (!title || !image || !excerpt) {
    throw new ApiError(400, 'Title, image, and excerpt are required');
  }

  const newBlog = await service.createBlog({
    title,
    category: category || 'Style Guide',
    author: author || 'Vansh Singh',
    role: role || 'Head of Design',
    date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    readTime: readTime || '4 min read',
    image,
    featured: Boolean(featured),
    excerpt,
    content: content || '',
    displayOrder: Number(displayOrder || 0),
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  res.status(201).json(new ApiResponse(201, newBlog, 'Blog created successfully'));
});

const updateBlog = asyncHandler(async (req, res) => {
  const updated = await service.updateBlog(req.params.id, req.body);
  if (!updated) throw new ApiError(404, 'Blog not found');
  res.status(200).json(new ApiResponse(200, updated, 'Blog updated successfully'));
});

const deleteBlog = asyncHandler(async (req, res) => {
  const deleted = await service.deleteBlog(req.params.id);
  if (!deleted) throw new ApiError(404, 'Blog not found');
  res.status(200).json(new ApiResponse(200, deleted, 'Blog deleted successfully'));
});

module.exports = {
  getBlogs,
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
