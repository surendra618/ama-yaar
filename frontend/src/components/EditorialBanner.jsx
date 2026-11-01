import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import api from '../lib/axios';
import { getMediaUrl } from '../utils/mediaUrl';

const LOOKS = [
  {
    id: 1,
    image: '/editorial-looks/look1-cargo-rib.png',
    fallback: '/editorial-looks/look1-cargo-rib.png',
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
    image: '/editorial-looks/look2-tactical-matrix.png',
    fallback: '/editorial-looks/look2-tactical-matrix.png',
    title: 'TACTICAL CAP & TANK',
    subtitle: 'STREET MATRIX',
    tag: 'LIMITED RUN',
    season: 'STREET COUTURE',
    drop: 'DROP 02',
    status: 'LOW STOCK',
    gsm: '240 GSM COMBED',
    fit: 'BOXY OVERSIZED',
    category1: 'TACTICAL UTILITY',
    category2: '6-POCKET CARGO',
    isCutout: true,
  },
  {
    id: 3,
    image: '/editorial-looks/look3-raw-vintage.png',
    fallback: '/editorial-looks/look3-raw-vintage.png',
    title: 'RAW VINTAGE FIT',
    subtitle: 'OVERSIZED DRIP',
    tag: 'TIMELESS CUT',
    season: '2026 EDITION',
    drop: 'EXCLUSIVE DROP',
    status: 'FLAGSHIP PIECE',
    gsm: '280 GSM FLEECE',
    fit: 'DROP SHOULDER',
    category1: 'BAGGY DENIM',
    category2: 'ACID WASH TEE',
    isCutout: true,
  },
  {
    id: 4,
    image: '/editorial-looks/look4-ivory-polo.png',
    fallback: '/editorial-looks/look4-ivory-polo.png',
    title: 'GRAPHIC EAGLE TEE',
    subtitle: 'HEAVYWEIGHT POLO',
    tag: 'CORE ESSENTIAL',
    season: 'SPRING / SUMMER',
    drop: 'SPECIAL DROP',
    status: 'SELLING FAST',
    gsm: '240 GSM COMBED',
    fit: 'RELAXED BOX CUT',
    category1: 'IVORY POLO',
    category2: 'TAILORED TROUSERS',
    isCutout: true,
  },
  {
    id: 5,
    image: '/editorial-looks/look5-boxy-utility.png',
    fallback: '/editorial-looks/look5-boxy-utility.png',
    title: 'BOXY UTILITY POLO',
    subtitle: 'URBAN EXPLORER',
    tag: 'AVANT-GARDE',
    season: '2026 EDITION',
    drop: 'CYBER DROP',
    status: 'NEW ARRIVAL',
    gsm: '250 GSM BIO-WASH',
    fit: 'ENGINEERED DRAPE',
    category1: 'UTILITY OVERSHIRT',
    category2: 'TECHNICAL CARGO',
    isCutout: true,
  },
];

function resolveLookPath(path, fallback) {
  if (!path) return fallback;
  if (path.startsWith('/editorial-looks/')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return getMediaUrl(path);
}

export default function EditorialBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dbLooks, setDbLooks] = useState([]);
  const cardRef = useRef(null);

  useEffect(() => {
    api
      .get('/editorial-looks')
      .then((res) => {
        const resData = res.data;
        if (resData && resData.data && resData.data.length > 0) {
          const parsed = resData.data.map((item, idx) => {
            const fallbackPath = item.fallback
              ? resolveLookPath(item.fallback, LOOKS[idx % LOOKS.length].fallback)
              : LOOKS[idx % LOOKS.length].fallback;
            const imagePath = item.image
              ? resolveLookPath(item.image, fallbackPath)
              : fallbackPath;

            return {
              id: item._id || idx,
              title: item.title || LOOKS[idx % LOOKS.length].title,
              subtitle: item.subtitle || LOOKS[idx % LOOKS.length].subtitle,
              tag: item.tag || 'EXCLUSIVE',
              season: item.season || '2026 EDITION',
              drop: item.drop || `DROP 0${idx + 1}`,
              status: item.status || 'IN STOCK',
              category1: item.category1 || 'TOP LAYER',
              category2: item.category2 || 'BOTTOM LAYER',
              image: imagePath,
              fallback: fallbackPath,
              isCutout: item.isCutout !== undefined ? Boolean(item.isCutout) : true,
            };
          });
          setDbLooks(parsed);
        }
      })
      .catch(() => {});
  }, []);

  const displayLooks = dbLooks.length > 0 ? dbLooks : LOOKS;

  // Preload all look images in background to avoid any flash during transitions
  useEffect(() => {
    displayLooks.forEach((look) => {
      if (look.image) {
        const img = new Image();
        img.src = look.image;
      }
    });
  }, [displayLooks]);

  // Auto-cycle look every 3 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayLooks.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isPaused, displayLooks.length]);

  const activeLook = displayLooks[currentIndex] || displayLooks[0];

  // 3D subtle tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 180, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [2, -2]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2, 2]), springConfig);

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
    <section className="w-full bg-[#fafafa] text-neutral-900 py-6 sm:py-8 select-none overflow-hidden relative border-t border-b border-neutral-200/80">
      {/* Background Subtle Luxury Light Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(225,29,72,0.03),transparent_70%)] pointer-events-none" />

      {/* Main Standardized Container */}
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12 relative z-10">

        {/* Compact Header Row */}
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="h-2 w-2 rounded-full bg-[#e11d48] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e11d48]">
              AMA YAAR EDITORIAL
            </span>
            <span className="text-neutral-300 hidden sm:inline">|</span>
            <h2 className="text-base sm:text-xl font-black uppercase italic tracking-tight text-neutral-900 leading-none">
              CURATED LOOKBOOK
            </h2>
          </div>
        </div>

        {/* Streamlined Minimalist Lookbook Display */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={handleMouseLeave}
          className="relative group/container"
        >
          {/* Main Visual Runway Showcase */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            className="relative h-[460px] sm:h-[520px] md:h-[580px] lg:h-[640px] xl:h-[680px] w-full rounded-2xl bg-gradient-to-b from-[#f8fafc] via-[#eff2f6] to-[#e2e7ee] border border-neutral-200/90 overflow-hidden flex items-center justify-center shadow-sm"
          >
            {/* Ambient High-Key Studio Center Spotlight */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_75%_at_50%_45%,rgba(255,255,255,1)_0%,rgba(255,255,255,0.75)_40%,transparent_80%)] pointer-events-none" />

            {/* Subtle Editorial Background Watermark Typography */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.06]">
              <span className="text-[16vw] font-black uppercase tracking-tighter text-neutral-900 whitespace-nowrap block leading-none font-display italic">
                AMA YAAR
              </span>
            </div>

            {/* Top Right Floating Season Tag */}
            <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-neutral-200/90 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#e11d48]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900">
                {activeLook.season}
              </span>
            </div>

            {/* Top Left Look ID */}
            <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-neutral-200/90 px-3 py-1.5 rounded-lg shadow-xs">
              <span className="text-[11px] font-mono font-bold tracking-wider text-neutral-800 uppercase">
                SERIES 0{currentIndex + 1}
              </span>
            </div>

            {/* Left & Right Interactive Navigation Controls */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous look"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/95 hover:bg-white text-neutral-900 shadow-md border border-neutral-200 flex items-center justify-center transition-all duration-150 opacity-90 hover:opacity-100 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next look"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/95 hover:bg-white text-neutral-900 shadow-md border border-neutral-200 flex items-center justify-center transition-all duration-150 opacity-90 hover:opacity-100 hover:scale-110 active:scale-95"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Studio Floor Soft Contact Shadow under Model Feet */}
            <div className="absolute bottom-[76px] sm:bottom-[86px] w-48 sm:w-68 h-5 sm:h-6 bg-neutral-950/15 rounded-[100%] blur-md pointer-events-none z-10" />

            {/* Main Model Runway Stage - Fully Uncut Model with Headroom and Footroom */}
            <div className="absolute inset-x-0 top-0 bottom-[72px] sm:bottom-[82px] pt-14 sm:pt-16 px-4 z-10 flex items-center justify-center pointer-events-none overflow-visible">
              {displayLooks.map((look, idx) => {
                const isActive = currentIndex === idx;
                return (
                  <motion.img
                    key={look.id || idx}
                    src={look.image}
                    alt={look.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = look.fallback;
                    }}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.35,
                      ease: 'easeInOut',
                    }}
                    className="max-h-full max-w-full w-auto h-full object-contain object-center drop-shadow-[0_20px_35px_rgba(0,0,0,0.22)] filter contrast-[1.06] brightness-[1.02] select-none"
                    style={{
                      position: 'absolute',
                      pointerEvents: isActive ? 'auto' : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Compact Bottom Floating Info Bar */}
            <div className="absolute bottom-3.5 sm:bottom-4 inset-x-3 sm:inset-x-6 z-20 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-xl px-4 sm:px-5 py-3 shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e11d48] shrink-0 animate-pulse" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-neutral-900 truncate">
                  {activeLook.title}
                </span>
                <span className="hidden sm:inline text-neutral-300">·</span>
                <span className="hidden sm:inline text-xs font-bold text-neutral-500 uppercase truncate">
                  {activeLook.subtitle}
                </span>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                {/* Micro Thumbnails Strip */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {displayLooks.map((look, idx) => {
                    const isSelected = currentIndex === idx;
                    return (
                      <button
                        key={look.id || idx}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative h-8 w-8 sm:h-9 sm:w-9 rounded-lg overflow-hidden border bg-neutral-100 transition-all duration-150 ${isSelected
                            ? 'border-[#e11d48] ring-2 ring-[#e11d48]/40 scale-105 shadow-xs'
                            : 'border-neutral-200 opacity-60 hover:opacity-100 hover:border-neutral-400'
                          }`}
                        title={look.title}
                      >
                        <img
                          src={look.image}
                          alt={look.title}
                          className="h-full w-full object-cover object-top"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = look.fallback;
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 bg-neutral-950 text-white rounded-lg px-3.5 py-2 text-xs font-black uppercase tracking-wider hover:bg-black transition active:scale-95 shadow-xs"
                >
                  <span>SHOP FIT</span>
                  <ArrowRight className="h-3.5 w-3.5 text-white" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
