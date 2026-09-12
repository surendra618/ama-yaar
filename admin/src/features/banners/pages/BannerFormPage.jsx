import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Link as LinkIcon, Sparkles, Check } from 'lucide-react';
import { fetchBannerById, createBanner, updateBanner, clearCurrentBanner } from '../bannersSlice';
import api from '../../../lib/axios';

const emptyForm = {
  title: '',
  subtitle: '',
  image: '',
  link: '/products',
  buttonText: 'Shop Now',
  badge: '',
  position: 'home_hero',
  displayOrder: 0,
  isActive: true,
};

export default function BannerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { current, saving, error } = useSelector((state) => state.banners);

  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (isEdit) dispatch(fetchBannerById(id));
    return () => dispatch(clearCurrentBanner());
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && current) {
      setForm({
        title: current.title || '',
        subtitle: current.subtitle || '',
        image: current.image || '',
        link: current.link || '/products',
        buttonText: current.buttonText || 'Shop Now',
        badge: current.badge || '',
        position: current.position || 'home_hero',
        displayOrder: current.displayOrder ?? 0,
        isActive: current.isActive !== false,
      });
    }
  }, [isEdit, current]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/uploads/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data?.data?.url;
      if (uploadedUrl) {
        setForm((f) => ({ ...f, image: uploadedUrl }));
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload image. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) {
      setUploadError('Please upload an image or provide an Image URL.');
      return;
    }

    const payload = { ...form, displayOrder: Number(form.displayOrder) || 0 };
    const action = isEdit ? updateBanner({ id, payload }) : createBanner(payload);
    const result = await dispatch(action);
    if (!result.error) navigate('/banners');
  };

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
          onClick={() => navigate('/banners')}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Banners
        </button>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${form.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${form.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {form.isActive ? 'Active Status' : 'Draft / Inactive'}
          </span>
        </div>
      </div>

      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          {isEdit ? 'Edit Banner' : 'Create New Banner'}
          <Sparkles className="h-4 w-4 text-amber-500" />
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 font-normal">
          Upload banner graphics, set title, links, and position for storefront sliders.
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
          {/* Banner Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Banner Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Summer Collection 2026"
              className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none transition"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Subtitle / Description
            </label>
            <input
              type="text"
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
              placeholder="e.g. Get up to 50% OFF on all heavyweight tees."
              className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none transition"
            />
          </div>

          {/* Image Upload Area - Both File Select & Image URL displayed together */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              Banner Image <span className="text-rose-500">*</span>
            </label>

            {/* Option A: Direct File Upload */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5 text-black" /> Option A: Select File from Computer
              </span>
              <label className="relative flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-3.5 text-center cursor-pointer hover:bg-slate-100/70 hover:border-slate-400 transition">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                {uploading ? (
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
                        Choose Image File <span className="text-black font-semibold underline">or drag & drop</span>
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
              <div className="relative overflow-hidden rounded-md border border-slate-300 bg-slate-950 aspect-[21/9] mt-2 group shadow-xs">
                <img src={previewImage} alt="Banner Preview" className="h-full w-full object-cover" />
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

          {/* Links & Button Text */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Link</label>
              <input
                type="text"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="/products?category=oversized"
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Button Text</label>
              <input
                type="text"
                name="buttonText"
                value={form.buttonText}
                onChange={handleChange}
                placeholder="Shop Now"
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {/* Placement & Badge */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Placement Position</label>
              <select
                name="position"
                value={form.position}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
              >
                <option value="home_hero">Home Hero Slider</option>
                <option value="home_promo">Home Promo Banner</option>
                <option value="category">Category Header</option>
                <option value="offer_strip">Offer Top Strip</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text</label>
              <input
                type="text"
                name="badge"
                value={form.badge}
                onChange={handleChange}
                placeholder="e.g. LIMITED DROP"
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {/* Display Order & Active Checkbox */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 items-center pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Display Priority Order</label>
              <input
                type="number"
                name="displayOrder"
                value={form.displayOrder}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-md border border-slate-300 px-3.5 py-1.5 text-xs font-bold text-slate-900 focus:border-black focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-slate-50 p-2.5 cursor-pointer hover:bg-slate-100/60 transition mt-4 sm:mt-0">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900">Publish Immediately</span>
                <span className="block text-[10px] text-slate-500">Visible on website storefront</span>
              </div>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => navigate('/banners')}
              className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-1.5 rounded-md bg-black px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95 disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : isEdit ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>

        {/* LIVE PREVIEW RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-xs font-bold text-slate-600">Live Website Preview</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-black">
                <Check className="h-3 w-3" /> Realtime
              </span>
            </div>

            {/* Simulated Banner Card */}
            <div className="relative overflow-hidden rounded-md bg-slate-950 aspect-[16/9] shadow-sm flex flex-col justify-end p-4">
              {previewImage ? (
                <img src={previewImage} alt="Store Preview" className="absolute inset-0 h-full w-full object-cover object-center opacity-85" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                  <ImageIcon className="h-8 w-8 mb-1.5 opacity-50" />
                  <span className="text-xs font-medium">Image preview will appear here</span>
                </div>
              )}

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

              {/* Text Content Overlay */}
              <div className="relative z-10 space-y-1 drop-shadow-md">
                {form.badge && (
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-black/50 px-1.5 py-0.5 rounded-sm">
                    {form.badge}
                  </span>
                )}
                <h3 className="text-base font-bold uppercase leading-tight text-white drop-shadow">
                  {form.title || 'YOUR BANNER TITLE'}
                </h3>
                <p className="text-[11px] font-normal text-white/80 line-clamp-2 leading-snug">
                  {form.subtitle || 'Subtitle or short description for your promotion.'}
                </p>
                <div className="pt-1.5">
                  <span className="inline-flex items-center rounded-sm bg-white px-3 py-1 text-[10px] font-bold text-black shadow-xs">
                    {form.buttonText || 'Shop Now'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-slate-50 p-3 border border-slate-200 text-[11px] space-y-1 text-slate-600 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Position:</span>
                <span className="font-bold text-slate-800">{form.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Priority Order:</span>
                <span className="font-bold text-slate-800">{form.displayOrder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Link:</span>
                <span className="font-mono font-bold text-black">{form.link}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
