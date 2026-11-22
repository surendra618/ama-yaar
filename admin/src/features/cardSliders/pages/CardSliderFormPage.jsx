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
  ArrowRight,
  FolderTree,
  Eye,
  Check,
  LayoutGrid,
} from 'lucide-react';
import { fetchCardSliderById, createCardSlider, updateCardSlider, clearCurrentCardSlider, fetchCardSliders } from '../cardSlidersSlice';
import api from '../../../lib/axios';
import getMediaUrl from '../../../utils/mediaUrl';

const emptyForm = {
  title: '',
  subtitle: '',
  image: '',
  link: '/products',
  badge: '',
  displayOrder: 0,
  isActive: true,
};

export default function CardSliderFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { current, saving, error } = useSelector((state) => state.cardSliders);

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewStaggered, setPreviewStaggered] = useState(false);

  useEffect(() => {
    if (isEdit) dispatch(fetchCardSliderById(id));
    return () => dispatch(clearCurrentCardSlider());
  }, [dispatch, id, isEdit]);

  // Load available store categories for quick picking
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
        const list = res.data?.data?.categories || res.data?.data || res.data || [];
        if (Array.isArray(list)) setCategories(list);
      } catch (err) {
        // Silent fallback
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (isEdit && current) {
      setForm({
        title: current.title || '',
        subtitle: current.subtitle || '',
        image: current.image || '',
        link: current.link || '/products',
        badge: current.badge || '',
        displayOrder: current.displayOrder ?? 0,
        isActive: current.isActive !== false,
      });
    }
  }, [isEdit, current]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCategorySelect = (e) => {
    const slug = e.target.value;
    setSelectedCategorySlug(slug);
    if (!slug) return;

    const cat = categories.find((c) => c.slug === slug || c._id === slug);
    if (cat) {
      setForm((f) => ({
        ...f,
        title: f.title || cat.name,
        link: `/products?category=${cat.slug || cat._id}`,
        image: f.image || cat.image || '',
      }));
    }
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

      const uploadedUrl = res.data?.data?.url || res.data?.url;
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

    const payload = {
      ...form,
      title: form.title.trim(),
      link: form.link.trim() || '/products',
      displayOrder: Number(form.displayOrder) || 0,
    };
    const action = isEdit ? updateCardSlider({ id, payload }) : createCardSlider(payload);
    const result = await dispatch(action);
    if (!result.error) {
      await dispatch(fetchCardSliders());
      navigate('/card-sliders');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => navigate('/card-sliders')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-black text-white">
              <LayoutGrid className="h-3.5 w-3.5" />
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              {isEdit ? 'Edit Category Card' : 'Add Category Card'}
            </h1>
            <span className="rounded bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Shop By Category
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Configure the card image, category title, and destination link for the homepage rail.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: THE FORM */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {error && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200/80">
              {error}
            </div>
          )}

          {/* Quick Category Auto-Picker */}
          {categories.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-slate-700" />
                <label className="text-xs font-bold text-slate-800">
                  Quick Select from Store Categories (Optional)
                </label>
              </div>
              <p className="text-[11px] text-slate-500">
                Selecting a category auto-fills the card Title and Destination Link.
              </p>
              <select
                value={selectedCategorySlug}
                onChange={handleCategorySelect}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-black focus:outline-none"
              >
                <option value="">-- Choose a category to auto-fill --</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.slug} value={cat.slug || cat._id}>
                    {cat.name} {cat.slug ? `(${cat.slug})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Card Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Category Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Suits, Jackets, Shirts, Trousers, Overcoats"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-900 shadow-xs transition focus:border-black focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Words will wrap automatically on the card (e.g. "Rain Jackets" wraps onto two stylish lines).
              </p>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Subtitle (Optional)</label>
              <input
                type="text"
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                placeholder="e.g. Weatherproof Essentials"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 shadow-xs transition focus:border-black focus:outline-hidden"
              />
            </div>

            {/* Badge */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Badge Tag (Optional)</label>
              <input
                type="text"
                name="badge"
                value={form.badge}
                onChange={handleChange}
                placeholder="e.g. NEW DROP, TRENDING, POPULAR"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 shadow-xs transition focus:border-black focus:outline-hidden"
              />
            </div>

            {/* Target Link */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Click Link URL</label>
              <div className="relative mt-1.5">
                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  placeholder="/products?category=suits"
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3.5 py-2 text-xs font-mono text-slate-900 shadow-xs transition focus:border-black focus:outline-hidden"
                />
              </div>
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={form.displayOrder}
                onChange={handleChange}
                min="0"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 shadow-xs transition focus:border-black focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Lower numbers appear first (#1, #2, etc.)</p>
            </div>

            {/* Is Active Toggle */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded-xs border-slate-300 text-black focus:ring-black"
              />
              <label htmlFor="isActive" className="text-xs font-bold text-slate-800 cursor-pointer">
                Publish on Storefront Homepage
              </label>
            </div>
          </div>

          {/* Card Cover Image */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Card Cover Image <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative h-44 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xs">
                {form.image ? (
                  <>
                    <img src={getMediaUrl(form.image)} alt="Preview" className="h-full w-full object-cover object-top" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image: '' }))}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-xs hover:bg-slate-900 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-3 text-center text-slate-400">
                    <ImageIcon className="h-7 w-7 mb-1 stroke-1" />
                    <span className="text-[10px]">No image set</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2.5">
                <div>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-95 shadow-xs">
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? 'Uploading...' : 'Upload Image File'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">OR IMAGE URL</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <input
                  type="text"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo-... or /uploads/..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 shadow-xs transition focus:border-black focus:outline-hidden"
                />

                {uploadError && <p className="text-xs font-medium text-rose-600">{uploadError}</p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => navigate('/card-sliders')}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : isEdit ? 'Update Category Card' : 'Create Category Card'}
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: LIVE STOREFRONT CARD PREVIEW */}
        <div className="lg:col-span-5 space-y-4 sticky top-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-black" />
                <span className="text-xs font-black uppercase text-slate-900">
                  Storefront Card Preview
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                <Check className="h-3 w-3 text-emerald-600" /> Realtime
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Card Height Mode:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded">
                <button
                  type="button"
                  onClick={() => setPreviewStaggered(false)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                    !previewStaggered ? 'bg-black text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Even (#1, #3)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewStaggered(true)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                    previewStaggered ? 'bg-black text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Shifted (#2, #4)
                </button>
              </div>
            </div>

            {/* The Live Rendered Card Matching User Screenshot */}
            <div className="flex justify-center p-4 bg-slate-50/70 rounded-xl border border-slate-100">
              <div
                className={`w-[220px] rounded-2xl bg-neutral-900 overflow-hidden relative shadow-lg transition-all duration-300 ${
                  previewStaggered ? 'h-[330px] mt-6' : 'h-[310px] mt-0'
                }`}
              >
                {form.image ? (
                  <img
                    src={getMediaUrl(form.image)}
                    alt={form.title || 'Preview'}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-4 text-center text-neutral-500">
                    <ImageIcon className="h-10 w-10 mb-2 opacity-40" />
                    <span className="text-xs font-semibold">Upload card cover</span>
                  </div>
                )}

                {/* Scrim Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Top Badge */}
                {form.badge && (
                  <span className="absolute top-3 left-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-xs">
                    {form.badge}
                  </span>
                )}

                {/* Bottom Content: Title Left + Arrow Right */}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                  <span className="text-sm font-extrabold leading-tight text-white drop-shadow-md pr-2">
                    {(form.title || 'Category Title').split(' ').map((word, wIdx) => (
                      <span key={wIdx} className="block">
                        {word}
                      </span>
                    ))}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white backdrop-blur-xs shadow-xs">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p>
                Target Destination:{' '}
                <strong className="text-slate-800 font-mono">{form.link || '/products'}</strong>
              </p>
              <p>
                Status:{' '}
                <strong className={form.isActive ? 'text-emerald-700' : 'text-slate-500'}>
                  {form.isActive ? 'Active on Homepage' : 'Draft / Hidden'}
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
