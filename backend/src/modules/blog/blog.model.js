const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, default: 'Style Guide' },
    author: { type: String, default: 'Vansh Singh' },
    role: { type: String, default: 'Head of Design' },
    date: { type: String, default: 'Oct 02, 2026' },
    readTime: { type: String, default: '4 min read' },
    image: { type: String, required: true },
    featured: { type: Boolean, default: false },
    excerpt: { type: String, required: true },
    content: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
