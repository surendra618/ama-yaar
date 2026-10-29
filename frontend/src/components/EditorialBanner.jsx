import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import api from '../lib/axios';
import { getMediaUrl } from '../utils/mediaUrl';

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
    api
      .get('/editorial-looks')
      .then((res) => {
        const resData = res.data;
        if (resData && resData.data && resData.data.length > 0) {
          const parsed = resData.data.map((item, idx) => ({
            id: item._id || idx,
            title: item.title,
            subtitle: item.subtitle,
            tag: item.tag || 'EXCLUSIVE',
            season: item.season || '2026 EDITION',
            drop: item.drop || `DROP 0${idx + 1}`,
            status: item.status || 'IN STOCK',
            category1: item.category1 || 'TOP LAYER',
            category2: item.category2 || 'BOTTOM LAYER',
            image: item.image ? getMediaUrl(item.image) : item.image,
            fallback: item.fallback || '/boyse.png',
            isCutout: item.isCutout !== undefined ? Boolean(item.isCutout) : true,
          }));
          setDbLooks(parsed);
        }
      })
      .catch(() => { });
  }, []);

  const displayLooks = dbLooks.length > 0 ? dbLooks : LOOKS;

  // Auto-cycle look every 1 second unless hovered/paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayLooks.length);
    }, 1000);
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
          className="relative"
        >
          {/* Main Visual Runway Showcase (Minimal height) */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            className="relative h-[320px] sm:h-[380px] lg:h-[420px] w-full rounded-xl bg-gradient-to-b from-[#f5f7fa] via-[#edf0f4] to-[#e4e8ed] border border-neutral-200 overflow-hidden flex items-center justify-center group shadow-xs"
          >
            {/* Ambient Dynamic Background Light Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_0%,transparent_75%)] pointer-events-none" />

            {/* Subtle Editorial Background Watermark Typography */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.08]">
              <span className="text-[14vw] font-black uppercase tracking-tighter text-neutral-900 whitespace-nowrap block leading-none font-display italic">
                AMA YAAR
              </span>
            </div>

            {/* Top Right Floating Season Tag */}
            <div className="absolute top-3.5 right-3.5 z-20 bg-white/90 backdrop-blur-md border border-neutral-200/90 px-3 py-1 rounded-md flex items-center gap-1.5 shadow-xs">
              <Sparkles className="h-3 w-3 text-[#e11d48]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-900">
                {activeLook.season}
              </span>
            </div>

            {/* Top Left Look ID */}
            <div className="absolute top-3.5 left-3.5 z-20 bg-white/90 backdrop-blur-md border border-neutral-200/90 px-2.5 py-1 rounded-md shadow-xs">
              <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-700 uppercase">
                SERIES 0{currentIndex + 1}
              </span>
            </div>

            {/* Main Animated Model Image */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-4 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeLook.id}
                  src={activeLook.image}
                  alt={activeLook.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = activeLook.fallback;
                  }}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="max-h-[85%] sm:max-h-[90%] w-auto object-contain object-bottom drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)] filter contrast-105"
                />
              </AnimatePresence>
            </div>

            {/* Compact Bottom Floating Info Bar */}
            <div className="absolute bottom-3 inset-x-3 sm:inset-x-5 z-20 flex flex-wrap items-center justify-between gap-3 bg-white/92 backdrop-blur-md border border-neutral-200/90 rounded-lg px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-2 w-2 rounded-full bg-[#e11d48] shrink-0" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-neutral-900 truncate">
                  {activeLook.title}
                </span>
                <span className="hidden sm:inline text-neutral-300">·</span>
                <span className="hidden sm:inline text-xs font-semibold text-neutral-500 uppercase truncate">
                  {activeLook.subtitle}
                </span>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                {/* Micro Thumbnails Strip */}
                <div className="flex items-center gap-1.5">
                  {displayLooks.map((look, idx) => {
                    const isSelected = currentIndex === idx;
                    return (
                      <button
                        key={look.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-7 w-7 rounded overflow-hidden border transition duration-150 ${isSelected
                            ? 'border-[#e11d48] ring-2 ring-[#e11d48]/40 scale-105'
                            : 'border-neutral-200 opacity-60 hover:opacity-100'
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
                  className="inline-flex items-center gap-1.5 bg-neutral-950 text-white rounded px-3 py-1.5 text-[11px] font-black uppercase tracking-wider hover:bg-black transition active:scale-95"
                >
                  <span>SHOP FIT</span>
                  <ArrowRight className="h-3 w-3 text-white" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
