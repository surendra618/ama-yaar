import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  Shirt,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  RotateCcw,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  Flame,
  LayoutGrid,
  Link as LinkIcon,
  Star,
  ArrowLeft,
  ArrowRight,
  Edit2,
  ArrowUp,
  ArrowDown,
  X,
  Search,
  MessageSquare,
  Check,
} from 'lucide-react';
import api from '../../../lib/axios';
import { getMediaUrl } from '../../../utils/mediaUrl';

function InstagramIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

const DEFAULT_WORKOUT_DATA = {
  tag: 'OUR TOP PICKS',
  headingLine1: 'TOP WORKOUT GEAR FOR',
  headingLine2: 'PEAK PERFORMANCE!',
  subtitle: 'Discover the best of our collection, designed to power your workouts all year round.',
  isActive: true,
  card1: {
    image: '/home img/workout_winter.jpg',
    season: '01/WINTER _2025',
    heading: 'TOP\nWORKOUT\nGEAR FOR\nPEAK\nPERFORMA\nNICE!',
    tag: 'TOP SELLING GEAR',
    link: '/products',
    isActive: true,
  },
  card2: {
    image: '/home img/workout_summer.jpg',
    season: '02/SUMMER _2025',
    heading: 'LATEST\nSTYLES AND\nINNOVATIONS\nIN WORKOUT\nGEAR.',
    tag: 'NEW ARRIVAL',
    link: '/products',
    isActive: true,
  },
};

const DEFAULT_NOCTA_DATA = {
  headline: 'THE NOCTA\nCOLLECTION',
  subtitle: 'Made for the night shift. / Worn around the clock.',
  buttonText: 'Shop now',
  buttonLink: '/products',
  baseModelImage: '/nocta-stage/model-base.jpg',
  isActive: true,
  slides: [
    {
      id: 'slide_1',
      name: 'PUFFER JACKET 01',
      category: 'OUTERWEAR / DROP 01',
      garment: '/nocta-stage/garment-01.png',
      link: '/products',
    },
    {
      id: 'slide_2',
      name: 'TACTICAL HOODIE 02',
      category: 'HEAVY FLEECE / DROP 02',
      garment: '/nocta-stage/garment-02.png',
      link: '/products',
    },
    {
      id: 'slide_3',
      name: 'CREWNECK SWEATSHIRT 03',
      category: 'OVERSIZED TERRY / DROP 03',
      garment: '/nocta-stage/garment-03.png',
      link: '/products',
    },
    {
      id: 'slide_4',
      name: 'TECH FLEECE ZIP 04',
      category: 'ESSENTIAL LAYER / DROP 04',
      garment: '/nocta-stage/garment-04.png',
      link: '/products',
    },
  ],
};

const DEFAULT_INSTAGRAM_DATA = {
  image: '/insta-banner-1920x500.jpg',
  link: 'https://instagram.com/amayaar.in',
  title: 'Follow AMA YAAR on Instagram',
  openInNewTab: true,
  isActive: true,
};

const DEFAULT_HAPPY_CUSTOMERS_DATA = {
  headingPrefix: 'OUR HAPPY',
  headingHighlight: 'Customers',
  subtitle: 'Real style, real comfort. Here is what our customers have to say about AMA YAAR.',
  isActive: true,
  reviews: [
    {
      id: 'rev_1',
      name: 'Vansh Singh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
      rating: 5,
      date: '2 weeks ago',
      text: 'Polo T-shirt ka fabric premium feel deta hai. Office casual ho ya outing, look kaafi classy aur stylish lagta hai. Definitely buying more!',
      isVerified: true,
      product: {
        name: 'Classic Heavyweight Polo T-Shirt',
        image: '/model03.png',
        price: 499,
        variant: 'Size: M • Slate Black',
        slug: 'mens-classic-polo-t-shirt',
      },
    },
    {
      id: 'rev_2',
      name: 'Rohan Verma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      rating: 5,
      date: '2 weeks ago',
      text: 'Amaze quality! Zipper polo ki fitting aur stitching bilkul top notch hai. Delivery fast thi aur packaging premium lagti hai.',
      isVerified: true,
      product: {
        name: 'Urban Zipper Heavyweight...',
        image: '/model04.png',
        price: 549,
        variant: 'Size: L • Washed Grey',
        slug: 'mens-zipper-polo-t-shirt',
      },
    },
    {
      id: 'rev_3',
      name: 'Arjun Yadav',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
      rating: 5,
      date: '3 weeks ago',
      text: 'Heavyweight drop tee meri favourite purchase rahi! Comfortable, stylish aur perfect fitting. Quality expectations se better nikli.',
      isVerified: true,
      product: {
        name: 'Heavyweight Boxy Graphi...',
        image: '/model06.png',
        price: 499,
        variant: 'Size: XL • Vintage Black',
        slug: 'mens-boxy-graphic-tee',
      },
    },
    {
      id: 'rev_4',
      name: 'Sunil Kashyap',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&q=80',
      rating: 5,
      date: '3 weeks ago',
      text: 'Oversized t-shirt ka fabric bahut smooth hai aur print quality bhi achhi hai. Pehli baar order kiya tha aur product expected se better nikla.',
      isVerified: true,
      product: {
        name: 'Streetwear Essential Oversized Tee',
        image: '/model08.png',
        price: 499,
        variant: 'Size: L • Off-Black',
        slug: 'streetwear-oversized-tee',
      },
    },
  ],
};

export default function HomepageShowcasePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const initialTab =
    searchParams.get('tab') ||
    (location.pathname.includes('happy-customers')
      ? 'happy_customers'
      : location.pathname.includes('editorial-banner')
      ? 'nocta'
      : location.pathname.includes('workout-gear')
      ? 'workout'
      : 'workout');

  const [activeTab, setActiveTab] = useState(initialTab); // 'workout' | 'nocta' | 'instagram' | 'happy_customers'
  const [workoutData, setWorkoutData] = useState(DEFAULT_WORKOUT_DATA);
  const [noctaData, setNoctaData] = useState(DEFAULT_NOCTA_DATA);
  const [instagramData, setInstagramData] = useState(DEFAULT_INSTAGRAM_DATA);
  const [happyCustomersData, setHappyCustomersData] = useState(DEFAULT_HAPPY_CUSTOMERS_DATA);
  const [availableProducts, setAvailableProducts] = useState([]);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editingReviewIdx, setEditingReviewIdx] = useState(-1);
  const [selectedProductFilter, setSelectedProductFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  // Nocta preview state
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  useEffect(() => {
    if (location.pathname.includes('happy-customers')) {
      setActiveTab('happy_customers');
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const [resWorkout, resNocta, resInsta, resHappy, resProducts] = await Promise.allSettled([
        api.get('/homepage-sections/workout_top_picks', { params: { _t: Date.now() } }),
        api.get('/homepage-sections/editorial_nocta', { params: { _t: Date.now() } }),
        api.get('/homepage-sections/instagram_banner', { params: { _t: Date.now() } }),
        api.get('/homepage-sections/happy_customers', { params: { _t: Date.now() } }),
        api.get('/products?limit=100'),
      ]);

      if (resWorkout.status === 'fulfilled' && resWorkout.value?.data?.data) {
        setWorkoutData((prev) => ({ ...prev, ...resWorkout.value.data.data }));
      }
      if (resNocta.status === 'fulfilled' && resNocta.value?.data?.data) {
        setNoctaData((prev) => ({ ...prev, ...resNocta.value.data.data }));
      }
      if (resInsta.status === 'fulfilled' && resInsta.value?.data?.data) {
        setInstagramData((prev) => ({ ...prev, ...resInsta.value.data.data }));
      }
      if (resHappy.status === 'fulfilled' && resHappy.value?.data?.data) {
        setHappyCustomersData((prev) => ({ ...prev, ...resHappy.value.data.data }));
      }
      if (resProducts.status === 'fulfilled') {
        const pList =
          resProducts.value.data?.data?.products ||
          resProducts.value.data?.data ||
          resProducts.value.data?.products ||
          [];
        setAvailableProducts(Array.isArray(pList) ? pList : []);
      }
    } catch (err) {
      console.warn('Failed to load homepage sections, using defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkout = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.put('/homepage-sections/workout_top_picks', {
        data: workoutData,
        isActive: workoutData.isActive !== false,
      });
      setSuccessMsg('Top Workout Gear section updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update section');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNocta = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.put('/homepage-sections/editorial_nocta', {
        data: noctaData,
        isActive: noctaData.isActive !== false,
      });
      setSuccessMsg('Nocta Collection section updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update section');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInstagram = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.put('/homepage-sections/instagram_banner', {
        data: instagramData,
        isActive: instagramData.isActive !== false,
      });
      setSuccessMsg('Instagram banner and redirect link updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update Instagram banner');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHappyCustomers = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.put('/homepage-sections/happy_customers', {
        data: happyCustomersData,
        isActive: happyCustomersData.isActive !== false,
      });
      setSuccessMsg('Happy Customers reviews section updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update Happy Customers reviews');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveReview = (index, direction) => {
    const list = [...(happyCustomersData.reviews || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const [removed] = list.splice(index, 1);
    list.splice(targetIndex, 0, removed);
    setHappyCustomersData((prev) => ({ ...prev, reviews: list }));
  };

  const handleDeleteReview = (index) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    const list = [...(happyCustomersData.reviews || [])];
    list.splice(index, 1);
    setHappyCustomersData((prev) => ({ ...prev, reviews: list }));
  };

  const handleOpenAddReview = () => {
    setEditingReview({
      id: `rev_${Date.now()}`,
      name: '',
      avatar: '',
      rating: 5,
      date: '2 weeks ago',
      text: '',
      isVerified: true,
      product: {
        name: '',
        image: '',
        price: '',
        variant: '',
        slug: '',
      },
    });
    setEditingReviewIdx(-1);
    setSelectedProductFilter('');
    setIsReviewModalOpen(true);
  };

  const handleOpenEditReview = (review, index) => {
    setEditingReview(JSON.parse(JSON.stringify(review)));
    setEditingReviewIdx(index);
    setSelectedProductFilter('');
    setIsReviewModalOpen(true);
  };

  const handleSaveReviewModal = (e) => {
    e.preventDefault();
    if (!editingReview.name?.trim()) {
      alert('Please enter a customer name');
      return;
    }
    if (!editingReview.text?.trim()) {
      alert('Please enter review comment');
      return;
    }

    const list = [...(happyCustomersData.reviews || [])];
    if (editingReviewIdx >= 0) {
      list[editingReviewIdx] = editingReview;
    } else {
      list.push(editingReview);
    }

    setHappyCustomersData((prev) => ({ ...prev, reviews: list }));
    setIsReviewModalOpen(false);
    setEditingReview(null);
    setEditingReviewIdx(-1);
  };

  const handleSelectProduct = (productId) => {
    if (!productId) {
      setSelectedProductFilter('');
      return;
    }
    const prod = availableProducts.find((p) => (p._id || p.id) === productId);
    if (!prod) return;
    setSelectedProductFilter(productId);

    const img =
      (prod.images && prod.images[0]?.url) ||
      (typeof prod.images?.[0] === 'string' ? prod.images[0] : '') ||
      prod.image ||
      prod.thumbnail ||
      '';
    const price = prod.salePrice || prod.price || 499;
    const variant = prod.variants?.[0]
      ? `Size: ${prod.variants[0].size || 'M'}${prod.variants[0].color ? ` • ${prod.variants[0].color}` : ''}`
      : 'Size: M • Black';

    setEditingReview((prev) => ({
      ...prev,
      product: {
        name: prod.title || prod.name || '',
        image: img,
        price: price,
        variant: variant,
        slug: prod.slug || '',
      },
    }));
  };

  const handleUploadImage = async (e, onUrlReceived, fieldKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldKey);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/uploads/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.data?.url || res.data?.url;
      if (url) {
        onUrlReceived(url);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingField(null);
    }
  };

  // Workout Card Heading lines parser for preview
  const parseHeadingLines = (raw = '') => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      return raw.split('\n').filter((l) => l.trim().length > 0);
    }
    return [];
  };

  // Nocta slide handlers
  const handleAddSlide = () => {
    const newSlide = {
      id: `slide_${Date.now()}`,
      name: `NEW OUTFIT ${noctaData.slides.length + 1}`,
      category: 'STREETWEAR / DROP NEW',
      garment: '/nocta-stage/garment-01.png',
      link: '/products',
    };
    setNoctaData((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
  };

  const handleUpdateSlide = (index, field, value) => {
    setNoctaData((prev) => {
      const updated = [...prev.slides];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, slides: updated };
    });
  };

  const handleRemoveSlide = (index) => {
    if (noctaData.slides.length <= 1) {
      alert('You must have at least 1 outfit slide.');
      return;
    }
    setNoctaData((prev) => {
      const updated = prev.slides.filter((_, i) => i !== index);
      return { ...prev, slides: updated };
    });
    if (previewSlideIdx >= noctaData.slides.length - 1) {
      setPreviewSlideIdx(0);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Homepage Showcases & Banners
            </h1>
            <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Live Storefront
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Customize the "Top Workout Gear" showcase and "The Nocta Collection" interactive outfit banner with real-time live preview.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={
              activeTab === 'workout'
                ? handleSaveWorkout
                : activeTab === 'nocta'
                ? handleSaveNocta
                : activeTab === 'instagram'
                ? handleSaveInstagram
                : handleSaveHappyCustomers
            }
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Success / Error Feedback Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800 shadow-xs">
          {errorMsg}
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab('workout');
            setSearchParams({ tab: 'workout' });
          }}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'workout'
              ? 'border-black text-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>1. Top Workout Gear (Our Top Picks)</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
            2 Cards
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('nocta');
            setSearchParams({ tab: 'nocta' });
          }}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'nocta'
              ? 'border-black text-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>2. The Nocta Collection (Interactive Outfits)</span>
          <span className="rounded bg-purple-100 text-purple-700 px-1.5 py-0.5 text-[10px] font-mono font-bold">
            Interactive
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('instagram');
            setSearchParams({ tab: 'instagram' });
          }}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'instagram'
              ? 'border-black text-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <InstagramIcon className="h-4 w-4 text-pink-600" />
          <span>3. Instagram Promo Banner</span>
          <span className="rounded bg-pink-100 text-pink-700 px-1.5 py-0.5 text-[10px] font-mono font-bold">
            Redirect Link
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('happy_customers');
            setSearchParams({ tab: 'happy_customers' });
          }}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'happy_customers'
              ? 'border-black text-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span>4. Happy Customers (Reviews Rail)</span>
          <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[10px] font-mono font-bold">
            {happyCustomersData.reviews?.length || 0} Reviews
          </span>
        </button>
      </div>

      {/* TAB 1: WORKOUT GEAR SHOWCASE */}
      {activeTab === 'workout' && (
        <div className="space-y-6">
          {/* LIVE PREVIEW SECTION */}
          {showPreview && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Live Storefront Preview
                  </span>
                  <span className="text-[11px] text-slate-400">— Top Workout Gear Section</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
                  Realtime Reactive
                </span>
              </div>

              {/* Exact Storefront TopPicksBanner Replica */}
              <div className="rounded-xl overflow-hidden bg-[#eaedee] p-5 sm:p-8 text-black border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div>
                    <span className="block text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-neutral-400 mb-1">
                      {workoutData.tag || 'OUR TOP PICKS'}
                    </span>
                    <h2 className="text-xl sm:text-3xl font-medium uppercase tracking-normal text-neutral-800 leading-[1.05]">
                      {workoutData.headingLine1 || 'TOP WORKOUT GEAR FOR'}
                    </h2>
                    <h2 className="text-xl sm:text-3xl font-medium uppercase tracking-normal text-neutral-800 leading-[1.05]">
                      {workoutData.headingLine2 || 'PEAK PERFORMANCE!'}
                    </h2>
                  </div>
                  <div className="max-w-xs text-neutral-600">
                    <p className="text-xs leading-relaxed">
                      {workoutData.subtitle || 'Discover the best of our collection, designed to power your workouts all year round.'}
                    </p>
                  </div>
                </div>

                {/* 2 Wide Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Card 1 Preview */}
                  <div className="relative h-[280px] sm:h-[340px] w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-md">
                    <img
                      src={getMediaUrl(workoutData.card1?.image || '/home img/workout_winter.jpg')}
                      alt="Card 1"
                      className="h-full w-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    {workoutData.card1?.season && (
                      <div className="absolute top-4 right-4 z-20">
                        <span className="text-[10px] font-mono font-medium tracking-widest text-neutral-300 uppercase bg-black/50 px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/20">
                          {workoutData.card1.season}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-12 left-5 z-20 max-w-[220px]">
                      <h3 className="text-sm sm:text-base font-medium uppercase tracking-wide leading-tight">
                        {parseHeadingLines(workoutData.card1?.heading).map((line, idx) => (
                          <span
                            key={idx}
                            className={`block ${idx >= 4 ? 'text-white/70 font-normal' : 'text-white font-medium'}`}
                          >
                            {line}
                          </span>
                        ))}
                      </h3>
                    </div>
                    {workoutData.card1?.tag && (
                      <div className="absolute bottom-3 left-5 z-20">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-[9px] font-mono tracking-widest text-neutral-300 uppercase">
                          <span className="w-1 h-1 rounded-full bg-neutral-300" />
                          {workoutData.card1.tag}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Card 2 Preview */}
                  <div className="relative h-[280px] sm:h-[340px] w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-md">
                    <img
                      src={getMediaUrl(workoutData.card2?.image || '/home img/workout_summer.jpg')}
                      alt="Card 2"
                      className="h-full w-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    {workoutData.card2?.season && (
                      <div className="absolute top-4 right-4 z-20">
                        <span className="text-[10px] font-mono font-medium tracking-widest text-neutral-300 uppercase bg-black/50 px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/20">
                          {workoutData.card2.season}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-12 left-5 z-20 max-w-[220px]">
                      <h3 className="text-sm sm:text-base font-medium uppercase tracking-wide leading-tight">
                        {parseHeadingLines(workoutData.card2?.heading).map((line, idx) => (
                          <span
                            key={idx}
                            className={`block ${idx < 2 ? 'text-white/70 font-normal' : 'text-white font-medium'}`}
                          >
                            {line}
                          </span>
                        ))}
                      </h3>
                    </div>
                    {workoutData.card2?.tag && (
                      <div className="absolute bottom-3 left-5 z-20">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-[9px] font-mono tracking-widest text-neutral-300 uppercase">
                          <span className="w-1 h-1 rounded-full bg-neutral-300" />
                          {workoutData.card2.tag}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EDIT FORM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Header Settings Card */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Section Header & Overline</span>
                </h3>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workoutData.isActive !== false}
                    onChange={(e) => setWorkoutData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                  />
                  <span>Show Section on Homepage</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Overline Tag Badge
                  </label>
                  <input
                    type="text"
                    value={workoutData.tag || ''}
                    onChange={(e) => setWorkoutData((prev) => ({ ...prev, tag: e.target.value }))}
                    placeholder="e.g. OUR TOP PICKS"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Heading Line 1
                  </label>
                  <input
                    type="text"
                    value={workoutData.headingLine1 || ''}
                    onChange={(e) => setWorkoutData((prev) => ({ ...prev, headingLine1: e.target.value }))}
                    placeholder="e.g. TOP WORKOUT GEAR FOR"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Heading Line 2
                  </label>
                  <input
                    type="text"
                    value={workoutData.headingLine2 || ''}
                    onChange={(e) => setWorkoutData((prev) => ({ ...prev, headingLine2: e.target.value }))}
                    placeholder="e.g. PEAK PERFORMANCE!"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Right Subtitle Paragraph
                </label>
                <input
                  type="text"
                  value={workoutData.subtitle || ''}
                  onChange={(e) => setWorkoutData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Discover the best of our collection, designed to power your workouts all year round."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>
            </div>

            {/* CARD 1 (LEFT FEATURE CARD) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Left Card (e.g. Winter / Back View)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Card 1</span>
              </div>

              {/* Image Input & Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Card 1 Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={workoutData.card1?.image || ''}
                    onChange={(e) =>
                      setWorkoutData((prev) => ({
                        ...prev,
                        card1: { ...prev.card1, image: e.target.value },
                      }))
                    }
                    placeholder="Image URL or /home img/workout_winter.jpg"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                  <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs">
                    {uploadingField === 'card1' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleUploadImage(
                          e,
                          (url) =>
                            setWorkoutData((prev) => ({
                              ...prev,
                              card1: { ...prev.card1, image: url },
                            })),
                          'card1'
                        )
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Season Badge & Tag Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Top-Right Season Badge</label>
                  <input
                    type="text"
                    value={workoutData.card1?.season || ''}
                    onChange={(e) =>
                      setWorkoutData((prev) => ({
                        ...prev,
                        card1: { ...prev.card1, season: e.target.value },
                      }))
                    }
                    placeholder="e.g. 01/WINTER _2025"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bottom Tag Badge</label>
                  <input
                    type="text"
                    value={workoutData.card1?.tag || ''}
                    onChange={(e) =>
                      setWorkoutData((prev) => ({
                        ...prev,
                        card1: { ...prev.card1, tag: e.target.value },
                      }))
                    }
                    placeholder="e.g. TOP SELLING GEAR"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>

              {/* Large Typography Multi-line Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Card Headline Text (Each line on a new row)
                </label>
                <textarea
                  rows={4}
                  value={
                    typeof workoutData.card1?.heading === 'string'
                      ? workoutData.card1.heading
                      : Array.isArray(workoutData.card1?.heading)
                      ? workoutData.card1.heading.join('\n')
                      : ''
                  }
                  onChange={(e) =>
                    setWorkoutData((prev) => ({
                      ...prev,
                      card1: { ...prev.card1, heading: e.target.value },
                    }))
                  }
                  placeholder="TOP&#10;WORKOUT&#10;GEAR FOR&#10;PEAK&#10;PERFORMA&#10;NICE!"
                  className="w-full font-mono rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              {/* Destination Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Click Link URL</label>
                <input
                  type="text"
                  value={workoutData.card1?.link || ''}
                  onChange={(e) =>
                    setWorkoutData((prev) => ({
                      ...prev,
                      card1: { ...prev.card1, link: e.target.value },
                    }))
                  }
                  placeholder="/products or /products?category=workout"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>
            </div>

            {/* CARD 2 (RIGHT FEATURE CARD) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Right Card (e.g. Summer / Profile View)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Card 2</span>
              </div>

              {/* Image Input & Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Card 2 Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={workoutData.card2?.image || ''}
                    onChange={(e) =>
                      setWorkoutData((prev) => ({
                        ...prev,
                        card2: { ...prev.card2, image: e.target.value },
                      }))
                    }
                    placeholder="Image URL or /home img/workout_summer.jpg"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                  <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs">
                    {uploadingField === 'card2' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleUploadImage(
                          e,
                          (url) =>
                            setWorkoutData((prev) => ({
                              ...prev,
                              card2: { ...prev.card2, image: url },
                            })),
                          'card2'
                        )
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Season Badge & Tag Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Top-Right Season Badge</label>
                  <input
                    type="text"
                    value={workoutData.card2?.season || ''}
                    onChange={(e) =>
                      setWorkoutData((prev) => ({
                        ...prev,
                        card2: { ...prev.card2, season: e.target.value },
                      }))
                    }
                    placeholder="e.g. 02/SUMMER _2025"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bottom Tag Badge</label>
                  <input
                    type="text"
                    value={workoutData.card2?.tag || ''}
                    onChange={(e) =>
                      setWorkoutData((prev) => ({
                        ...prev,
                        card2: { ...prev.card2, tag: e.target.value },
                      }))
                    }
                    placeholder="e.g. NEW ARRIVAL"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>

              {/* Large Typography Multi-line Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Card Headline Text (Each line on a new row)
                </label>
                <textarea
                  rows={4}
                  value={
                    typeof workoutData.card2?.heading === 'string'
                      ? workoutData.card2.heading
                      : Array.isArray(workoutData.card2?.heading)
                      ? workoutData.card2.heading.join('\n')
                      : ''
                  }
                  onChange={(e) =>
                    setWorkoutData((prev) => ({
                      ...prev,
                      card2: { ...prev.card2, heading: e.target.value },
                    }))
                  }
                  placeholder="LATEST&#10;STYLES AND&#10;INNOVATIONS&#10;IN WORKOUT&#10;GEAR."
                  className="w-full font-mono rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              {/* Destination Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Click Link URL</label>
                <input
                  type="text"
                  value={workoutData.card2?.link || ''}
                  onChange={(e) =>
                    setWorkoutData((prev) => ({
                      ...prev,
                      card2: { ...prev.card2, link: e.target.value },
                    }))
                  }
                  placeholder="/products or /products?category=activewear"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THE NOCTA COLLECTION */}
      {activeTab === 'nocta' && (
        <div className="space-y-6">
          {/* LIVE PREVIEW SECTION */}
          {showPreview && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Live Storefront Preview
                  </span>
                  <span className="text-[11px] text-slate-400">— Interactive Sliding Outfit Banner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    Slide {previewSlideIdx + 1} of {noctaData.slides?.length || 1}
                  </span>
                </div>
              </div>

              {/* Exact Storefront EditorialBanner Replica */}
              <div className="rounded-xl overflow-hidden bg-white p-6 sm:p-10 border border-slate-200 relative min-h-[380px] sm:min-h-[440px] flex flex-col md:flex-row md:items-center">
                {/* Headline Left */}
                <div className="w-full md:w-1/2 z-30 mb-6 md:mb-0 space-y-3">
                  <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-[0.94] text-black whitespace-pre-line">
                    {noctaData.headline || 'THE NOCTA\nCOLLECTION'}
                  </h2>
                  <p className="text-xs font-medium text-neutral-600 leading-relaxed">
                    {noctaData.subtitle || 'Made for the night shift. / Worn around the clock.'}
                  </p>
                  <div>
                    <span className="inline-flex items-center justify-center px-6 py-2 rounded-full border-[2px] border-black text-xs font-black uppercase tracking-wider text-black bg-transparent">
                      {noctaData.buttonText || 'Shop now'}
                    </span>
                  </div>
                </div>

                {/* Center Stage: Base Model + Outfits */}
                <div className="w-full md:w-1/2 flex items-center justify-center relative h-[260px] sm:h-[320px]">
                  {/* Prev Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewSlideIdx(
                        (prev) => (prev - 1 + noctaData.slides.length) % noctaData.slides.length
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-800 shadow-md hover:bg-neutral-900 hover:text-white transition cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Stage Image Container */}
                  <div className="relative w-[180px] sm:w-[220px] h-full flex items-end justify-center">
                    {/* Base Model Silhouette */}
                    <img
                      src={getMediaUrl(noctaData.baseModelImage || '/nocta-stage/model-base.jpg')}
                      alt="Base Silhouette"
                      className="absolute inset-0 w-full h-full object-contain object-bottom pointer-events-none"
                    />

                    {/* Active Garment Overlay */}
                    {noctaData.slides?.[previewSlideIdx] && (
                      <div className="absolute inset-0 z-20 flex items-end justify-center animate-in fade-in zoom-in-95 duration-300">
                        <img
                          src={getMediaUrl(noctaData.slides[previewSlideIdx].garment)}
                          alt={noctaData.slides[previewSlideIdx].name}
                          className="w-full h-full object-contain object-bottom"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/nocta-stage/garment-01.png';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewSlideIdx((prev) => (prev + 1) % noctaData.slides.length)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-800 shadow-md hover:bg-neutral-900 hover:text-white transition cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Outfit Info Pill at bottom right */}
                {noctaData.slides?.[previewSlideIdx] && (
                  <div className="absolute bottom-3 right-4 z-20 bg-neutral-100/90 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-mono font-bold text-neutral-800 border border-neutral-200">
                    {noctaData.slides[previewSlideIdx].name} • {noctaData.slides[previewSlideIdx].category}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EDIT FORM */}
          <div className="space-y-6">
            {/* General Info Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">Section Titles & Model Silhouette</h3>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noctaData.isActive !== false}
                    onChange={(e) => setNoctaData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                  />
                  <span>Show Section on Homepage</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Main Headline</label>
                  <textarea
                    rows={2}
                    value={noctaData.headline || ''}
                    onChange={(e) => setNoctaData((prev) => ({ ...prev, headline: e.target.value }))}
                    placeholder="THE NOCTA&#10;COLLECTION"
                    className="w-full font-sans rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle Line</label>
                  <textarea
                    rows={2}
                    value={noctaData.subtitle || ''}
                    onChange={(e) => setNoctaData((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Made for the night shift. / Worn around the clock."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={noctaData.buttonText || ''}
                    onChange={(e) => setNoctaData((prev) => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="e.g. Shop now"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                  <label className="block text-xs font-bold text-slate-700 mt-2 mb-1">CTA Button Link</label>
                  <input
                    type="text"
                    value={noctaData.buttonLink || ''}
                    onChange={(e) => setNoctaData((prev) => ({ ...prev, buttonLink: e.target.value }))}
                    placeholder="/products"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Model Silhouette</label>
                  <input
                    type="text"
                    value={noctaData.baseModelImage || ''}
                    onChange={(e) => setNoctaData((prev) => ({ ...prev, baseModelImage: e.target.value }))}
                    placeholder="/nocta-stage/model-base.jpg"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                  <div className="mt-2">
                    <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs">
                      {uploadingField === 'baseModel' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      <span>Upload Model Base</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleUploadImage(
                            e,
                            (url) => setNoctaData((prev) => ({ ...prev, baseModelImage: url })),
                            'baseModel'
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Garment Outfits List Manager */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Garment Outfits ({noctaData.slides?.length || 0})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Transparent PNG cutout images work best so the garments drape seamlessly over the model silhouette.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-1.5 text-xs font-bold text-white hover:bg-neutral-800 shadow-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Outfit</span>
                </button>
              </div>

              <div className="space-y-3.5">
                {noctaData.slides?.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition"
                  >
                    {/* Thumbnail preview */}
                    <div className="h-14 w-12 rounded-lg bg-neutral-900 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center relative">
                      <img
                        src={getMediaUrl(slide.garment)}
                        alt={slide.name}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/nocta-stage/garment-01.png';
                        }}
                      />
                    </div>

                    {/* Outfit Name */}
                    <div className="flex-1 w-full md:w-auto">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                        Outfit Name
                      </label>
                      <input
                        type="text"
                        value={slide.name || ''}
                        onChange={(e) => handleUpdateSlide(idx, 'name', e.target.value)}
                        placeholder="e.g. PUFFER JACKET 01"
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold focus:border-black focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>

                    {/* Category / Drop */}
                    <div className="flex-1 w-full md:w-auto">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                        Category / Drop Tag
                      </label>
                      <input
                        type="text"
                        value={slide.category || ''}
                        onChange={(e) => handleUpdateSlide(idx, 'category', e.target.value)}
                        placeholder="e.g. OUTERWEAR / DROP 01"
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>

                    {/* Garment Image URL or Upload */}
                    <div className="flex-1 w-full md:w-auto">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                        Garment Cutout Image
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={slide.garment || ''}
                          onChange={(e) => handleUpdateSlide(idx, 'garment', e.target.value)}
                          placeholder="/nocta-stage/garment-01.png"
                          className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono focus:border-black focus:ring-1 focus:ring-black outline-none"
                        />
                        <label className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer">
                          {uploadingField === `slide_${idx}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleUploadImage(
                                e,
                                (url) => handleUpdateSlide(idx, 'garment', url),
                                `slide_${idx}`
                              )
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Click Link */}
                    <div className="w-full md:w-40">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                        Link URL
                      </label>
                      <input
                        type="text"
                        value={slide.link || ''}
                        onChange={(e) => handleUpdateSlide(idx, 'link', e.target.value)}
                        placeholder="/products"
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>

                    {/* Delete action */}
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(idx)}
                      className="inline-flex items-center justify-center p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer mt-2 md:mt-4 self-end md:self-center"
                      title="Delete Slide"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INSTAGRAM PROMO BANNER */}
      {activeTab === 'instagram' && (
        <div className="space-y-6">
          {/* Header & Quick Action Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-xl shadow-xs">
                <InstagramIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Homepage Instagram Promo Banner
                </h2>
                <p className="text-xs text-slate-500">
                  Full-width streetwear banner displayed across your storefront homepage. Edit the graphic and click redirect link.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setInstagramData(DEFAULT_INSTAGRAM_DATA)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Default</span>
              </button>

              <button
                type="button"
                onClick={handleSaveInstagram}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-black px-5 py-2 text-xs font-bold text-white hover:bg-neutral-800 shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Banner Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* LIVE STOREFRONT PREVIEW */}
          {showPreview && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Realtime Storefront Preview
                  </span>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    {instagramData.isActive !== false ? '● Visible on Homepage' : '○ Hidden from Homepage'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="font-mono text-xs text-indigo-600 font-semibold truncate max-w-xs">
                    Target: {instagramData.link || 'https://instagram.com/amayaar.in'}
                  </span>
                  {instagramData.openInNewTab !== false && (
                    <span className="rounded bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 font-medium">
                      New Tab ↗
                    </span>
                  )}
                </div>
              </div>

              {/* Banner Graphic Preview */}
              <div className="overflow-hidden rounded-xl bg-black p-2 sm:p-4 border border-neutral-900 shadow-inner">
                <div className="relative group overflow-hidden rounded-lg">
                  <a
                    href={instagramData.link || 'https://instagram.com/amayaar.in'}
                    target={instagramData.openInNewTab !== false ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="block w-full cursor-pointer"
                    title={instagramData.title || 'Follow AMA YAAR on Instagram'}
                  >
                    <img
                      src={getMediaUrl(instagramData.image || '/insta-banner-1920x500.jpg')}
                      alt={instagramData.title || 'Instagram Banner Preview'}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/insta-banner-1920x500.jpg';
                      }}
                      className="w-full h-auto aspect-[1920/500] object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                  </a>
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <ExternalLink className="h-3 w-3 text-pink-400" />
                    <span>Clicking redirects to {instagramData.link || 'Instagram'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="italic">
                  * Hover over or click the preview banner to test the redirect link.
                </span>
                <a
                  href={instagramData.link || 'https://instagram.com/amayaar.in'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Test Redirect in New Tab</span>
                </a>
              </div>
            </div>
          )}

          {/* Configuration Form Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Banner Configuration & Click Action
            </h3>

            {/* Banner Image Upload & URL */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-slate-700">
                Banner Graphic Image *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={instagramData.image || ''}
                      onChange={(e) =>
                        setInstagramData((prev) => ({ ...prev, image: e.target.value }))
                      }
                      placeholder="/insta-banner-1920x500.jpg or Cloudinary Image URL"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                  <label className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition shrink-0">
                    {uploadingField === 'insta_banner' ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Graphic</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleUploadImage(
                          e,
                          (url) => setInstagramData((prev) => ({ ...prev, image: url })),
                          'insta_banner'
                        )
                      }
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="md:col-span-4 flex items-center gap-3">
                  <div className="h-12 w-28 rounded-lg bg-black overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={getMediaUrl(instagramData.image || '/insta-banner-1920x500.jpg')}
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/insta-banner-1920x500.jpg';
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <p className="font-semibold text-slate-700">Recommended Size:</p>
                    <p>1920 x 500 px (Landscape wide banner)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Click Redirect Link */}
            <div className="space-y-2 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase text-slate-700">
                  Banner Click Redirect Link *
                </label>
                <span className="text-[11px] text-slate-400">Where visitors go when clicking</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <LinkIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={instagramData.link || ''}
                  onChange={(e) =>
                    setInstagramData((prev) => ({ ...prev, link: e.target.value }))
                  }
                  placeholder="https://instagram.com/amayaar.in or /products"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-xs font-mono font-medium text-slate-900 focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() =>
                    setInstagramData((prev) => ({
                      ...prev,
                      link: 'https://instagram.com/amayaar.in',
                      openInNewTab: true,
                    }))
                  }
                  className="rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                >
                  Instagram Profile (@amayaar.in)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInstagramData((prev) => ({
                      ...prev,
                      link: '/products',
                      openInNewTab: false,
                    }))
                  }
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                >
                  All Products (/products)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInstagramData((prev) => ({
                      ...prev,
                      link: '/products?category=men',
                      openInNewTab: false,
                    }))
                  }
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                >
                  Men Collection
                </button>
              </div>
            </div>

            {/* Link Behavior & Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-100 pt-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Banner Accessibility Title / Alt Text
                </label>
                <input
                  type="text"
                  value={instagramData.title || ''}
                  onChange={(e) =>
                    setInstagramData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Follow AMA YAAR on Instagram (@amayaar.in)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Redirect Behavior
                </label>
                <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer hover:bg-slate-100/70 transition">
                  <input
                    type="checkbox"
                    checked={instagramData.openInNewTab !== false}
                    onChange={(e) =>
                      setInstagramData((prev) => ({ ...prev, openInNewTab: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Open in New Tab (target="_blank")
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Recommended for Instagram so customers don't lose their place on your store
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="border-t border-slate-100 pt-5">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={instagramData.isActive !== false}
                  onChange={(e) =>
                    setInstagramData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Publish this Instagram Banner on Storefront Homepage
                  </span>
                  <span className="text-[11px] text-slate-500">
                    When unchecked, the banner will be hidden from the homepage without deleting your settings.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HAPPY CUSTOMERS (REVIEWS RAIL) */}
      {activeTab === 'happy_customers' && (
        <div className="space-y-6">
          {/* LIVE PREVIEW SECTION */}
          {showPreview && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Live Storefront Preview
                  </span>
                </div>
                <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-700 border border-amber-200">
                  HOMEPAGE SECTION 8
                </span>
              </div>

              {/* Preview Container mimicking Storefront layout */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 sm:p-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                        Customer Testimonials Rail
                      </span>
                      {happyCustomersData.isActive === false && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                          Hidden on Homepage
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 uppercase">
                      {happyCustomersData.headingPrefix || 'OUR HAPPY'}{' '}
                      <span
                        className="font-serif italic font-normal lowercase tracking-normal text-3xl sm:text-4xl text-neutral-800"
                        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                      >
                        {happyCustomersData.headingHighlight || 'Customers'}
                      </span>
                    </h2>
                    {happyCustomersData.subtitle && (
                      <p className="mt-1 text-xs text-neutral-500 max-w-xl">
                        {happyCustomersData.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Scroll controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('admin-happy-slider');
                        if (el) el.scrollBy({ left: -340, behavior: 'smooth' });
                      }}
                      className="h-8 w-8 rounded-full border border-neutral-300 bg-white flex items-center justify-center hover:bg-neutral-100 transition shadow-2xs cursor-pointer"
                      title="Scroll left"
                    >
                      <ChevronLeft className="h-4 w-4 text-neutral-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('admin-happy-slider');
                        if (el) el.scrollBy({ left: 340, behavior: 'smooth' });
                      }}
                      className="h-8 w-8 rounded-full border border-neutral-300 bg-white flex items-center justify-center hover:bg-neutral-100 transition shadow-2xs cursor-pointer"
                      title="Scroll right"
                    >
                      <ChevronRight className="h-4 w-4 text-neutral-700" />
                    </button>
                  </div>
                </div>

                {/* Cards Rail */}
                <div
                  id="admin-happy-slider"
                  className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scroll-smooth snap-x"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {(happyCustomersData.reviews || []).map((r, i) => (
                    <div
                      key={r.id || i}
                      className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start rounded-2xl border border-neutral-200/90 bg-white p-5 flex flex-col justify-between shadow-xs transition hover:shadow-md"
                    >
                      <div>
                        {/* Rating Stars & Relative Date */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, s) => (
                              <Star
                                key={s}
                                className={`h-4 w-4 ${
                                  s < (r.rating || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-neutral-200 text-neutral-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-medium text-neutral-400">
                            {r.date || '2 weeks ago'}
                          </span>
                        </div>

                        {/* Customer Avatar & Name */}
                        <div className="flex items-center gap-3 mb-3">
                          {r.avatar ? (
                            <img
                              src={getMediaUrl(r.avatar)}
                              alt={r.name}
                              className="h-10 w-10 rounded-full object-cover border border-neutral-200 shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white font-bold text-xs">
                              {r.name?.charAt(0) || 'C'}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-neutral-900">{r.name}</span>
                              {r.isVerified !== false && (
                                <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-600 text-white shrink-0" />
                              )}
                            </div>
                            {r.isVerified !== false && (
                              <span className="text-[11px] font-semibold text-emerald-700">
                                Verified Buyer
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Review Quote */}
                        <p className="text-xs sm:text-[13px] leading-relaxed text-neutral-600 font-normal">
                          &ldquo;{r.text}&rdquo;
                        </p>
                      </div>

                      {/* Purchased Item Card */}
                      {r.product && r.product.name && (
                        <div className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-2.5">
                          {r.product.image ? (
                            <img
                              src={getMediaUrl(r.product.image)}
                              alt={r.product.name}
                              className="h-11 w-11 rounded-lg object-cover bg-white border border-neutral-200 shrink-0"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-lg bg-neutral-200 flex items-center justify-center shrink-0 text-neutral-400 text-xs">
                              Item
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                              Purchased Item
                            </span>
                            <p className="mt-0.5 text-xs font-bold text-neutral-900 truncate">
                              {r.product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                              {r.product.variant && (
                                <span className="font-medium text-neutral-600 truncate">{r.product.variant}</span>
                              )}
                              {r.product.variant && r.product.price && <span>•</span>}
                              {r.product.price && (
                                <span className="font-extrabold text-black">₹{r.product.price}</span>
                              )}
                            </div>
                          </div>
                          <div className="h-7 w-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 text-neutral-500">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION HEADER & VISIBILITY CONFIG */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                1. Section Headings & Visibility
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure the section title, cursive italic accent, subtitle, and homepage display toggle.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Heading Prefix
                </label>
                <input
                  type="text"
                  value={happyCustomersData.headingPrefix || ''}
                  onChange={(e) =>
                    setHappyCustomersData((prev) => ({ ...prev, headingPrefix: e.target.value }))
                  }
                  placeholder="OUR HAPPY"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">Bold uppercase prefix (e.g. "OUR HAPPY")</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Heading Highlight (Cursive / Script)
                </label>
                <input
                  type="text"
                  value={happyCustomersData.headingHighlight || ''}
                  onChange={(e) =>
                    setHappyCustomersData((prev) => ({ ...prev, headingHighlight: e.target.value }))
                  }
                  placeholder="Customers"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-serif italic text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Styled in elegant cursive font (e.g. "Customers")</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Section Subtitle / Description (Optional)
              </label>
              <input
                type="text"
                value={happyCustomersData.subtitle || ''}
                onChange={(e) =>
                  setHappyCustomersData((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                placeholder="Real style, real comfort. Here is what our customers have to say about AMA YAAR."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none"
              />
            </div>

            {/* Visibility Checkbox */}
            <div className="border-t border-slate-100 pt-4">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={happyCustomersData.isActive !== false}
                  onChange={(e) =>
                    setHappyCustomersData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Publish this "OUR HAPPY Customers" reviews rail on Storefront Homepage
                  </span>
                  <span className="text-[11px] text-slate-500">
                    When unchecked, the reviews rail will be safely hidden from customers without deleting your data.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* CUSTOMER REVIEWS MANAGER */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                    2. Customer Review Cards ({happyCustomersData.reviews?.length || 0})
                  </h3>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                    Carousel Items
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add, edit, reorder, or delete review cards shown in the homepage carousel.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddReview}
                className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Customer Review</span>
              </button>
            </div>

            {/* Review Items List */}
            {(!happyCustomersData.reviews || happyCustomersData.reviews.length === 0) ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <Star className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No review cards added yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Click the button above to add your first customer testimonial.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {happyCustomersData.reviews.map((r, idx) => (
                  <div
                    key={r.id || idx}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-slate-300 transition"
                  >
                    {/* Left: Reorder Controls + Customer Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Move Up / Down Buttons */}
                      <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveReview(idx, 'up')}
                          className="h-6 w-6 rounded border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-black hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === happyCustomersData.reviews.length - 1}
                          onClick={() => handleMoveReview(idx, 'down')}
                          className="h-6 w-6 rounded border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-black hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {r.avatar ? (
                          <img
                            src={getMediaUrl(r.avatar)}
                            alt={r.name}
                            className="h-11 w-11 rounded-full object-cover border border-slate-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                            {r.name?.charAt(0) || 'C'}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          #{idx + 1}
                        </span>
                      </div>

                      {/* Details & Review text */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{r.name}</span>
                          {r.isVerified !== false && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600 fill-emerald-600 text-white" />
                              Verified
                            </span>
                          )}
                          <div className="flex items-center gap-0.5 ml-1">
                            {[...Array(5)].map((_, s) => (
                              <Star
                                key={s}
                                className={`h-3 w-3 ${
                                  s < (r.rating || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-slate-200 text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium ml-1">
                            {r.date || '2 weeks ago'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 line-clamp-2 italic">
                          &ldquo;{r.text}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Middle: Linked Product Preview */}
                    {r.product && r.product.name ? (
                      <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2 shrink-0 md:max-w-xs">
                        {r.product.image ? (
                          <img
                            src={getMediaUrl(r.product.image)}
                            alt={r.product.name}
                            className="h-10 w-10 rounded object-cover border border-slate-100 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                            No img
                          </div>
                        )}
                        <div className="min-w-0 flex-1 text-left">
                          <span className="text-[9px] font-extrabold uppercase text-emerald-700 tracking-wider">
                            Purchased Item
                          </span>
                          <p className="text-[11px] font-bold text-slate-900 truncate">
                            {r.product.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {r.product.variant || ''} {r.product.price ? `• ₹${r.product.price}` : ''}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic shrink-0">
                        No product attached
                      </div>
                    )}

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditReview(r, idx)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-black transition cursor-pointer shadow-2xs"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(idx)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer shadow-2xs"
                        title="Delete review"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CUSTOMER REVIEW */}
      {isReviewModalOpen && editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    {editingReviewIdx >= 0 ? 'Edit Customer Review' : 'Add New Customer Review'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Featured testimonial for storefront homepage review rail
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setEditingReview(null);
                  setEditingReviewIdx(-1);
                }}
                className="h-8 w-8 rounded-lg border border-slate-200 text-slate-400 hover:text-black hover:bg-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveReviewModal} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* SECTION A: Customer Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Customer Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Customer Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingReview.name || ''}
                      onChange={(e) =>
                        setEditingReview((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g. Vansh Singh"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date Display Text
                    </label>
                    <input
                      type="text"
                      value={editingReview.date || ''}
                      onChange={(e) =>
                        setEditingReview((prev) => ({ ...prev, date: e.target.value }))
                      }
                      placeholder="e.g. 2 weeks ago, 3 weeks ago, Yesterday"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                </div>

                {/* Rating & Verified Buyer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rating (Stars)
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setEditingReview((prev) => ({ ...prev, rating: s }))}
                          className="p-1 hover:scale-110 transition cursor-pointer"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              s <= (editingReview.rating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">
                        {editingReview.rating || 5} out of 5
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5 cursor-pointer hover:bg-slate-100 transition mt-4 sm:mt-0">
                      <input
                        type="checkbox"
                        checked={editingReview.isVerified !== false}
                        onChange={(e) =>
                          setEditingReview((prev) => ({ ...prev, isVerified: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Verified Buyer Badge
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Displays green badge next to name
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Avatar Image */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Photo / Avatar
                  </label>
                  <div className="flex items-center gap-3">
                    {editingReview.avatar ? (
                      <img
                        src={getMediaUrl(editingReview.avatar)}
                        alt="Avatar preview"
                        className="h-12 w-12 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {editingReview.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={editingReview.avatar || ''}
                        onChange={(e) =>
                          setEditingReview((prev) => ({ ...prev, avatar: e.target.value }))
                        }
                        placeholder="Image URL or upload below (e.g. https://... or /model03.png)"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none font-mono"
                      />
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs">
                          <Upload className="h-3 w-3" />
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleUploadImage(
                                e,
                                (url) => setEditingReview((prev) => ({ ...prev, avatar: url })),
                                'review_avatar'
                              )
                            }
                          />
                        </label>
                        {uploadingField === 'review_avatar' && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                          </span>
                        )}
                        {editingReview.avatar && (
                          <button
                            type="button"
                            onClick={() => setEditingReview((prev) => ({ ...prev, avatar: '' }))}
                            className="text-xs text-rose-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Review Quote <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editingReview.text || ''}
                    onChange={(e) =>
                      setEditingReview((prev) => ({ ...prev, text: e.target.value }))
                    }
                    placeholder="Enter customer's review comment (e.g. Polo T-shirt ka fabric premium feel deta hai...)"
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>

              {/* SECTION B: Purchased Item Information */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Purchased Item Badge (Optional)
                  </h4>
                  <span className="text-[11px] text-slate-400">Card pill shown at bottom of review</span>
                </div>

                {/* Quick Catalog Selector */}
                {availableProducts.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Quick Auto-Fill from Store Catalog:
                    </label>
                    <select
                      value={selectedProductFilter}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="">-- Choose a Product to Auto-Fill --</option>
                      {availableProducts.map((p) => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.title || p.name} (₹{p.salePrice || p.price || 499})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={editingReview.product?.name || ''}
                      onChange={(e) =>
                        setEditingReview((prev) => ({
                          ...prev,
                          product: { ...prev.product, name: e.target.value },
                        }))
                      }
                      placeholder="e.g. Classic Heavyweight Polo T-Shirt"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={editingReview.product?.price ?? ''}
                      onChange={(e) =>
                        setEditingReview((prev) => ({
                          ...prev,
                          product: { ...prev.product, price: e.target.value },
                        }))
                      }
                      placeholder="499"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Variant Info (Size & Color)
                    </label>
                    <input
                      type="text"
                      value={editingReview.product?.variant || ''}
                      onChange={(e) =>
                        setEditingReview((prev) => ({
                          ...prev,
                          product: { ...prev.product, variant: e.target.value },
                        }))
                      }
                      placeholder="e.g. Size: M • Slate Black"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Product Slug / URL
                    </label>
                    <input
                      type="text"
                      value={editingReview.product?.slug || ''}
                      onChange={(e) =>
                        setEditingReview((prev) => ({
                          ...prev,
                          product: { ...prev.product, slug: e.target.value },
                        }))
                      }
                      placeholder="e.g. mens-classic-polo-t-shirt"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Product Thumbnail */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Image Thumbnail
                  </label>
                  <div className="flex items-center gap-3">
                    {editingReview.product?.image ? (
                      <img
                        src={getMediaUrl(editingReview.product.image)}
                        alt="Product preview"
                        className="h-12 w-12 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center text-xs shrink-0">
                        None
                      </div>
                    )}
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={editingReview.product?.image || ''}
                        onChange={(e) =>
                          setEditingReview((prev) => ({
                            ...prev,
                            product: { ...prev.product, image: e.target.value },
                          }))
                        }
                        placeholder="/model03.png or full image URL"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-black focus:ring-1 focus:ring-black outline-none font-mono"
                      />
                      <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs">
                        <Upload className="h-3 w-3" />
                        <span>Upload Product Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleUploadImage(
                              e,
                              (url) =>
                                setEditingReview((prev) => ({
                                  ...prev,
                                  product: { ...prev.product, image: url },
                                })),
                              'review_prod_image'
                            )
                          }
                        />
                      </label>
                      {uploadingField === 'review_prod_image' && (
                        <span className="text-xs text-slate-500 ml-2">Uploading...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setEditingReview(null);
                    setEditingReviewIdx(-1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-black px-5 py-2 text-xs font-bold text-white hover:bg-neutral-800 shadow-sm transition cursor-pointer"
                >
                  {editingReviewIdx >= 0 ? 'Update Review Card' : 'Save Review Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
