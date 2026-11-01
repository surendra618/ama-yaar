import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import api from '../lib/axios';
import { getMediaUrl } from '../utils/mediaUrl';

const LOOKS = [
  {
    id: 1,
    code: 'JACKET 01',
    title: 'SOLAR PUFFER JACKET',
    subtitle: 'NIGHT SHIFT EDITION',
    tag: 'FALL / WINTER 2026',
    season: '2026 RUNWAY DROP',
    drop: 'DROP 01',
    status: 'IN STOCK',
    gsm: '320 GSM THERMAL DOWN',
    fit: 'AGGRESSIVE BOXY CUT',
    color: 'Solar Gold / Orange',
    price: '₹3,499',
    category1: 'THERMAL PUFFER',
    category2: 'WEATHERPROOF DOWN',
    image: '/editorial-looks/nocta_look1.png',
    fallback: '/editorial-looks/nocta_look1.png',
    isCutout: true,
  },
  {
    id: 2,
    code: 'JACKET 02',
    title: 'TACTICAL MATRIX UTILITY',
    subtitle: 'STREET MATRIX',
    tag: 'LIMITED RUN',
    season: 'STREET COUTURE',
    drop: 'DROP 02',
    status: 'LOW STOCK',
    gsm: '260 GSM COMBED',
    fit: 'BOXY OVERSIZED',
    color: 'Tactical Stone',
    price: '₹2,999',
    category1: 'TACTICAL UTILITY',
    category2: '6-POCKET CARGO',
    image: '/editorial-looks/look2-tactical-matrix.png',
    fallback: '/editorial-looks/look2-tactical-matrix.png',
    isCutout: true,
  },
  {
    id: 3,
    code: 'JACKET 03',
    title: 'RAW VINTAGE FIT',
    subtitle: 'OVERSIZED DRIP',
    tag: 'TIMELESS CUT',
    season: '2026 EDITION',
    drop: 'EXCLUSIVE DROP',
    status: 'FLAGSHIP PIECE',
    gsm: '280 GSM FLEECE',
    fit: 'DROP SHOULDER',
    color: 'Acid Charcoal',
    price: '₹2,799',
    category1: 'BAGGY DENIM',
    category2: 'ACID WASH TEE',
    image: '/editorial-looks/look3-raw-vintage.png',
    fallback: '/editorial-looks/look3-raw-vintage.png',
    isCutout: true,
  },
  {
    id: 4,
    code: 'JACKET 04',
    title: 'STEALTH BOMBER PUFFER',
    subtitle: 'ALL-WEATHER SHELL',
    tag: 'CORE ESSENTIAL',
    season: 'FALL / WINTER',
    drop: 'DROP 04',
    status: 'SELLING FAST',
    gsm: '320 GSM ALL-WEATHER',
    fit: 'RELAXED BOMBER CUT',
    color: 'Stealth Matte Black',
    price: '₹3,799',
    category1: 'STEALTH PUFFER',
    category2: 'WEATHERPROOF SHELL',
    image: '/editorial-looks/nocta_look4.png',
    fallback: '/editorial-looks/nocta_look4.png',
    isCutout: true,
  },
  {
    id: 5,
    code: 'JACKET 05',
    title: 'BOXY UTILITY OVERSHIRT',
    subtitle: 'URBAN EXPLORER',
    tag: 'AVANT-GARDE',
    season: '2026 EDITION',
    drop: 'CYBER DROP',
    status: 'NEW ARRIVAL',
    gsm: '250 GSM BIO-WASH',
    fit: 'ENGINEERED DRAPE',
    color: 'Olive Slate',
    price: '₹2,699',
    category1: 'UTILITY OVERSHIRT',
    category2: 'TECHNICAL CARGO',
    image: '/editorial-looks/look5-boxy-utility.png',
    fallback: '/editorial-looks/look5-boxy-utility.png',
    isCutout: true,
  },
];

export default function EditorialBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dbLooks, setDbLooks] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    api
      .get('/editorial-looks')
      .then((res) => {
        const resData = res.data;
        if (resData && resData.data && resData.data.length > 0) {
          const parsed = resData.data.map((item, idx) => ({
            id: item._id || idx + 1,
            code: item.code || `JACKET 0${idx + 1}`,
            title: item.title,
            subtitle: item.subtitle,
            tag: item.tag || 'EXCLUSIVE',
            season: item.season || '2026 EDITION',
            drop: item.drop || `DROP 0${idx + 1}`,
            status: item.status || 'IN STOCK',
            gsm: item.gsm || '280 GSM',
            fit: item.fit || 'OVERSIZED CUT',
            color: item.color || 'Custom Color',
            price: item.price ? `₹${item.price}` : '₹2,999',
            category1: item.category1 || 'TOP LAYER',
            category2: item.category2 || 'BOTTOM LAYER',
            image: item.image ? getMediaUrl(item.image) : (LOOKS[idx]?.image || '/editorial-looks/nocta_look1.png'),
            fallback: item.fallback || (LOOKS[idx]?.fallback || '/editorial-looks/nocta_look1.png'),
            isCutout: true,
          }));
          setDbLooks(parsed);
        }
      })
      .catch(() => {});
  }, []);

  const displayLooks = dbLooks.length > 0 ? dbLooks : LOOKS;

  // Auto-cycle look every 4.5 seconds unless paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayLooks.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, displayLooks.length]);

  const activeLook = displayLooks[currentIndex] || displayLooks[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayLooks.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayLooks.length) % displayLooks.length);
  };

  return (
    <section
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full bg-[#fafafa] text-neutral-900 py-10 sm:py-16 select-none overflow-hidden relative border-t border-b border-neutral-200/80"
    >
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f7f8fa] to-[#f0f2f5] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_15%,rgba(225,29,72,0.03),transparent_70%)] pointer-events-none" />

      {/* Main Container */}
      <div className="mx-auto max-w-[1520px] px-4 sm:px-8 lg:px-14 relative z-10">
        
        {/* Editorial Top Eyebrow */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-neutral-200/70">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#e11d48] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#e11d48]">
              AMA YAAR EDITORIAL
            </span>
            <span className="text-neutral-300 hidden sm:inline">|</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 hidden sm:inline">
              CURATED STREETWEAR LOOKBOOK
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase bg-neutral-200/60 px-2.5 py-1 rounded">
              SERIES 0{currentIndex + 1} / 0{displayLooks.length}
            </span>
          </div>
        </div>

        {/* Hero Showcase Grid: Left Typography + Center Model + Right Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-4 min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] relative">
          
          {/* LEFT COLUMN: Large Editorial Typography & Call to Action */}
          <div className="lg:col-span-4 z-20 flex flex-col justify-center text-left space-y-5 sm:space-y-6 pt-4 lg:pt-0">
            
            <div className="space-y-2">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.22em] text-neutral-500">
                EXCLUSIVE STREET DROP
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black uppercase tracking-[-0.03em] text-neutral-900 leading-[0.92] font-display">
                THE AMA YAAR
                <br />
                <span className="text-neutral-900">COLLECTION</span>
              </h1>
            </div>

            <p className="text-xs sm:text-sm font-medium tracking-wide text-neutral-600 max-w-sm uppercase leading-relaxed">
              Made for the night shift. / Worn around the clock.
            </p>

            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-95 group"
              >
                <span>Shop now</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Active Look Quick Summary on Mobile/Desktop */}
            <div className="pt-4 border-t border-neutral-200/80 max-w-xs space-y-1">
              <div className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                CURRENT OUTFIT
              </div>
              <div className="text-sm font-black uppercase text-neutral-900 tracking-tight">
                {activeLook.code || `JACKET 0${currentIndex + 1}`} — {activeLook.title}
              </div>
              <div className="text-xs text-neutral-500 font-medium">
                {activeLook.subtitle} · {activeLook.price}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Full-Height Streetwear Model with Seamless Cutout & Transition */}
          <div className="lg:col-span-5 h-[420px] sm:h-[500px] lg:h-[600px] relative flex items-center justify-center overflow-hidden z-10">
            {/* Ambient Center Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(240,242,245,0.4)_65%,transparent_100%)] pointer-events-none" />

            {/* Model Grounding Shadow */}
            <div className="absolute bottom-6 sm:bottom-8 w-44 sm:w-60 h-5 sm:h-7 bg-neutral-950/20 blur-md rounded-[100%] pointer-events-none z-0" />

            {/* Cross-fading Model Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLook.id || currentIndex}
                initial={{ opacity: 0, scale: 0.97, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -12 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full h-full flex items-center justify-center"
              >
                <img
                  src={activeLook.image}
                  alt={activeLook.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = activeLook.fallback || '/editorial-looks/nocta_look1.png';
                  }}
                  className="max-h-[92%] sm:max-h-[96%] w-auto object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.18)] filter contrast-[1.03] select-none pointer-events-none"
                  loading="eager"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Luxury Editorial Specification Card */}
          <div className="lg:col-span-3 z-20 flex flex-col justify-center items-start lg:items-end">
            <div className="w-full max-w-xs bg-white/90 backdrop-blur-md border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#e11d48] uppercase bg-rose-50 px-2 py-0.5 rounded">
                  {activeLook.tag || 'RUNWAY EXCLUSIVE'}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 uppercase">
                  {activeLook.season || '2026 EDITION'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-neutral-900 leading-snug">
                  {activeLook.title}
                </h3>
                <p className="text-xs font-semibold text-neutral-500 uppercase mt-0.5">
                  {activeLook.subtitle}
                </p>
              </div>

              <div className="space-y-2 text-xs font-medium text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-neutral-400 uppercase font-mono">FABRIC:</span>
                  <span className="font-bold text-neutral-800">{activeLook.gsm || '320 GSM'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-neutral-400 uppercase font-mono">FIT:</span>
                  <span className="font-bold text-neutral-800">{activeLook.fit || 'AGGRESSIVE TAPER'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-neutral-400 uppercase font-mono">COLORWAY:</span>
                  <span className="font-bold text-neutral-800 truncate max-w-[130px] text-right">{activeLook.color}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-neutral-400 uppercase font-mono">PRICE:</span>
                  <span className="font-black text-neutral-950 text-sm">{activeLook.price}</span>
                </div>
              </div>

              <Link
                to="/products"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
              >
                <span>View Product</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM SELECTOR BAR: Jacket Numbers, Names, and Arrows */}
        <div className="mt-8 pt-6 border-t border-neutral-200/80 flex flex-col md:flex-row items-center justify-between gap-5">
          
          {/* Left: Active Jacket Title */}
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-black font-mono tracking-widest text-neutral-950 uppercase">
              {activeLook.code || `JACKET 0${currentIndex + 1}`}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {activeLook.title}
            </span>
          </div>

          {/* Center / Right: Interactive Outfit Selectors + Arrows */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            
            {/* Prev Button */}
            <button
              onClick={handlePrev}
              aria-label="Previous Outfit"
              className="h-9 w-9 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-neutral-700 hover:text-black hover:border-black hover:bg-neutral-50 transition active:scale-95 shadow-xs"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Jacket Tabs */}
            <div className="flex items-center gap-2">
              {displayLooks.map((look, idx) => {
                const isSelected = currentIndex === idx;
                const jacketLabel = look.code || `JACKET 0${idx + 1}`;
                return (
                  <button
                    key={look.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`px-3 sm:px-4 py-2 rounded-full text-xs font-bold font-mono tracking-wider transition-all duration-200 flex items-center gap-2 ${
                      isSelected
                        ? 'bg-neutral-950 text-white shadow-sm scale-105'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-black'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-[#e11d48]' : 'bg-neutral-300'}`} />
                    <span>{jacketLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              aria-label="Next Outfit"
              className="h-9 w-9 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-neutral-700 hover:text-black hover:border-black hover:bg-neutral-50 transition active:scale-95 shadow-xs"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
