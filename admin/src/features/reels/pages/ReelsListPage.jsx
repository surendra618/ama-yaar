import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus,
  Trash2,
  Video,
  Image as ImageIcon,
  Play,
  CheckCircle2,
  X,
  UploadCloud,
  Loader2,
  Search,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Check,
  Pencil,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { fetchReels, createReel, deleteReel, updateReel } from '../reelsSlice';
import api from '../../../lib/axios';
import getMediaUrl from '../../../utils/mediaUrl';
import {
  getInstagramShortcode,
  getInstagramEmbedUrl,
  isInstagramUrl,
} from '../../../utils/instagram';

const InstagramIcon = ({ className = 'h-4 w-4', ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function ReelsListPage() {
  const dispatch = useDispatch();
  const { items: reels, status, saving, error } = useSelector((state) => state.reels);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReelId, setEditingReelId] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [searchQuery1, setSearchQuery1] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');

  const [formData, setFormData] = useState({
    product: '',
    product2: '',
    title: '',
    price: '',
    mrp: '',
    badge: 'Top Selling',
    views: '18.4K views',
    poster: '',
    altPoster: '',
    video: '',
  });

  const [posterFile, setPosterFile] = useState(null);
  const [altPosterFile, setAltPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [altPosterPreview, setAltPosterPreview] = useState('');

  const [displayCount, setDisplayCount] = useState(() => {
    return Number(localStorage.getItem('reels_display_count')) || 4;
  });

  useEffect(() => {
    dispatch(fetchReels());
    api
      .get('/products?limit=200')
      .then((res) => {
        const items = res.data?.data?.products || res.data?.products || res.data?.data || res.data || [];
        if (Array.isArray(items)) setProductsList(items);
      })
      .catch((err) => console.error('Failed to load products for reels:', err));

    api
      .get('/reels/settings')
      .then((res) => {
        const count = res.data?.data?.displayCount || res.data?.displayCount;
        if (count) {
          setDisplayCount(count);
          localStorage.setItem('reels_display_count', count.toString());
        }
      })
      .catch(() => {});
  }, [dispatch]);

  const handleSetDisplayCount = async (count) => {
    setDisplayCount(count);
    localStorage.setItem('reels_display_count', count.toString());
    window.dispatchEvent(new Event('reels_setting_changed'));
    try {
      const bc = new BroadcastChannel('reels_setting_channel');
      bc.postMessage({ displayCount: count });
      bc.close();
    } catch (_) {}

    try {
      await api.post('/reels/settings', { displayCount: count });
    } catch (err) {
      console.error('Failed to save reel display setting:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingReelId(null);
    setFormData({
      product: '',
      product2: '',
      title: '',
      price: '',
      mrp: '',
      badge: 'Top Selling',
      views: '18.4K views',
      poster: '',
      altPoster: '',
      video: '',
    });
    setPosterFile(null);
    setAltPosterFile(null);
    setPosterPreview('');
    setAltPosterPreview('');
    setSearchQuery1('');
    setSearchQuery2('');
    setModalOpen(true);
  };

  const handleEditReel = (reel) => {
    setEditingReelId(reel._id);
    const prod1Id = reel.product?._id || reel.product || '';
    const prod2Id = reel.product2?._id || reel.product2 || '';

    setFormData({
      product: prod1Id,
      product2: prod2Id,
      title: reel.title || '',
      price: reel.price || '',
      mrp: reel.mrp || '',
      badge: reel.badge || 'Top Selling',
      views: reel.views || '18.4K views',
      poster: reel.poster || '',
      altPoster: reel.altPoster || '',
      video: reel.video || '',
    });

    setPosterFile(null);
    setAltPosterFile(null);
    setPosterPreview(reel.poster || '');
    setAltPosterPreview(reel.altPoster || '');
    setModalOpen(true);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'poster') {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    } else if (type === 'altPoster') {
      setAltPosterFile(file);
      setAltPosterPreview(URL.createObjectURL(file));
    }
  };

  const filteredProducts1 = productsList.filter((p) =>
    (p.name || p.title || '').toLowerCase().includes(searchQuery1.toLowerCase())
  );

  const filteredProducts2 = productsList.filter((p) =>
    (p.name || p.title || '').toLowerCase().includes(searchQuery2.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      alert('Title and Price are required');
      return;
    }

    if (!formData.video || !formData.video.trim()) {
      alert('Please enter an Instagram Reel URL (e.g., https://www.instagram.com/reel/...)');
      return;
    }

    try {
      setUploadingMedia(true);
      let uploadedPoster = formData.poster;
      let uploadedAltPoster = formData.altPoster;

      // Upload Poster Image if file selected
      if (posterFile) {
        const body = new FormData();
        body.append('image', posterFile);
        const { data } = await api.post('/upload/single', body, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedPoster = data.data.url;
      }

      // Upload Secondary Poster Image if file selected
      if (altPosterFile) {
        const body = new FormData();
        body.append('image', altPosterFile);
        const { data } = await api.post('/upload/single', body, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedAltPoster = data.data.url;
      }

      if (!uploadedPoster) {
        alert('Please select or upload a Poster Cover Image for the reel.');
        setUploadingMedia(false);
        return;
      }

      const cleanProduct =
        formData.product && String(formData.product).trim() !== '' && formData.product !== 'null'
          ? formData.product
          : null;
      const cleanProduct2 =
        formData.product2 && String(formData.product2).trim() !== '' && formData.product2 !== 'null'
          ? formData.product2
          : null;

      const payload = {
        ...formData,
        product: cleanProduct,
        product2: cleanProduct2,
        poster: uploadedPoster,
        altPoster: uploadedAltPoster || '',
        video: formData.video.trim(),
      };

      if (editingReelId) {
        await dispatch(
          updateReel({
            id: editingReelId,
            payload,
          })
        ).unwrap();
      } else {
        await dispatch(createReel(payload)).unwrap();
      }

      setModalOpen(false);
      setEditingReelId(null);
      setFormData({
        product: '',
        product2: '',
        title: '',
        price: '',
        mrp: '',
        badge: 'Top Selling',
        views: '18.4K views',
        poster: '',
        altPoster: '',
        video: '',
      });
      setPosterFile(null);
      setAltPosterFile(null);
      setPosterPreview('');
      setAltPosterPreview('');
      setSearchQuery1('');
      setSearchQuery2('');
    } catch (err) {
      alert(err.message || 'Failed to save reel');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Reel?')) {
      dispatch(deleteReel(id));
    }
  };

  const handleToggleStatus = (reel) => {
    dispatch(updateReel({ id: reel._id, payload: { isActive: !reel.isActive } }));
  };

  const resolveMediaPreview = (file, url, preview) => {
    if (preview) return preview;
    if (!url) return null;
    return getMediaUrl(url);
  };

  const getProductInfo = (prodRef) => {
    if (!prodRef) return null;
    if (typeof prodRef === 'object' && (prodRef.name || prodRef.title)) {
      return prodRef;
    }
    return productsList.find((p) => p._id === prodRef) || null;
  };

  const getProductImg = (prod, fallbackUrl) => {
    if (prod) {
      const img = prod.images?.[0] || prod.image || '';
      if (img) return getMediaUrl(img);
    }
    if (fallbackUrl) {
      return getMediaUrl(fallbackUrl);
    }
    return null;
  };

  const currentPosterPreview = resolveMediaPreview(posterFile, formData.poster, posterPreview);
  const currentAltPosterPreview = resolveMediaPreview(altPosterFile, formData.altPoster, altPosterPreview);
  const isCurrentInsta = isInstagramUrl(formData.video);
  const currentShortcode = getInstagramShortcode(formData.video);

  const safeReels = Array.isArray(reels) ? reels : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Video className="h-5 w-5 text-indigo-600" />
            <span>Shopping Reels Manager</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-normal">
            Upload short shopping video reels & posters to feature live on the customer website homepage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Admin Setting: Select 4 or 5 Frontend Display Cards */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md border border-slate-200">
            <span className="text-[11px] font-bold text-slate-700 ml-1">Frontend Display:</span>
            <button
              type="button"
              onClick={() => handleSetDisplayCount(4)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                displayCount === 4
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              4 Reels
            </button>
            <button
              type="button"
              onClick={() => handleSetDisplayCount(5)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                displayCount === 5
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              5 Reels
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:brightness-110 transition active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Shopping Reel</span>
          </button>
        </div>
      </div>

      {/* Reels Grid (4 Cards per Row on Desktop) */}
      {status === 'loading' ? (
        <div className="flex h-48 items-center justify-center rounded-none bg-white border border-slate-200">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        </div>
      ) : safeReels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-none bg-white border border-slate-200 text-center px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-pink-500 mb-3 border border-pink-200">
            <InstagramIcon className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Reels Added Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Click "Add Shopping Reel" above to paste an Instagram Reel link and connect catalog products.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {safeReels.map((reel) => {
            const posterUrl = getMediaUrl(reel.poster);
            const videoUrl = getMediaUrl(reel.video);
            const isInsta = isInstagramUrl(reel.video);

            const prod1 = getProductInfo(reel.product);
            const prod2 = getProductInfo(reel.product2);
            const p1Img = getProductImg(prod1, reel.poster);
            const p2Img = getProductImg(prod2, reel.altPoster);

            return (
              <div
                key={reel._id}
                className="group relative flex flex-col overflow-hidden rounded-none bg-white border border-slate-300 shadow-xs hover:shadow-md transition"
              >
                {/* Reel Card Media Preview */}
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-950 rounded-none">
                  {isInsta ? (
                    <div className="relative h-full w-full">
                      <img
                        src={posterUrl || '/model01.png'}
                        alt={reel.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
                      {/* Instagram Reel Badge */}
                      <span className="absolute right-2 top-2 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs flex items-center gap-1 z-10">
                        <InstagramIcon className="h-2.5 w-2.5" />
                        <span>Reel</span>
                      </span>
                    </div>
                  ) : (
                    <video
                      src={videoUrl}
                      poster={posterUrl}
                      muted
                      loop
                      onMouseEnter={(e) => e.target.play().catch(() => {})}
                      onMouseLeave={(e) => e.target.pause()}
                      className="h-full w-full object-cover"
                    />
                  )}

                  <span className="absolute left-2 top-2 rounded-none bg-amber-400 px-2 py-0.5 text-[9px] font-bold text-slate-950 shadow-xs z-10">
                    {reel.badge || 'Top Selling'}
                  </span>
                  <span className="absolute bottom-2 left-2 rounded-none bg-black/70 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-xs z-10">
                    {reel.views}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 group-hover:opacity-0 transition z-10">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-md">
                      <Play className="h-5 w-5 fill-slate-900 ml-0.5" />
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h4 className="truncate text-xs font-bold text-slate-900">{reel.title}</h4>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">Rs. {reel.price}</span>
                      {reel.mrp && <span className="text-[10px] text-slate-400 line-through">Rs. {reel.mrp}</span>}
                    </div>

                    {/* Linked Product Images Only (No Text) */}
                    <div className="pt-2 border-t border-slate-100 mt-2.5 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Linked Products:
                      </span>
                      <div className="flex items-center gap-2">
                        {p1Img && (
                          <div className="relative" title={prod1?.name || prod1?.title || 'Primary Product'}>
                            <div className="h-8 w-8 overflow-hidden rounded-none border border-indigo-300 bg-slate-100 shadow-xs">
                              <img src={p1Img} alt="P1" className="h-full w-full object-cover" />
                            </div>
                            <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center bg-indigo-600 text-white text-[9px] font-bold rounded-full shadow-xs border border-white">
                              1
                            </span>
                          </div>
                        )}

                        {p2Img && (
                          <div className="relative" title={prod2?.name || prod2?.title || 'Secondary Product'}>
                            <div className="h-8 w-8 overflow-hidden rounded-none border border-emerald-300 bg-slate-100 shadow-xs">
                              <img src={p2Img} alt="P2" className="h-full w-full object-cover" />
                            </div>
                            <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center bg-emerald-600 text-white text-[9px] font-bold rounded-full shadow-xs border border-white">
                              2
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions: Approve Button, Instagram Link, Edit, Delete */}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
                    {/* Approve Toggle */}
                    <button
                      onClick={() => handleToggleStatus(reel)}
                      className={`px-2 py-1 rounded-none text-[10px] font-bold uppercase transition cursor-pointer flex items-center gap-1.5 ${
                        reel.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                      }`}
                      title={reel.isActive ? 'Approved - Showing on website' : 'Click to approve & show on website'}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          reel.isActive ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                        }`}
                      />
                      {reel.isActive ? 'Approved' : 'Approve'}
                    </button>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {isInsta && (
                        <a
                          href={reel.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md p-1.5 text-pink-600 bg-pink-50 border border-pink-200 hover:bg-pink-600 hover:text-white transition cursor-pointer shadow-2xs"
                          title="Open Reel in Instagram"
                        >
                          <InstagramIcon className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleEditReel(reel)}
                        className="rounded-md p-1.5 text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-600 hover:text-white transition cursor-pointer shadow-2xs"
                        title="Edit Reel"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(reel._id)}
                        className="rounded-md p-1.5 text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-600 hover:text-white transition cursor-pointer shadow-2xs"
                        title="Delete Reel"
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

      {/* Upload Modal (Designed like BannerFormPage) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl rounded-lg bg-white p-6 shadow-xl border border-slate-200 space-y-5 my-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs">
                    <InstagramIcon className="h-4 w-4" />
                  </span>
                  <span>{editingReelId ? 'Edit Shopping Reel' : 'Add & Publish Shopping Reel'}</span>
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Link catalog products, set cover images, and paste Instagram Reel link.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 2-Column Responsive Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN: Product Catalog Selectors & Offer Details */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Product 1 Selector Box */}
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white font-bold">
                          1
                        </span>
                        <span>Primary Product (Product 1)</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                        Auto-fills Title & Cover 1
                      </span>
                    </div>

                    <div className="relative flex items-center bg-white border border-slate-300 rounded-md focus-within:border-indigo-600">
                      <Search className="h-3.5 w-3.5 text-slate-400 ml-2.5 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search product 1 by name..."
                        value={searchQuery1}
                        onChange={(e) => setSearchQuery1(e.target.value)}
                        className="w-full bg-transparent px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>

                    <select
                      value={formData.product || ''}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedProd = productsList.find((p) => p._id === selectedId);
                        if (selectedProd) {
                          const img = selectedProd.images?.[0] || selectedProd.image || '';
                          setFormData({
                            ...formData,
                            product: selectedProd._id,
                            title: selectedProd.name || selectedProd.title || '',
                            price: selectedProd.price || '',
                            mrp: selectedProd.mrp || (selectedProd.price ? Math.round(selectedProd.price * 1.5) : ''),
                            poster: img,
                          });
                          setPosterFile(null);
                          if (img) {
                            setPosterPreview(getMediaUrl(img));
                          }
                        } else {
                          setFormData({ ...formData, product: '' });
                        }
                      }}
                      className="w-full rounded-md border border-indigo-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                    >
                      <option value="">-- Select Product 1 from Catalog ({filteredProducts1.length} found) --</option>
                      {filteredProducts1.map((prod) => (
                        <option key={prod._id} value={prod._id}>
                          {prod.name} (Rs. {prod.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product 2 Selector Box */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white font-bold">
                          2
                        </span>
                        <span>Secondary Product (Product 2)</span>
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                        Sets Cover 2 Thumbnail
                      </span>
                    </div>

                    <div className="relative flex items-center bg-white border border-slate-300 rounded-md focus-within:border-emerald-600">
                      <Search className="h-3.5 w-3.5 text-slate-400 ml-2.5 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search product 2 by name..."
                        value={searchQuery2}
                        onChange={(e) => setSearchQuery2(e.target.value)}
                        className="w-full bg-transparent px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>

                    <select
                      value={formData.product2 || ''}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedProd = productsList.find((p) => p._id === selectedId);
                        if (selectedProd) {
                          const img = selectedProd.images?.[0] || selectedProd.image || '';
                          setFormData({
                            ...formData,
                            product2: selectedProd._id,
                            altPoster: img,
                          });
                          setAltPosterFile(null);
                          if (img) {
                            setAltPosterPreview(getMediaUrl(img));
                          }
                        } else {
                          setFormData({ ...formData, product2: '', altPoster: '' });
                          setAltPosterFile(null);
                          setAltPosterPreview('');
                        }
                      }}
                      className="w-full rounded-md border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="">-- Select Product 2 (Optional) ({filteredProducts2.length} found) --</option>
                      {filteredProducts2.map((prod) => (
                        <option key={prod._id} value={prod._id}>
                          {prod.name} (Rs. {prod.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reel Display Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reel Display Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Oversized Stylish Men T-shirt"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none transition"
                    />
                  </div>

                  {/* Pricing Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Offer Price (Rs.) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="450"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">MRP Price (Rs.)</label>
                      <input
                        type="number"
                        placeholder="899"
                        value={formData.mrp}
                        onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                        className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Badge & Views Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Badge Ribbon</label>
                      <select
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none transition bg-white"
                      >
                        <option value="Top Selling">Top Selling</option>
                        <option value="Trending Drop">Trending Drop</option>
                        <option value="Best Value">Best Value</option>
                        <option value="Limited Drop">Limited Drop</option>
                        <option value="Hot Right Now">Hot Right Now</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Views Tag</label>
                      <input
                        type="text"
                        placeholder="18.4K views"
                        value={formData.views}
                        onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                        className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Media Files Upload (Designed identical to BannerFormPage) */}
                <div className="lg:col-span-6 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6 pt-4 lg:pt-0">
                  {/* Banner Image Style Container for Poster Cover 1 */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-indigo-600" />
                        <span>Poster Cover 1 (Product 1 Cover Image)</span>
                        <span className="text-rose-500">*</span>
                      </span>
                    </label>

                    {/* Option A: Direct File Upload */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                        <Upload className="h-3.5 w-3.5 text-black" /> Option A: Select File from Computer
                      </span>
                      <label className="relative flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-2.5 text-center cursor-pointer hover:bg-slate-100/70 hover:border-slate-400 transition">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'poster')}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-black">
                            <ImageIcon className="h-3.5 w-3.5" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            Choose Cover Image <span className="text-indigo-600 font-semibold underline">or drag & drop</span>
                          </p>
                        </div>
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
                        name="poster"
                        value={formData.poster}
                        onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none transition"
                      />
                    </div>

                    {/* Image Preview Box */}
                    {currentPosterPreview && (
                      <div className="relative overflow-hidden rounded-md border border-slate-300 bg-slate-950 h-24 mt-2 group shadow-xs flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                          <img src={currentPosterPreview} alt="Cover 1 Preview" className="h-20 w-16 object-cover rounded-md border border-slate-700" />
                          <div>
                            <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                              <Check className="h-3 w-3" /> Primary Cover 1 Ready
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[200px]">
                              {posterFile ? posterFile.name : formData.poster}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPosterFile(null);
                            setPosterPreview('');
                            setFormData((f) => ({ ...f, poster: '' }));
                          }}
                          className="flex items-center gap-1 rounded-md bg-rose-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-rose-700 transition"
                        >
                          <X className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Banner Image Style Container for Secondary Poster Cover 2 */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-emerald-600" />
                        <span>Poster Cover 2 (Product 2 Cover Image - Optional)</span>
                      </span>
                    </label>

                    {/* Option A: Direct File Upload */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                        <Upload className="h-3.5 w-3.5 text-black" /> Option A: Select File from Computer
                      </span>
                      <label className="relative flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-2.5 text-center cursor-pointer hover:bg-slate-100/70 hover:border-slate-400 transition">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'altPoster')}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-black">
                            <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            Choose Cover 2 Image <span className="text-emerald-600 font-semibold underline">or drag & drop</span>
                          </p>
                        </div>
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
                        <LinkIcon className="h-3.5 w-3.5 text-black" /> Option B: Paste Secondary Image URL
                      </span>
                      <input
                        type="text"
                        name="altPoster"
                        value={formData.altPoster}
                        onChange={(e) => setFormData({ ...formData, altPoster: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none transition"
                      />
                    </div>

                    {/* Image Preview Box */}
                    {currentAltPosterPreview && (
                      <div className="relative overflow-hidden rounded-md border border-slate-300 bg-slate-950 h-24 mt-2 group shadow-xs flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                          <img src={currentAltPosterPreview} alt="Cover 2 Preview" className="h-20 w-16 object-cover rounded-md border border-slate-700" />
                          <div>
                            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                              <Check className="h-3 w-3" /> Secondary Cover 2 Ready
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[200px]">
                              {altPosterFile ? altPosterFile.name : formData.altPoster}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAltPosterFile(null);
                            setAltPosterPreview('');
                            setFormData((f) => ({ ...f, altPoster: '' }));
                          }}
                          className="flex items-center gap-1 rounded-md bg-rose-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-rose-700 transition"
                        >
                          <X className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Instagram Reel URL Section (No Video File Upload) */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs">
                          <InstagramIcon className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-bold text-slate-900">Instagram Reel Link</span>
                        <span className="text-rose-500">*</span>
                      </span>
                      {isCurrentInsta && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Valid Reel ({currentShortcode})</span>
                        </span>
                      )}
                    </label>

                    <div className="relative flex items-center bg-white border border-slate-300 rounded-md shadow-xs focus-within:border-pink-500 focus-within:ring-1 focus-within:ring-pink-500">
                      <div className="pl-3 pr-2 text-slate-400">
                        <LinkIcon className="h-4 w-4 text-pink-500" />
                      </div>
                      <input
                        type="url"
                        name="video"
                        value={formData.video}
                        onChange={(e) => setFormData({ ...formData, video: e.target.value.trim() })}
                        placeholder="https://www.instagram.com/reel/C_xyz123... or https://instagram.com/p/..."
                        className="w-full bg-transparent py-2 pr-8 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                      {formData.video && (
                        <button
                          type="button"
                          onClick={() => setFormData((f) => ({ ...f, video: '' }))}
                          className="absolute right-2 text-slate-400 hover:text-slate-600 p-1"
                          title="Clear link"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Paste the link of any public Instagram Reel. No video file upload required.
                    </p>

                    {/* Live Instagram Reel Preview Embed */}
                    {isCurrentInsta && (
                      <div className="mt-3 rounded-lg border border-pink-200 bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-indigo-50/40 p-3 shadow-xs">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-pink-100">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white">
                              <InstagramIcon className="h-3 w-3" />
                            </span>
                            <span className="text-xs font-bold text-slate-900">Instagram Reel Preview</span>
                            <span className="text-[10px] font-mono text-pink-700 bg-pink-100/70 px-1.5 py-0.5 rounded font-semibold">
                              {currentShortcode}
                            </span>
                          </div>
                          <a
                            href={formData.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-600 hover:text-pink-700 hover:underline"
                          >
                            <span>Open Reel</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>

                        <div className="relative mx-auto w-full max-w-[280px] aspect-[9/16] max-h-[380px] rounded-lg overflow-hidden bg-black shadow-md border border-slate-700">
                          <iframe
                            src={getInstagramEmbedUrl(formData.video)}
                            className="h-full w-full border-0 bg-black"
                            scrolling="no"
                            allowTransparency="true"
                            allow="autoplay; encrypted-media; clipboard-write; picture-in-picture"
                            title="Instagram Reel Preview"
                          />
                        </div>
                      </div>
                    )}

                    {/* Fallback preview for direct MP4 URL */}
                    {!isCurrentInsta && formData.video && (
                      <div className="relative overflow-hidden rounded-md border border-slate-300 bg-slate-950 h-28 mt-2 shadow-xs flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                          <video
                            src={formData.video}
                            muted
                            loop
                            autoPlay
                            className="h-24 w-16 object-cover rounded-md border border-slate-700"
                          />
                          <div>
                            <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                              <Check className="h-3 w-3" /> Video URL Loaded
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[200px]">
                              {formData.video}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData((f) => ({ ...f, video: '' }))}
                          className="flex items-center gap-1 rounded-md bg-rose-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-rose-700 transition"
                        >
                          <X className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Bottom Action Bar */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingMedia || saving}
                  className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-6 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition active:scale-95 cursor-pointer"
                >
                  {uploadingMedia || saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading & Publishing…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>Save & Publish Reel</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
