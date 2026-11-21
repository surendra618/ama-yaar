import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Check,
  Smartphone,
  Monitor,
  Eye,
  Sliders,
} from 'lucide-react';
import { fetchBannerById, createBanner, updateBanner, clearCurrentBanner } from '../bannersSlice';
import api from '../../../lib/axios';
import getMediaUrl from '../../../utils/mediaUrl';

const emptyForm = {
  title: '',
  subtitle: '',
  image: '', // Desktop banner image
  mobileImage: '', // Mobile banner image
  opacity: 100, // Banner opacity (0 - 100%)
  link: '/products',
  buttonText: '',
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
  const [uploadingField, setUploadingField] = useState(null); // 'image' | 'mobileImage' | null
  const [uploadError, setUploadError] = useState('');
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' | 'mobile'

  useEffect(() => {
    if (isEdit) dispatch(fetchBannerById(id));
    return () => dispatch(clearCurrentBanner());
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && current) {
      setForm({
        title: current.title ?? '',
        subtitle: current.subtitle ?? '',
        image: current.image || '',
        mobileImage: current.mobileImage || '',
        opacity: typeof current.opacity === 'number' ? current.opacity : 100,
        link: current.link || '/products',
        buttonText: current.buttonText ?? '',
        badge: current.badge ?? '',
        position: current.position || 'home_hero',
        displayOrder: current.displayOrder ?? 0,
        isActive: current.isActive !== false,
      });
    }
  }, [isEdit, current]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : type === 'number' || name === 'opacity' ? Number(value) : value,
    }));
  };

  const handleFileUpload = async (e, targetField = 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setUploadingField(targetField);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/uploads/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data?.data?.url;
      if (uploadedUrl) {
        setForm((f) => ({ ...f, [targetField]: uploadedUrl }));
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload image. Try again.');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) {
      setUploadError('Please upload a Desktop Banner Image (or provide an Image URL).');
      return;
    }

    const payload = {
      ...form,
      opacity: Number(form.opacity) || 100,
      displayOrder: Number(form.displayOrder) || 0,
    };
    const action = isEdit ? updateBanner({ id, payload }) : createBanner(payload);
    const result = await dispatch(action);
    if (!result.error) navigate('/banners');
  };

  const desktopPreview = form.image ? getMediaUrl(form.image) : null;
  const mobilePreview = form.mobileImage ? getMediaUrl(form.mobileImage) : desktopPreview;
  const activePreviewImage = previewMode === 'mobile' ? mobilePreview : desktopPreview;

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/banners')}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Banners
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${
              form.isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${form.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {form.isActive ? 'Active Status' : 'Draft / Inactive'}
          </span>
        </div>
      </div>

      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          {isEdit ? 'Edit Hero Banner' : 'Create New Hero Banner'}
          <Sparkles className="h-4 w-4 text-amber-500" />
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 font-normal">
          Upload dedicated desktop and mobile banners, configure link redirection, and control banner opacity.
        </p>
      </div>

      {(error || uploadError) && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 flex items-center justify-between shadow-xs">
          <span>{error || uploadError}</span>
          <button type="button" onClick={() => setUploadError('')} className="p-1 hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* FORM LEFT COLUMN */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 lg:col-span-7 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          {/* Banner Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Banner Title <span className="text-slate-400 font-normal">(Optional — leave blank to show pure image without text)</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Summer Collection 2026 (or leave empty)"
              className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none transition"
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
              placeholder="e.g. Discover premium fits crafted for everyday impact."
              className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none transition"
            />
          </div>

          {/* TARGET LINK URL FIELD (HIGHLIGHTED) */}
          <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                <LinkIcon className="h-4 w-4 text-indigo-600" />
                Target Link URL (Banner & Shop Now Click) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                Unified Redirect
              </span>
            </div>
            <input
              type="text"
              name="link"
              required
              value={form.link}
              onChange={handleChange}
              placeholder="e.g. /products?category=oversized or /products/summer-drop"
              className="w-full rounded-md border border-indigo-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
            />
            <p className="text-[11px] font-medium text-indigo-700">
              💡 <strong>Click Redirection:</strong> Clicking anywhere on the banner slide OR clicking the “Shop Now” button will navigate directly to this assigned URL.
            </p>
          </div>

          {/* BANNER OPACITY CONTROL SLIDER */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-slate-700" />
                Banner Opacity Control
              </label>
              <span className="text-xs font-mono font-black text-black bg-white px-2.5 py-0.5 rounded-md border border-slate-300 shadow-2xs">
                {form.opacity}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400">20%</span>
              <input
                type="range"
                name="opacity"
                min="20"
                max="100"
                step="5"
                value={form.opacity}
                onChange={handleChange}
                className="w-full accent-black cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <span className="text-[10px] font-bold text-slate-800">100% (Crisp)</span>
            </div>
            <p className="text-[10.5px] text-slate-500">
              Set to <strong>100%</strong> for full original image brightness. Lower values slightly dim the banner.
            </p>
          </div>

          {/* 1. DESKTOP BANNER IMAGE UPLOAD */}
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Monitor className="h-4 w-4 text-slate-700" />
                1. Desktop Banner Image <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Recommended: 1920×670 (16:9 / 21:9)
              </span>
            </div>

            {/* Direct File Select */}
            <label className="relative flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-center cursor-pointer hover:bg-slate-100/70 hover:border-slate-400 transition">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'image')}
                className="hidden"
              />
              {uploadingField === 'image' ? (
                <div className="flex items-center gap-2 py-1">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  <span className="text-xs font-bold text-black">Uploading desktop image...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-black">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">
                      Upload Desktop Banner <span className="text-black underline font-semibold">from Computer</span>
                    </p>
                    <p className="text-[10px] text-slate-500">PNG, JPG, WEBP formats</p>
                  </div>
                </div>
              )}
            </label>

            {/* Or Paste URL */}
            <div className="flex items-center gap-2 pt-1">
              <LinkIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="Or paste Desktop Image URL (https://...)"
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none"
              />
            </div>

            {form.image && (
              <div className="relative overflow-hidden rounded-md border border-slate-200 aspect-[21/9] bg-neutral-900 group">
                <img
                  src={getMediaUrl(form.image)}
                  alt="Desktop Preview"
                  className="h-full w-full object-cover"
                  style={{ opacity: form.opacity / 100 }}
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, image: '' }))}
                  className="absolute top-2 right-2 flex items-center gap-1 rounded bg-rose-600/90 px-2 py-1 text-[10px] font-bold text-white hover:bg-rose-700 transition"
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              </div>
            )}
          </div>

          {/* 2. MOBILE BANNER IMAGE UPLOAD */}
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-slate-700" />
                2. Mobile Banner Image (Optional)
              </label>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Recommended: 800×1000 (4:5 / 9:16)
              </span>
            </div>

            <p className="text-[11px] text-slate-500 font-normal">
              Tailored banner optimized for mobile phone screens. If left blank, the desktop banner will scale automatically.
            </p>

            {/* Direct File Select */}
            <label className="relative flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-center cursor-pointer hover:bg-slate-100/70 hover:border-slate-400 transition">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'mobileImage')}
                className="hidden"
              />
              {uploadingField === 'mobileImage' ? (
                <div className="flex items-center gap-2 py-1">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  <span className="text-xs font-bold text-black">Uploading mobile image...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-black">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">
                      Upload Mobile Banner <span className="text-black underline font-semibold">from Computer</span>
                    </p>
                    <p className="text-[10px] text-slate-500">Optimized vertical/portrait view for phones</p>
                  </div>
                </div>
              )}
            </label>

            {/* Or Paste URL */}
            <div className="flex items-center gap-2 pt-1">
              <LinkIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                name="mobileImage"
                value={form.mobileImage}
                onChange={handleChange}
                placeholder="Or paste Mobile Image URL (https://...)"
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none"
              />
            </div>

            {form.mobileImage && (
              <div className="relative overflow-hidden rounded-md border border-slate-200 w-36 h-48 bg-neutral-900 group">
                <img
                  src={getMediaUrl(form.mobileImage)}
                  alt="Mobile Preview"
                  className="h-full w-full object-cover"
                  style={{ opacity: form.opacity / 100 }}
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, mobileImage: '' }))}
                  className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded bg-rose-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-rose-700 transition"
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              </div>
            )}
          </div>

          {/* Button Text & Badge */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Button Text <span className="text-slate-400 font-normal">(Optional — leave blank for no button)</span>
              </label>
              <input
                type="text"
                name="buttonText"
                value={form.buttonText}
                onChange={handleChange}
                placeholder="Shop Now (or leave empty)"
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text</label>
              <input
                type="text"
                name="badge"
                value={form.badge}
                onChange={handleChange}
                placeholder="e.g. LIMITED DROP / NEW SEASON"
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {/* Placement & Priority */}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Display Priority Order</label>
              <input
                type="number"
                name="displayOrder"
                value={form.displayOrder}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {/* Publish Checkbox */}
          <label className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-slate-50 p-2.5 cursor-pointer hover:bg-slate-100/60 transition">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
            />
            <div>
              <span className="block text-xs font-bold text-slate-900">Publish Immediately</span>
              <span className="block text-[10px] text-slate-500">Live on storefront upon saving</span>
            </div>
          </label>

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
              disabled={saving || uploadingField !== null}
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
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-slate-500" /> Live Preview
              </span>

              {/* View Switcher: Desktop vs Mobile */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition ${
                    previewMode === 'desktop' ? 'bg-white text-black shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Monitor className="h-3 w-3" /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition ${
                    previewMode === 'mobile' ? 'bg-white text-black shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="h-3 w-3" /> Mobile
                </button>
              </div>
            </div>

            {/* Simulated Banner Card */}
            <div
              className={`relative overflow-hidden rounded-md bg-neutral-950 shadow-sm flex flex-col justify-end p-4 transition-all mx-auto ${
                previewMode === 'mobile' ? 'aspect-[4/5] max-w-[260px]' : 'aspect-[16/9] w-full'
              }`}
            >
              {activePreviewImage ? (
                <img
                  src={activePreviewImage}
                  alt="Store Preview"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-opacity"
                  style={{ opacity: form.opacity / 100 }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                  <ImageIcon className="h-8 w-8 mb-1.5 opacity-50" />
                  <span className="text-xs font-medium">Upload an image to see preview</span>
                </div>
              )}

              {/* Subtle bottom gradient only if text or button is present */}
              {(form.badge || form.title || form.subtitle || form.buttonText) ? (
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
              ) : null}

              {/* Text Content Overlay - Only appears if user enters text */}
              <div className="relative z-10 space-y-1 text-center flex flex-col items-center">
                {form.badge ? (
                  <span className="inline-block text-[8.5px] font-black uppercase tracking-wider text-amber-400 bg-black/60 px-2 py-0.5 rounded-full border border-amber-400/30">
                    {form.badge}
                  </span>
                ) : null}
                {form.title ? (
                  <h3 className="text-sm sm:text-base font-black uppercase leading-tight text-white drop-shadow">
                    {form.title}
                  </h3>
                ) : null}
                {form.subtitle ? (
                  <p className="text-[10.5px] font-normal text-white/90 line-clamp-2 leading-snug drop-shadow max-w-xs">
                    {form.subtitle}
                  </p>
                ) : null}
                {form.buttonText ? (
                  <div className="pt-2">
                    <span className="inline-flex items-center rounded-full bg-white px-4 py-1 text-[10px] font-black tracking-wider text-black uppercase shadow-md">
                      {form.buttonText}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-md bg-slate-50 p-3 border border-slate-200 text-[11px] space-y-1.5 text-slate-600 font-medium">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Banner Opacity:</span>
                <span className="font-mono font-bold text-black">{form.opacity}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Target Redirect:</span>
                <span className="font-mono font-bold text-indigo-700 truncate max-w-[180px]">{form.link}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Mobile Banner:</span>
                <span className={`font-semibold ${form.mobileImage ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {form.mobileImage ? 'Custom Vertical Set' : 'Using Desktop Fallback'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
