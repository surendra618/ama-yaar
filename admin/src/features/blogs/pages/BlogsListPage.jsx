import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus,
  Trash2,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  X,
  UploadCloud,
  Loader2,
  Sparkles,
  Pencil,
  Star,
  Tag,
  Clock,
  User,
} from 'lucide-react';
import { fetchBlogs, createBlog, deleteBlog, updateBlog } from '../blogsSlice';
import api from '../../../lib/axios';

const CATEGORY_OPTIONS = [
  'Style Guide',
  'Vibe & Trends',
  'Streetwear Essentials',
  'Culture Lab',
];

export default function BlogsListPage() {
  const dispatch = useDispatch();
  const { items: blogs, status } = useSelector((state) => state.blogs);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Style Guide',
    author: 'Vansh Singh',
    role: 'Head of Design',
    date: 'Oct 02, 2026',
    readTime: '4 min read',
    image: '',
    featured: false,
    excerpt: '',
    content: '',
    displayOrder: 0,
    isActive: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const handleOpenCreateModal = () => {
    setEditingBlogId(null);
    setFormData({
      title: '',
      category: 'Style Guide',
      author: 'Vansh Singh',
      role: 'Head of Design',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      readTime: '4 min read',
      image: '',
      featured: false,
      excerpt: '',
      content: '',
      displayOrder: 0,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  };

  const handleEditBlog = (blog) => {
    setEditingBlogId(blog._id);
    setFormData({
      title: blog.title || '',
      category: blog.category || 'Style Guide',
      author: blog.author || 'Vansh Singh',
      role: blog.role || 'Head of Design',
      date: blog.date || 'Oct 02, 2026',
      readTime: blog.readTime || '4 min read',
      image: blog.image || '',
      featured: Boolean(blog.featured),
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      displayOrder: blog.displayOrder || 0,
      isActive: blog.isActive !== undefined ? Boolean(blog.isActive) : true,
    });
    setImageFile(null);
    setImagePreview(blog.image || '');
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.excerpt) {
      alert('Title and Excerpt are required');
      return;
    }

    try {
      setUploadingImage(true);
      let uploadedImage = formData.image;

      if (imageFile) {
        const body = new FormData();
        body.append('image', imageFile);
        const { data } = await api.post('/upload/single', body, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedImage = data.data.url;
      }

      if (!uploadedImage) {
        alert('Please upload a cover image or enter an image URL.');
        setUploadingImage(false);
        return;
      }

      const payload = {
        ...formData,
        image: uploadedImage,
      };

      if (editingBlogId) {
        await dispatch(updateBlog({ id: editingBlogId, payload })).unwrap();
      } else {
        await dispatch(createBlog(payload)).unwrap();
      }

      setModalOpen(false);
      setEditingBlogId(null);
    } catch (err) {
      alert(err.message || 'Failed to save blog article');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Blog story?')) {
      dispatch(deleteBlog(id));
    }
  };

  const handleToggleActive = (blog) => {
    dispatch(updateBlog({ id: blog._id, payload: { isActive: !blog.isActive } }));
  };

  const handleToggleFeatured = (blog) => {
    dispatch(updateBlog({ id: blog._id, payload: { featured: !blog.featured } }));
  };

  const getImageSrc = (imgUrl) => {
    if (!imgUrl) return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';
    if (imgUrl.startsWith('http') || imgUrl.startsWith('data:')) return imgUrl;
    if (imgUrl.startsWith('/uploads')) return `http://localhost:5000${imgUrl}`;
    return imgUrl;
  };

  const safeBlogs = Array.isArray(blogs) ? blogs : [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <span>Blog &amp; Journal Manager</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-normal">
            Create, edit, and feature streetwear stories, style guides, and lookbooks for the customer website.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Story</span>
        </button>
      </div>

      {/* Blogs Grid */}
      {status === 'loading' ? (
        <div className="flex h-48 items-center justify-center bg-white border border-slate-200">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        </div>
      ) : safeBlogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 text-center px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <BookOpen className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Stories Published Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Click "Create New Story" above to publish your first streetwear journal article.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeBlogs.map((blog) => {
            const imgSrc = getImageSrc(blog.image);
            return (
              <div
                key={blog._id}
                className="group relative flex flex-col overflow-hidden bg-white border border-slate-200 shadow-xs hover:shadow-md transition"
              >
                {/* Cover Image Container */}
                <div className="relative h-48 bg-slate-900 overflow-hidden border-b border-slate-200">
                  <img
                    src={imgSrc}
                    alt={blog.title}
                    className="h-full w-full object-cover object-top group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                    <span className="bg-black/90 text-[#facc15] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-neutral-700">
                      {blog.category}
                    </span>
                    {blog.featured && (
                      <span className="bg-amber-400 text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Star className="h-3 w-3 fill-black" /> Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      <Clock className="h-3 w-3" />
                      <span>{blog.readTime || '4 min read'}</span>
                      <span>•</span>
                      <span>{blog.date}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 uppercase">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>

                  {/* Actions & Status Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Active Toggle */}
                      <button
                        onClick={() => handleToggleActive(blog)}
                        className={`px-2 py-1 text-[10px] font-bold uppercase transition cursor-pointer flex items-center gap-1 border ${
                          blog.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {blog.isActive ? 'Active' : 'Hidden'}
                      </button>

                      {/* Featured Toggle */}
                      <button
                        onClick={() => handleToggleFeatured(blog)}
                        className={`px-2 py-1 text-[10px] font-bold uppercase transition cursor-pointer flex items-center gap-1 border ${
                          blog.featured
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {blog.featured ? 'Featured' : 'Set Featured'}
                      </button>
                    </div>

                    {/* Edit & Delete Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditBlog(blog)}
                        className="p-1.5 text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                        title="Edit Article"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="p-1.5 text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Creating / Editing Blog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white p-6 shadow-xl border border-slate-200 space-y-5 my-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  <span>{editingBlogId ? 'Edit Blog Article' : 'Create New Blog Story'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fill in article details, upload cover image, and set feature status.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Article Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Rise of Heavyweight 240+ GSM Oversized Tees"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* Category, Author & Role Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 bg-white focus:border-indigo-600 focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    placeholder="Vansh Singh"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Author Role</label>
                  <input
                    type="text"
                    placeholder="Head of Design"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Read Time & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Read Time</label>
                  <input
                    type="text"
                    placeholder="4 min read"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    className="w-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Publish Date</label>
                  <input
                    type="text"
                    placeholder="Oct 02, 2026"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover Image Input / Upload */}
              <div className="space-y-2 border-t border-b border-slate-100 py-3">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Cover Image File or URL <span className="text-rose-500">*</span></span>
                </label>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <label className="flex items-center gap-2 border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition">
                    <UploadCloud className="h-4 w-4 text-indigo-600" />
                    <span>Choose Local Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <span className="text-xs text-slate-400">OR</span>

                  <input
                    type="text"
                    placeholder="Enter image URL (e.g. /model-nirvana.jpg)..."
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    className="flex-1 border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                {imagePreview && (
                  <div className="mt-2 h-28 w-44 border border-slate-300 overflow-hidden bg-slate-100">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              {/* Excerpt Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Excerpt / Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief summary displayed on article cards..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* Full Article Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Story Body / Content</label>
                <textarea
                  rows={4}
                  placeholder="Write complete article details..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* Checkboxes: Featured & Active */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 rounded-none border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">Set as Featured Drop Story</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 rounded-none border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">Publish &amp; Show on Website</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="inline-flex items-center gap-2 bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {uploadingImage && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingBlogId ? 'Update Article' : 'Publish Story'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
