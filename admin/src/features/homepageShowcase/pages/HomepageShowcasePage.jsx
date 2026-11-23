import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import api from '../../../lib/axios';
import { getMediaUrl } from '../../../utils/mediaUrl';

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

export default function HomepageShowcasePage() {
  const [activeTab, setActiveTab] = useState('workout'); // 'workout' | 'nocta'
  const [workoutData, setWorkoutData] = useState(DEFAULT_WORKOUT_DATA);
  const [noctaData, setNoctaData] = useState(DEFAULT_NOCTA_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  // Nocta preview state
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const [resWorkout, resNocta] = await Promise.allSettled([
        api.get('/homepage-sections/workout_top_picks', { params: { _t: Date.now() } }),
        api.get('/homepage-sections/editorial_nocta', { params: { _t: Date.now() } }),
      ]);

      if (resWorkout.status === 'fulfilled' && resWorkout.value?.data?.data) {
        setWorkoutData((prev) => ({ ...prev, ...resWorkout.value.data.data }));
      }
      if (resNocta.status === 'fulfilled' && resNocta.value?.data?.data) {
        setNoctaData((prev) => ({ ...prev, ...resNocta.value.data.data }));
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
            onClick={activeTab === 'workout' ? handleSaveWorkout : handleSaveNocta}
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
      <div className="flex border-b border-slate-200 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('workout')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition cursor-pointer ${
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
          onClick={() => setActiveTab('nocta')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition cursor-pointer ${
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
    </div>
  );
}
