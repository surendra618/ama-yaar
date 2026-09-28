import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

const LOOKS = [
  {
    id: 1,
    image: '/cardauto.png',
    fallback: '/boys.png',
    title: 'CARGO HIGH RIB',
    subtitle: 'JOGGER FIT',
    tag: 'FALL / WINTER',
    season: '2026 EDITION',
    drop: '2026 DROP',
    status: 'DELIVERY',
    category1: 'HOODIE',
    category2: 'SNEAKER',
    gradient: 'from-[#202125] via-[#3a3d44] to-[#bfc4c9]',
    isCutout: true,
  },
  {
    id: 2,
    image: '/9b785fa2c182d0e2a6851851c660f942a8e3154e.png',
    fallback: '/boyse.png',
    title: 'TACTICAL CAP & TANK',
    subtitle: 'STREET MATRIX',
    tag: 'LIMITED RUN',
    season: 'STREET COUTURE',
    drop: 'DROP 02',
    status: 'IN STOCK',
    category1: 'CAP',
    category2: 'CARGO',
    gradient: 'from-[#171d24] via-[#2d3946] to-[#b8c7d8]',
    isCutout: true,
  },
  {
    id: 3,
    image: '/cardauto.png',
    fallback: '/cardauto.png',
    title: 'RAW VINTAGE FIT',
    subtitle: 'OVERSIZED DRIP',
    tag: 'TIMELESS CUT',
    season: '2026 EDITION',
    drop: 'EXCLUSIVE',
    status: 'LIMITED RUN',
    category1: 'BAGGY DENIM',
    category2: 'LOAFER',
    gradient: 'from-[#28211b] via-[#483a2f] to-[#d4c6b8]',
    isCutout: true,
  },
  {
    id: 4,
    image: '/cardauto2.png',
    fallback: '/boyse.png',
    title: 'GRAPHIC EAGLE TEE',
    subtitle: 'HEAVYWEIGHT COTTON',
    tag: 'CORE ESSENTIAL',
    season: 'SPRING / SUMMER',
    drop: 'SPECIAL DROP',
    status: 'SELLING FAST',
    category1: 'TRACK PANTS',
    category2: 'RETRO KICKS',
    gradient: 'from-[#211624] via-[#3d2744] to-[#cbbece]',
    isCutout: false,
  },
  {
    id: 5,
    image: '/model-nirvana.jpg',
    fallback: '/boyse.png',
    title: 'BOXY POLO SHIRT',
    subtitle: 'SUMMER EDITION',
    tag: 'AVANT-GARDE',
    season: '2026 EDITION',
    drop: 'CYBER DROP',
    status: 'NEW ARRIVAL',
    category1: 'DENIM SHORTS',
    category2: 'SNEAKER',
    gradient: 'from-[#17211f] via-[#2c3d39] to-[#bed3cd]',
    isCutout: false,
  },
];

export default function EditorialBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const cardRef = useRef(null);

  // Auto-cycle look every 1.5 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LOOKS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeLook = LOOKS[currentIndex];

  // 3D Tilt calculation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 180, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

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
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % LOOKS.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + LOOKS.length) % LOOKS.length);
  };

  // Repeated text strings for continuous infinite marquee
  const topMarqueeText = "FITS FOR YOUR NEXT OUTFIT • AMA YAAR STREETWEAR • OVERSIZED DRIP • 2026 EDITION • ";
  const bottomMarqueeText = "NEXT OUTFIT • URBAN LUXURY • NEW GENERATION FIT • RAW VINTAGE • TIMELESS CUT • ";

  return (
    <section className="relative w-full py-12 sm:py-16 bg-[#edf0f4] overflow-hidden select-none">

      {/* ── 1. Background Continuous Marquee Typography (Outer Section Tracks) ── */}
      {/* Top Marquee Row — Outer background track (z-0) */}
      <div
        className="pointer-events-none absolute top-[9%] sm:top-[12%] left-0 right-0 overflow-hidden z-0"
        style={{
          maskImage: 'linear-gradient(to right, #000 0%, #000 min(calc(50% + 80px), calc(50% + 22vw)), transparent min(calc(50% + 210px), calc(50% + 45vw)))',
          WebkitMaskImage: 'linear-gradient(to right, #000 0%, #000 min(calc(50% + 80px), calc(50% + 22vw)), transparent min(calc(50% + 210px), calc(50% + 45vw)))',
        }}
      >
        <div className="w-full overflow-hidden whitespace-nowrap flex">
          <div className="flex shrink-0 items-center marquee-track-reverse">
            <span
              className="text-[6.5vw] sm:text-[5.5vw] md:text-[4.8vw] font-[500] uppercase leading-none tracking-wider text-white/85 pr-8"
              style={{
                fontFamily: '"Syne", "Unbounded", "Syncopate", sans-serif',
              }}
            >
              {topMarqueeText.repeat(4)}
            </span>
          </div>
          <div className="flex shrink-0 items-center marquee-track-reverse" aria-hidden="true">
            <span
              className="text-[6.5vw] sm:text-[5.5vw] md:text-[4.8vw] font-[500] uppercase leading-none tracking-wider text-white/85 pr-8"
              style={{
                fontFamily: '"Syne", "Unbounded", "Syncopate", sans-serif',
              }}
            >
              {topMarqueeText.repeat(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Marquee Row — Single continuous straight line, in front of lower card (z-30) */}
      <div
        className="pointer-events-none absolute bottom-[9%] sm:bottom-[12%] left-0 right-0 overflow-hidden z-30"
        style={{
          maskImage: 'linear-gradient(to left, #000 0%, #000 min(calc(50% + 80px), calc(50% + 22vw)), transparent min(calc(50% + 210px), calc(50% + 45vw)))',
          WebkitMaskImage: 'linear-gradient(to left, #000 0%, #000 min(calc(50% + 80px), calc(50% + 22vw)), transparent min(calc(50% + 210px), calc(50% + 45vw)))',
        }}
      >
        <div className="w-full overflow-hidden whitespace-nowrap flex">
          <div className="flex shrink-0 items-center marquee-track-fast">
            <span
              className="text-[6.5vw] sm:text-[5.5vw] md:text-[4.8vw] font-[500] uppercase leading-none tracking-wider text-white/85 pr-8"
              style={{
                fontFamily: '"Syne", "Unbounded", "Syncopate", sans-serif',
              }}
            >
              {bottomMarqueeText.repeat(4)}
            </span>
          </div>
          <div className="flex shrink-0 items-center marquee-track-fast" aria-hidden="true">
            <span
              className="text-[6.5vw] sm:text-[5.5vw] md:text-[4.8vw] font-[500] uppercase leading-none tracking-wider text-white/85 pr-8"
              style={{
                fontFamily: '"Syne", "Unbounded", "Syncopate", sans-serif',
              }}
            >
              {bottomMarqueeText.repeat(4)}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Central 3D Editorial Model Card ── */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 flex flex-col items-center justify-center">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            type: 'spring',
            stiffness: 90,
            damping: 16,
          }}
          className="group relative w-full max-w-[340px] sm:max-w-[380px] md:max-w-[420px] h-[500px] sm:h-[550px] md:h-[580px] rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.2)] cursor-pointer"
        >
          {/* Fixed Editorial Card Gradient Background */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#222327] via-[#43454d] to-[#c2c6cb] transition-transform duration-700 ease-out group-hover:scale-105 z-0"
          />

          {/* Top Marquee inside the card — Over card background, UNDER model image (z-[5]) */}
          <div
            className="pointer-events-none absolute top-[9%] sm:top-[12%] left-1/2 -translate-x-1/2 w-screen overflow-hidden z-[5]"
            style={{
              maskImage: 'linear-gradient(to right, #000 0%, #000 min(calc(50% + 80px), calc(50% + 22vw)), transparent min(calc(50% + 210px), calc(50% + 45vw)))',
              WebkitMaskImage: 'linear-gradient(to right, #000 0%, #000 min(calc(50% + 80px), calc(50% + 22vw)), transparent min(calc(50% + 210px), calc(50% + 45vw)))',
            }}
          >
            <div className="w-full overflow-hidden whitespace-nowrap flex">
              <div className="flex shrink-0 items-center marquee-track-reverse">
                <span
                  className="text-[6.5vw] sm:text-[5.5vw] md:text-[4.8vw] font-[500] uppercase leading-none tracking-wider text-white/90 pr-8"
                  style={{
                    fontFamily: '"Syne", "Unbounded", "Syncopate", sans-serif',
                  }}
                >
                  {topMarqueeText.repeat(4)}
                </span>
              </div>
              <div className="flex shrink-0 items-center marquee-track-reverse" aria-hidden="true">
                <span
                  className="text-[6.5vw] sm:text-[5.5vw] md:text-[4.8vw] font-[500] uppercase leading-none tracking-wider text-white/90 pr-8"
                  style={{
                    fontFamily: '"Syne", "Unbounded", "Syncopate", sans-serif',
                  }}
                >
                  {topMarqueeText.repeat(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Card Shimmer Sheen Beam */}
          <div className="card-shine" />

          {/* Ambient Inner Lighting Glow */}
          <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/10 blur-[80px]" />

          {/* ── Auto-Switching Model Image in FRONT of top text (z-10) ── */}
          <div className="absolute inset-0 flex items-center justify-center pt-8 pb-4 pointer-events-none overflow-hidden z-10">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeLook.id}
                src={activeLook.image}
                alt={activeLook.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = activeLook.fallback;
                }}
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.04, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={
                  activeLook.isCutout
                    ? "h-[88%] sm:h-[92%] w-auto object-contain object-bottom filter drop-shadow-[0_16px_28px_rgba(0,0,0,0.55)] transition-transform duration-700 ease-out group-hover:scale-105"
                    : "h-full w-full object-cover object-center filter brightness-95 transition-transform duration-700 ease-out group-hover:scale-105"
                }
              />
            </AnimatePresence>
          </div>



          {/* ── 4. Mini Look Switcher Arrows (Visible on hover) ── */}
          <div className="absolute inset-y-0 left-3 right-3 flex items-center justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <button
              onClick={handlePrev}
              aria-label="Previous Look"
              className="pointer-events-auto h-9 w-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 active:scale-90 transition-all shadow-lg border border-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Look"
              className="pointer-events-auto h-9 w-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 active:scale-90 transition-all shadow-lg border border-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* ── 5. Center Bottom Floating CTA Button (Appears on hover) ── */}
          <div className="absolute inset-x-0 bottom-5 flex flex-col items-center gap-2.5 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-2.5 text-xs font-black tracking-widest text-white uppercase shadow-2xl hover:bg-black active:scale-95 transition-all border border-white/15"
            >
              <span>EXPLORE OUTFIT</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#facc15]" />
            </Link>

            {/* Slide Indicator Dots */}
            <div className="flex items-center gap-1.5 pt-1">
              {LOOKS.map((look, i) => (
                <button
                  key={look.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                  aria-label={`Go to look ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
