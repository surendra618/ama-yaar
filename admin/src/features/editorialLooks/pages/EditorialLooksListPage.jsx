import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Upload,
  Loader2,
  Pencil,
  Eye,
  Shirt,
  Layers,
  Link as LinkIcon,
} from 'lucide-react';
import { fetchEditorialLooks, createEditorialLook, updateEditorialLook, deleteEditorialLook } from '../editorialLooksSlice';
import api from '../../../lib/axios';

const GRADIENT_PRESETS = [
  { name: 'Dark Slate & Charcoal', value: 'from-[#202125] via-[#3a3d44] to-[#bfc4c9]' },
  { name: 'Deep Midnight Navy', value: 'from-[#171d24] via-[#2d3946] to-[#b8c7d8]' },
  { name: 'Warm Espresso & Cream', value: 'from-[#28211b] via-[#483a2f] to-[#d4c6b8]' },
  { name: 'Vintage Plum & Lavender', value: 'from-[#211624] via-[#3d2744] to-[#cbbece]' },
  { name: 'Cyber Teal & Emerald', value: 'from-[#17211f] via-[#2c3d39] to-[#bed3cd]' },
  { name: 'Obsidian & Gold Glow', value: 'from-[#1a1814] via-[#383226] to-[#d9c49a]' },
];

export default function EditorialLooksListPage() {
  const dispatch = useDispatch();
  const { items: looks, status, saving } = useSelector((state) => state.editorialLooks);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLookId, setEditingLookId] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tag: 'FALL / WINTER',
    season: '2026 EDITION',
    drop: 'EXCLUSIVE',
    status: 'IN STOCK',
    category1: 'HOODIE',
    category2: 'SNEAKER',
    image: '',
    fallback: '/boyse.png',
    gradient: 'from-[#202125] via-[#3a3d44] to-[#bfc4c9]',
    isCutout: true,
    displayOrder: 0,
    isActive: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    dispatch(fetchEditorialLooks());
  }, [dispatch]);

  const handleOpenCreateModal = () => {
    setEditingLookId(null);
    setFormData({
      title: '',
      subtitle: '',
      tag: 'FALL / WINTER',
      season: '2026 EDITION',
      drop: 'EXCLUSIVE',
      status: 'IN STOCK',
      category1: 'HOODIE',
      category2: 'SNEAKER',
      image: '',
      fallback: '/boyse.png',
      gradient: 'from-[#202125] via-[#3a3d44] to-[#bfc4c9]',
      isCutout: true,
      displayOrder: 0,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  };

  const handleEditLook = (look) => {
    setEditingLookId(look._id);
    setFormData({
      title: look.title || '',
      subtitle: look.subtitle || '',
      tag: look.tag || 'STREETWEAR',
      season: look.season || '2026 EDITION',
      drop: look.drop || 'EXCLUSIVE',
      status: look.status || 'IN STOCK',
      category1: look.category1 || 'HOODIE',
      category2: look.category2 || 'SNEAKER',
      image: look.image || '',
      fallback: look.fallback || '/boyse.png',
      gradient: look.gradient || 'from-[#202125] via-[#3a3d44] to-[#bfc4c9]',
      isCutout: look.isCutout !== undefined ? Boolean(look.isCutout) : true,
      displayOrder: look.displayOrder || 0,
      isActive: look.isActive !== undefined ? Boolean(look.isActive) : true,
    });
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Please enter a Title');
      return;
    }

    setUploadingMedia(true);
    try {
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
        alert('Please upload a Look Image or provide an Image URL.');
        setUploadingMedia(false);
        return;
      }

      const payload = {
        ...formData,
        image: uploadedImage,
      };

      if (editingLookId) {
        await dispatch(updateEditorialLook({ id: editingLookId, payload })).unwrap();
      } else {
        await dispatch(createEditorialLook(payload)).unwrap();
      }

      setModalOpen(false);
      setEditingLookId(null);
    } catch (err) {
      alert(err.message || 'Failed to save look');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this Editorial Look?')) {
      dispatch(deleteEditorialLook(id));
    }
  };

  const handleToggleStatus = (look) => {
    dispatch(updateEditorialLook({ id: look._id, payload: { isActive: !look.isActive } }));
  };

  const getMediaUrl = (url, preview) => {
    if (preview) return preview;
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    if (url.startsWith('/')) return `http://localhost:5173${encodeURI(url)}`;
    return url;
  };

  const safeLooks = Array.isArray(looks) ? looks : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Shirt className="h-5 w-5 text-indigo-600" />
            <span>Editorial 3D Lookbook Manager</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-normal">
            Manage 3D streetwear outfit lookbook cards featuring model cutouts & editorial typography.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Look</span>
        </button>
      </div>

      {/* Grid List */}
      {status === 'loading' && safeLooks.length === 0 ? (
        <div className="flex h-48 items-center justify-center bg-white border border-slate-200">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        </div>
      ) : safeLooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 text-center px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <Layers className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Editorial Looks Created Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Click "Add New Look" above to create your first 3D outfit lookbook card.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {safeLooks.map((look) => {
            const imgUrl = getMediaUrl(look.image, null);

            return (
              <div
                key={look._id}
                className="group relative flex flex-col overflow-hidden bg-white border border-slate-300 shadow-xs hover:shadow-md transition"
              >
                {/* Look Card Media Preview */}
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-950 flex items-center justify-center p-4">
                  <div className={`absolute inset-0 bg-gradient-to-b ${look.gradient}`} />
                  <img
                    src={imgUrl}
                    alt={look.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getMediaUrl(look.fallback) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80';
                    }}
                    className={`relative z-10 ${
                      look.isCutout
                        ? 'h-[88%] w-auto object-contain object-bottom filter drop-shadow-md'
                        : 'h-full w-full object-cover'
                    }`}
                  />
                  <span className="absolute left-2 top-2 z-20 bg-amber-400 px-2 py-0.5 text-[9px] font-bold text-slate-950 shadow-xs">
                    {look.status || 'IN STOCK'}
                  </span>
                  <span className="absolute right-2 top-2 z-20 bg-black/70 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-xs">
                    {look.season || '2026'}
                  </span>
                </div>

                {/* Details */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h4 className="truncate text-xs font-bold text-slate-900">{look.title}</h4>
                    <p className="text-[11px] text-indigo-600 font-semibold">{look.subtitle}</p>
                    <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-500">
                      <span className="bg-slate-100 px-1.5 py-0.5 border border-slate-200">{look.category1}</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 border border-slate-200">{look.category2}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2.5">
                    <button
                      onClick={() => handleToggleStatus(look)}
                      className={`inline-flex items-center gap-1 text-xs font-bold ${
                        look.isActive ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-500'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{look.isActive ? 'Active' : 'Inactive'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditLook(look)}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition cursor-pointer"
                        title="Edit Look"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(look._id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                        title="Delete Look"
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-slate-200 shadow-2xl animate-in fade-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shirt className="h-5 w-5 text-indigo-600" />
                <span>{editingLookId ? 'Edit Editorial Look' : 'Add New Editorial Look'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CARGO HIGH RIB"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. JOGGER FIT"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. FALL / WINTER"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Season</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026 EDITION"
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. DELIVERY / IN STOCK"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category 1</label>
                  <input
                    type="text"
                    placeholder="e.g. HOODIE"
                    value={formData.category1}
                    onChange={(e) => setFormData({ ...formData, category1: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category 2</label>
                  <input
                    type="text"
                    placeholder="e.g. SNEAKER"
                    value={formData.category2}
                    onChange={(e) => setFormData({ ...formData, category2: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Gradient Theme Preset */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Background Gradient Theme</label>
                <select
                  value={formData.gradient}
                  onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none bg-white"
                >
                  {GRADIENT_PRESETS.map((p) => (
                    <option key={p.name} value={p.value}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload / URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Model Look Image *</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-md cursor-pointer transition bg-slate-50">
                    <Upload className="h-5 w-5 text-slate-400 mb-1" />
                    <span className="text-xs font-medium text-slate-600">Upload Cutout PNG Image</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>

                  <div className="flex-1">
                    <div className="relative">
                      <LinkIcon className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Or paste Image URL..."
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {(imagePreview || formData.image) && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-slate-100 rounded-md border border-slate-200">
                    <img
                      src={getMediaUrl(formData.image, imagePreview)}
                      alt="Preview"
                      className="h-16 w-12 object-contain bg-slate-900 rounded-xs"
                    />
                    <span className="text-xs text-slate-600 font-medium">Image Preview Ready</span>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isCutout}
                    onChange={(e) => setFormData({ ...formData, isCutout: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Is Transparent Cutout PNG</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Publish & Active Live</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingMedia || saving}
                  className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {(uploadingMedia || saving) && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editingLookId ? 'Save Changes' : 'Create Look'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
