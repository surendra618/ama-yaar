import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Link as LinkIcon, Sparkles, Check, ArrowRight } from 'lucide-react';
import {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  clearCurrentCategory,
} from '../categoriesSlice';
import api from '../../../lib/axios';

const emptyForm = { name: '', parent: '', image: '', banner: '', isActive: true };

export default function CategoryFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, current, saving, error } = useSelector((state) => state.categories);
  const [form, setForm] = useState(emptyForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
    if (isEdit) dispatch(fetchCategoryById(id));
    return () => dispatch(clearCurrentCategory());
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && current) {
      setForm({
        name: current.name || '',
        parent: current.parent?._id || current.parent || '',
        image: current.image || '',
        banner: current.banner || '',
        isActive: current.isActive !== false,
      });
    }
  }, [isEdit, current]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setUploadingImage(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/uploads/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data?.data?.url;
      if (uploadedUrl) {
        setForm((f) => ({ ...f, [fieldName]: uploadedUrl }));
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, parent: form.parent || null };
    const action = isEdit ? updateCategory({ id, payload }) : createCategory(payload);
    const result = await dispatch(action);
    if (!result.error) navigate('/categories');
  };

  const parentOptions = items.filter((c) => c._id !== id);

  const previewImage = form.image
    ? form.image.startsWith('http') || form.image.startsWith('data:')
      ? form.image
      : `http://localhost:5000${form.image}`
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/categories')}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Categories
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
          {isEdit ? 'Edit Category' : 'Add New Category'}
          <Sparkles className="h-4 w-4 text-amber-500" />
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 font-normal">
          {isEdit ? 'Update category name, parent hierarchy, and category card image' : 'Fill in the details to add a new category slider card'}
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
          {/* Category Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Oversized Printed T-Shirts"
              className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none transition"
            />
          </div>

          {/* Parent Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Parent Category <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select
              name="parent"
              value={form.parent}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
            >
              <option value="">None (Top-Level Category)</option>
              {parentOptions.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Card Image Upload */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700">
              Category Card Image <span className="text-rose-500">*</span>
            </label>

            {/* Option A: Direct File Upload */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5 text-black" /> Option A: Select File from Computer
              </span>
              <label className="relative flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-3.5 text-center cursor-pointer hover:bg-slate-100/70 hover:border-slate-400 transition">
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
                {uploadingImage ? (
                  <div className="flex items-center gap-2 py-1">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    <span className="text-xs font-bold text-black">Uploading image...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-black">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800">
                        Choose Category Image <span className="text-black font-semibold underline">or drag & drop</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">PNG, JPG, WEBP formats supported</p>
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
                <LinkIcon className="h-3.5 w-3.5 text-black" /> Option B: Paste Image URL
              </span>
              <input
                type="text"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none transition"
              />
            </div>

            {/* Image Preview Box */}
            {previewImage && (
              <div className="relative overflow-hidden rounded-md border border-slate-300 bg-slate-950 aspect-[4/3] mt-2 group shadow-xs">
                <img src={previewImage} alt="Category Preview" className="h-full w-full object-cover" />
                <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/70 p-1 rounded-md">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image: '' }))}
                    className="flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-rose-700 transition"
                  >
                    <X className="h-3 w-3" /> Remove Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-slate-50 p-2.5 cursor-pointer hover:bg-slate-100/60 transition">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900">Active (Visible on Storefront)</span>
                <span className="block text-[10px] text-slate-500">Show this category in the homepage slider and filters</span>
              </div>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="inline-flex items-center gap-1.5 rounded-md bg-black px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95 disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>

        {/* LIVE STOREFRONT CATEGORY CARD PREVIEW RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-xs font-bold text-slate-600">Category Card Preview</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-black">
                <Check className="h-3 w-3" /> Realtime
              </span>
            </div>

            {/* Simulated Category Card (Matching Homepage Styling) */}
            <div className="relative overflow-hidden rounded-2xl bg-neutral-900 aspect-[3/4] shadow-md flex flex-col justify-end">
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="absolute inset-0 h-full w-full object-cover object-top" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900">
                  <ImageIcon className="h-10 w-10 mb-2 opacity-40" />
                  <span className="text-xs font-medium text-slate-400">Category card preview</span>
                </div>
              )}

              {/* Scrim gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Bottom Card Content: Title Left + Arrow Right */}
              <div className="relative z-10 flex items-end justify-between p-4">
                <span className="text-sm font-extrabold leading-tight text-white drop-shadow-md pr-2">
                  {(form.name || 'CATEGORY TITLE').split(' ').map((word, wIdx) => (
                    <span key={wIdx} className="block">{word}</span>
                  ))}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur-xs">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
