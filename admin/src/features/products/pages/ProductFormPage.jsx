import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Save, X, Plus, Upload, Image as ImageIcon, Link as LinkIcon, Sparkles, Check, Trash2 } from 'lucide-react';
import {
  fetchCategoriesForSelect,
  fetchProductById,
  createProduct,
  updateProduct,
  clearCurrentProduct,
} from '../productsSlice';
import api from '../../../lib/axios';

const emptyForm = {
  name: '',
  brand: '',
  category: '',
  description: '',
  price: '',
  mrp: '',
  stock: '',
  images: [],
  isFeatured: false,
  isActive: true,
};

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories, current, saving, error } = useSelector((state) => state.products);

  const [form, setForm] = useState(emptyForm);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    dispatch(fetchCategoriesForSelect());
    if (isEdit) dispatch(fetchProductById(id));
    return () => dispatch(clearCurrentProduct());
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && current) {
      setForm({
        name: current.name || '',
        brand: current.brand || '',
        category: current.category?._id || current.category || '',
        description: current.description || '',
        price: current.price ?? '',
        mrp: current.mrp ?? '',
        stock: current.stock ?? '',
        images: current.images?.length ? current.images : [],
        isFeatured: !!current.isFeatured,
        isActive: current.isActive !== false,
      });
    }
  }, [isEdit, current]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setUploadError('');

    try {
      const uploadedUrls = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post('/uploads/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data?.data?.url) {
          uploadedUrls.push(res.data.data.url);
        }
      }

      if (uploadedUrls.length) {
        setForm((f) => ({ ...f, images: [...f.images, ...uploadedUrls] }));
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      setForm((f) => ({ ...f, images: [...f.images, urlInput.trim()] }));
      setUrlInput('');
    }
  };

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.images.length) {
      setUploadError('Please upload at least one product image.');
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      mrp: Number(form.mrp),
      stock: Number(form.stock),
      images: form.images.filter(Boolean),
    };

    const action = isEdit ? updateProduct({ id, payload }) : createProduct(payload);
    const result = await dispatch(action);
    if (!result.error) navigate('/products');
  };

  const discountPercent =
    form.mrp && form.price && Number(form.mrp) > Number(form.price)
      ? Math.round(((Number(form.mrp) - Number(form.price)) / Number(form.mrp)) * 100)
      : 0;

  const mainImage = form.images[0]
    ? form.images[0].startsWith('http') || form.images[0].startsWith('data:')
      ? form.images[0]
      : `http://localhost:5000${form.images[0]}`
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </button>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${form.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${form.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {form.isActive ? 'Active Status' : 'Draft / Hidden'}
          </span>
        </div>
      </div>

      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          {isEdit ? 'Edit Product' : 'Add New Product'}
          <Sparkles className="h-4 w-4 text-amber-500" />
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 font-normal">
          {isEdit ? 'Update product info, pricing, images, and inventory stock' : 'Fill in the details to publish a new product on your store'}
        </p>
      </div>

      {(error || uploadError) && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 flex items-center justify-between shadow-xs">
          <span>{error || uploadError}</span>
          <button onClick={() => setUploadError('')} className="p-1 hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* FORM LEFT COLUMN */}
        <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-7 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product Title / Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Oversized Heavyweight Cotton T-Shirt"
              className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none transition"
            />
          </div>

          {/* Brand & Category */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g. AMA-YAAR"
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                required
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Write a detailed product description, fabric type, fit details..."
              className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none transition"
            />
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="499"
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                MRP (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="mrp"
                required
                min="0"
                value={form.mrp}
                onChange={handleChange}
                placeholder="999"
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-black focus:outline-none"
              />
              {discountPercent > 0 && (
                <span className="text-[10px] font-bold text-emerald-600 mt-0.5 block">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="50"
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {/* Product Images Upload (Option A: Select Files, Option B: Add URL) */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700">
              Product Images <span className="text-rose-500">*</span>
            </label>

            {/* Option A: Direct File Upload */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5 text-black" /> Option A: Select File(s) from Computer
              </span>
              <label className="relative flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-3.5 text-center cursor-pointer hover:bg-slate-100/70 hover:border-slate-400 transition">
                <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                {uploading ? (
                  <div className="flex items-center gap-2 py-1">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    <span className="text-xs font-bold text-black">Uploading image(s)...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-black">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800">
                        Choose Product Image(s) <span className="text-black font-semibold underline">or drag & drop</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">Select multiple images at once (PNG, JPG, WEBP)</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Divider OR */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-2.5 text-[10px] font-bold text-slate-400">OR</span>
            </div>

            {/* Option B: Image URL Input */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5 text-black" /> Option B: Add Image URL
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 rounded-md border border-slate-300 px-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="rounded-md bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-black transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Uploaded Images Thumbnails Grid */}
            {form.images.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600">Selected Product Images ({form.images.length}):</span>
                <div className="grid grid-cols-4 gap-2.5">
                  {form.images.map((imgUrl, idx) => {
                    const fullSrc = imgUrl.startsWith('http') || imgUrl.startsWith('data:') ? imgUrl : `http://localhost:5000${imgUrl}`;
                    return (
                      <div key={idx} className="group relative aspect-square rounded-md overflow-hidden border border-slate-300 bg-slate-100 shadow-xs">
                        <img src={fullSrc} alt={`Product ${idx + 1}`} className="h-full w-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[8px] font-bold text-white uppercase">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 rounded bg-rose-600 p-1 text-white opacity-90 hover:bg-rose-700 transition"
                          title="Remove Image"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4 border-t border-slate-200 pt-3">
            <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5 cursor-pointer hover:bg-slate-100/60 transition">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900">Featured Product</span>
                <span className="block text-[10px] text-slate-500">Show on homepage featured section</span>
              </div>
            </label>

            <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5 cursor-pointer hover:bg-slate-100/60 transition">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900">Active Status</span>
                <span className="block text-[10px] text-slate-500">Visible for customers to buy</span>
              </div>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-1.5 rounded-md bg-black px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95 disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>

        {/* LIVE STOREFRONT CARD PREVIEW RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-xs font-bold text-slate-600">Product Card Preview</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-black">
                <Check className="h-3 w-3" /> Realtime
              </span>
            </div>

            {/* Product Card Visual */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs">
              <div className="relative aspect-[4/3] bg-slate-900">
                {mainImage ? (
                  <img src={mainImage} alt="Preview" className="h-full w-full object-cover object-top" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                    <ImageIcon className="h-8 w-8 mb-1 opacity-40" />
                    <span className="text-xs font-medium">Product image preview</span>
                  </div>
                )}
                {form.isFeatured && (
                  <span className="absolute top-2 left-2 bg-amber-500 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white rounded">
                    Featured
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="absolute top-2 right-2 bg-rose-600 px-2 py-0.5 text-[9px] font-extrabold text-white rounded">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              <div className="p-3.5 space-y-1.5 bg-white">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  {form.brand || 'BRAND'}
                </p>
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {form.name || 'Product Title'}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{form.price ? Number(form.price).toLocaleString('en-IN') : '0'}
                  </span>
                  {form.mrp && Number(form.mrp) > Number(form.price) && (
                    <span className="text-xs text-slate-400 line-through font-medium">
                      ₹{Number(form.mrp).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-medium border-t border-slate-100 mt-2">
                  <span>Stock: <strong className="text-slate-800">{form.stock || 0} units</strong></span>
                  <span className={form.isActive ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {form.isActive ? 'In Stock' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
