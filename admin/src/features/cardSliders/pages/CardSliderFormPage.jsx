import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { fetchCardSliderById, createCardSlider, updateCardSlider, clearCurrentCardSlider } from '../cardSlidersSlice';
import api from '../../../lib/axios';

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (isEdit) dispatch(fetchCardSliderById(id));
    return () => dispatch(clearCurrentCardSlider());
  }, [dispatch, id, isEdit]);

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

    const payload = { ...form, displayOrder: Number(form.displayOrder) || 0 };
    const action = isEdit ? updateCardSlider({ id, payload }) : createCardSlider(payload);
    const result = await dispatch(action);
    if (!result.error) navigate('/card-sliders');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/card-sliders')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            {isEdit ? 'Edit Card Slide' : 'Add New Card Slide'}
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Configure cards displayed in the storefront Card Slider rail
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="rounded-lg bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200/80">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Card Title */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Rain Jackets, Men Collection"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-900 shadow-xs transition focus:border-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Subtitle</label>
            <input
              type="text"
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
              placeholder="e.g. Weatherproof Essentials"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-900 shadow-xs transition focus:border-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          {/* Badge */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Badge (Tag)</label>
            <input
              type="text"
              name="badge"
              value={form.badge}
              onChange={handleChange}
              placeholder="e.g. NEW DROP, POPULAR"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-900 shadow-xs transition focus:border-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          {/* Target Link */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Click Link URL</label>
            <div className="relative mt-1.5">
              <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="/products?category=rain-jackets"
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3.5 py-2 text-sm font-medium text-slate-900 shadow-xs transition focus:border-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/20"
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
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-900 shadow-xs transition focus:border-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
        </div>

        {/* Card Image */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Card Cover Image <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative h-44 w-36 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {form.image ? (
                <>
                  <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image: '' }))}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-xs hover:bg-slate-900"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-4 text-center text-slate-400">
                  <ImageIcon className="h-8 w-8 mb-2 stroke-1" />
                  <span className="text-xs">No image set</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 active:scale-95">
                  <Upload className="h-4 w-4" />
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
                <span className="text-[10px] font-bold text-slate-400 uppercase">OR URL</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <input
                type="text"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="Paste direct Image URL (e.g. https://...)"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 shadow-xs transition focus:border-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/20"
              />

              {uploadError && <p className="text-xs font-medium text-rose-600">{uploadError}</p>}
            </div>
          </div>
        </div>

        {/* Is Active Toggle */}
        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 rounded-xs border-slate-300 text-amber-500 focus:ring-amber-400"
          />
          <label htmlFor="isActive" className="text-xs font-bold text-slate-800">
            Publish & Show on Storefront Home Page
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => navigate('/card-sliders')}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-2 text-xs font-bold text-slate-900 shadow-xs transition hover:bg-amber-300 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : isEdit ? 'Update Card Slide' : 'Create Card Slide'}
          </button>
        </div>
      </form>
    </div>
  );
}
