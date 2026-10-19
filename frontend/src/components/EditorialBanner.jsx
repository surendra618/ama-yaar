import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const LOOKS = [
  {
    id: 1,
    image: '/Streetwear Cutout with Headphones.png',
    fallback: '/boys.png',
    title: 'CARGO HIGH RIB',
    subtitle: 'JOGGER FIT',
    tag: 'FALL / WINTER',
    season: '2026 RUNWAY DROP',
    drop: 'DROP 01',
    status: 'READY TO SHIP',
    gsm: '260 GSM TERRY',
    fit: 'AGGRESSIVE TAPER',
    category1: 'HEAVY HOODIE',
    category2: 'HIGH-RIB JOGGERS',
    isCutout: true,
  },
  {
    id: 2,
    image: '/Ivory Jacket Streetwear Cutout.png',
    fallback: '/boyse.png',
    title: 'TACTICAL CAP & TANK',
    subtitle: 'STREET MATRIX',
    tag: 'LIMITED RUN',
    season: 'STREET COUTURE',
    drop: 'DROP 02',
    status: 'LOW STOCK',
    gsm: '240 GSM COMBED',
    fit: 'BOXY OVERSIZED',
    category1: 'TACTICAL CAP',
    category2: '6-POCKET CARGO',
    isCutout: true,
  },
  {
    id: 3,
    image: '/Streetwear Model in Oversized Hoodie.png',
    fallback: '/cardauto.png',
    title: 'RAW VINTAGE FIT',
    subtitle: 'OVERSIZED DRIP',
    tag: 'TIMELESS CUT',
    season: '2026 EDITION',
    drop: 'EXCLUSIVE DROP',
    status: 'FLAGSHIP PIECE',
    gsm: '280 GSM FLEECE',
    fit: 'DROP SHOULDER',
    category1: 'BAGGY DENIM',
    category2: 'CHUNKY SNEAKERS',
    isCutout: true,
  },
  {
    id: 4,
    image: '/Curly-Haired Model in Beige Polo.png',
    fallback: '/boyse.png',
    title: 'GRAPHIC EAGLE TEE',
    subtitle: 'HEAVYWEIGHT POLO',
    tag: 'CORE ESSENTIAL',
    season: 'SPRING / SUMMER',
    drop: 'SPECIAL DROP',
    status: 'SELLING FAST',
    gsm: '240 GSM COMBED',
    fit: 'RELAXED BOX CUT',
    category1: 'OVERSIZED POLO',
    category2: 'VINTAGE WASH DENIM',
    isCutout: true,
  },
  {
    id: 5,
    image: '/Stylish Streetwear Man with Backpack.png',
    fallback: '/boyse.png',
    title: 'BOXY UTILITY POLO',
    subtitle: 'URBAN EXPLORER',
    tag: 'AVANT-GARDE',
    season: '2026 EDITION',
    drop: 'CYBER DROP',
    status: 'NEW ARRIVAL',
    gsm: '250 GSM BIO-WASH',
    fit: 'ENGINEERED DRAPE',
    category1: 'UTILITY TEE',
    category2: 'TECHNICAL BACKPACK',
    isCutout: true,
  },
];

export default function EditorialBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dbLooks, setDbLooks] = useState([]);
  const cardRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/editorial-looks')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.data && resData.data.length > 0) {
          const parsed = resData.data.map((item, idx) => ({
            id: item._id || idx,
            title: item.title,
            subtitle: item.subtitle,
            tag: item.tag || 'EXCLUSIVE',
            season: item.season || '2026 EDITION',
            drop: item.drop || `DROP 0${idx + 1}`,
            status: item.status || 'IN STOCK',
            gsm: item.gsm || '240+ GSM',
            fit: item.fit || 'OVERSIZED',
            category1: item.category1 || 'STREETWEAR TOP',
            category2: item.category2 || 'UTILITY BOTTOM',
            image: item.image?.startsWith('http')
              ? item.image
              : item.image?.startsWith('/uploads')
                ? `http://localhost:5000${item.image}`
                : item.image,
            fallback: item.fallback || '/boyse.png',
            isCutout: item.isCutout !== undefined ? Boolean(item.isCutout) : true,
          }));
          setDbLooks(parsed);
        }
      })
      .catch(() => { });
  }, []);

  const displayLooks = dbLooks.length > 0 ? dbLooks : LOOKS;

  // Auto-cycle look every 4.5 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayLooks.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, displayLooks.length]);

  const activeLook = displayLooks[currentIndex] || displayLooks[0];

  // 3D subtle tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 180, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), springConfig);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    mouseX.set(clientX / width - 0.5);
    mouseY.set(clientY / height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsPaused(false);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % displayLooks.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + displayLooks.length) % displayLooks.length);
  };

  return (
    <section className="w-full bg-[#fbfbfb] text-neutral-900 py-14 sm:py-20 select-none overflow-hidden relative border-t border-b border-neutral-200">
      {/* Background Subtle Luxury Light Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(225,29,72,0.03),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Standardized Container */}
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12 relative z-10">

        {/* Section Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#e11d48] animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e11d48]">
                AMA YAAR EDITORIAL RUNWAY • 2026
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase italic tracking-tight text-neutral-900 leading-none">
              CURATED STREETWEAR <span className="text-neutral-500">LOOKBOOK</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-bold tracking-widest text-neutral-500 uppercase">
              LOOK <span className="text-neutral-900 font-black text-sm">0{currentIndex + 1}</span> / 0{displayLooks.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Look"
                className="h-10 w-10 rounded-full border border-neutral-200 bg-white text-neutral-800 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-black transition active:scale-95 shadow-xs"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Look"
                className="h-10 w-10 rounded-full border border-neutral-200 bg-white text-neutral-800 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-black transition active:scale-95 shadow-xs"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Full-Page Editorial Lookbook Display - Light Theme */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={handleMouseLeave}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          {/* Left Column: Rich Editorial Dossier & Specs (5 Cols) - Light Theme */}
          <div className="lg:col-span-5 bg-white border border-neutral-200 p-6 sm:p-8 lg:p-10 flex flex-col justify-between shadow-xs">
            <div className="space-y-6">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-[#e11d48] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
                  {activeLook.tag}
                </span>
                <span className="bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 border border-neutral-200">
                  {activeLook.season}
                </span>
                <span className="bg-neutral-100 text-neutral-500 text-[10px] font-mono tracking-wider px-2.5 py-1 border border-neutral-200 ml-auto">
                  {activeLook.drop}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase italic tracking-tight text-neutral-900 leading-tight">
                  {activeLook.title}
                </h3>
                <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-neutral-500 mt-1">
                  {activeLook.subtitle}
                </p>
              </div>

              {/* Streetwear Engineered Specs - Light Theme Cards */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200">
                <div className="bg-neutral-50 border border-neutral-200/90 p-3.5">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">FABRIC DENSITY</span>
                  <span className="text-sm font-black text-neutral-900 uppercase tracking-wide mt-0.5 block">{activeLook.gsm || '240+ GSM TERRY'}</span>
                </div>
                <div className="bg-neutral-50 border border-neutral-200/90 p-3.5">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">SILHOUETTE</span>
                  <span className="text-sm font-black text-neutral-900 uppercase tracking-wide mt-0.5 block">{activeLook.fit || 'BOXY DROP SHOULDER'}</span>
                </div>
              </div>

              {/* Styled Ensemble Breakdown - Light Theme */}
              <div className="space-y-2.5 bg-neutral-50/70 p-4 border border-neutral-200/90">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1">
                  STYLED OUTFIT ENSEMBLE
                </span>
                <div className="flex items-center justify-between text-xs text-neutral-700">
                  <span className="text-neutral-500 font-bold uppercase">TOP LAYER:</span>
                  <span className="font-black text-neutral-900 uppercase">{activeLook.category1}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-700 pt-2 border-t border-neutral-200/80">
                  <span className="text-neutral-500 font-bold uppercase">BOTTOM LAYER:</span>
                  <span className="font-black text-neutral-900 uppercase">{activeLook.category2}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-700 pt-2 border-t border-neutral-200/80">
                  <span className="text-neutral-500 font-bold uppercase">AVAILABILITY:</span>
                  <span className="font-black text-[#e11d48] uppercase flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e11d48]" />
                    {activeLook.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Look Switcher Thumbnails & CTA */}
            <div className="mt-8 pt-6 border-t border-neutral-200 space-y-5">
              {/* Thumbnail Selector Strip - Light Theme */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-2.5">
                  SELECT RUNWAY LOOK
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {displayLooks.map((look, idx) => {
                    const isSelected = currentIndex === idx;
                    return (
                      <button
                        key={look.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative aspect-[3/4] overflow-hidden border transition duration-200 group/thumb ${isSelected
                            ? 'border-[#e11d48] ring-2 ring-[#e11d48]/40 scale-102 bg-white shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-400 bg-neutral-100'
                          }`}
                      >
                        <img
                          src={look.image}
                          alt={look.title}
                          className="h-full w-full object-cover object-top transition duration-300 group-hover/thumb:scale-110"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = look.fallback;
                          }}
                        />
                        <span className={`absolute bottom-0 inset-x-0 text-[9px] font-mono font-bold py-0.5 text-center ${isSelected ? 'bg-[#e11d48] text-white' : 'bg-neutral-900/80 text-white'
                          }`}>
                          0{idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shop Fit Action CTA */}
              <Link
                to="/products"
                className="w-full inline-flex items-center justify-center gap-3 bg-neutral-950 text-white py-4 px-6 text-xs font-black uppercase tracking-widest hover:bg-black transition duration-200 group/btn shadow-md"
              >
                <span>SHOP THIS LOOKBOOK FIT</span>
                <ArrowRight className="h-4 w-4 text-white group-hover/btn:translate-x-1 transition duration-200" />
              </Link>
            </div>
          </div>

          {/* Right Column: Hero High-Impact Visual Showcase (7 Cols) - Light Theme */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            className="lg:col-span-7 relative h-[520px] sm:h-[600px] lg:h-[660px] bg-gradient-to-b from-[#f5f7fa] via-[#eef1f5] to-[#e4e8ed] border border-neutral-200 overflow-hidden flex items-center justify-center group shadow-xs"
          >
            {/* Ambient Dynamic Background Light Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_0%,transparent_75%)] pointer-events-none" />

            {/* Subtle Editorial Background Watermark Typography */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center pointer-events-none select-none overflow-hidden z-0 opacity-10">
              <span className="text-[12vw] font-black uppercase tracking-tighter text-neutral-900 whitespace-nowrap block leading-none font-display italic">
                AMA YAAR
              </span>
            </div>

            {/* Top Right Floating Season Tag - Light Theme */}
            <div className="absolute top-5 right-5 z-20 bg-white/90 backdrop-blur-md border border-neutral-200 px-3.5 py-1.5 flex items-center gap-2 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#e11d48]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900">
                {activeLook.season}
              </span>
            </div>

            {/* Top Left Look ID - Light Theme */}
            <div className="absolute top-5 left-5 z-20 bg-white/90 backdrop-blur-md border border-neutral-200 px-3.5 py-1.5 shadow-xs">
              <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-700 uppercase">
                SERIES NO. {activeLook.id}
              </span>
            </div>

            {/* Main Animated Model Image */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-6 sm:p-10">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeLook.id}
                  src={activeLook.image}
                  alt={activeLook.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = activeLook.fallback;
                  }}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.04, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="max-h-[92%] sm:max-h-[95%] w-auto object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.18)] filter contrast-105"
                />
              </AnimatePresence>
            </div>

            {/* Bottom Overlay Info Pill - Light Theme */}
            <div className="absolute bottom-5 inset-x-5 z-20 flex items-center justify-between bg-white/90 backdrop-blur-md border border-neutral-200 px-5 py-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[#e11d48]" />
                <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
                  {activeLook.title} — {activeLook.subtitle}
                </span>
              </div>
              <Link
                to="/products"
                className="text-[11px] font-black uppercase tracking-widest text-neutral-800 hover:text-[#e11d48] flex items-center gap-1.5 transition"
              >
                EXPLORE FIT <ArrowRight className="h-3.5 w-3.5 text-[#e11d48]" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
