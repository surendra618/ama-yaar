import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Zap } from 'lucide-react';

export default function WorkoutShowcaseBanner() {
  const cardRef = useRef(null);

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
  };

  return (
    <section className="relative w-full py-12 sm:py-16 bg-[#e8ebf0] overflow-hidden select-none">

      {/* ── 1. Static Background Typography & Editorial Text (AOS Animations) ── */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-5 sm:py-7 px-4 sm:px-8 md:px-12 overflow-hidden z-0">

        {/* Top-Left: Eyebrow + FRESH FITS (Slides from LEFT) */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          data-aos="fade-right"
          className="flex flex-col items-start justify-start select-none max-w-[calc(50vw-220px)] sm:max-w-[calc(50vw-240px)]"
        >
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span className="text-[9px] sm:text-[11px] font-extrabold tracking-[0.25em] text-neutral-700 uppercase">
              NEW DROP 2026 // LIMITED EDITION
            </span>
          </div>

          {/* Main Headline (Clean Font, Not Overly Bold) */}
          <span
            className="text-[5.2vw] sm:text-[4vw] md:text-[3.2vw] lg:text-[2.7vw] font-[500] uppercase leading-[1.02] tracking-wide text-neutral-900"
            style={{
              fontFamily: '"Outfit", "Plus Jakarta Sans", "Inter", sans-serif',
            }}
          >
            FRESH FITS<br />
            PREMIUM EDITION<br />
            & OVERSIZED
          </span>

          {/* Editorial Subtext */}
          <p className="mt-2.5 text-[9px] sm:text-[11px] md:text-[12px] font-medium tracking-[0.16em] text-neutral-600 uppercase">
            COLLECTION 2026 // STREETWEAR & ESSENTIALS
          </p>
          <p className="mt-1 hidden sm:block text-[9px] md:text-[10.5px] font-normal tracking-[0.14em] text-neutral-400 uppercase">
            CRAFTED FOR EVERYDAY IMPACT & PREMIUM COMFORT
          </p>
        </motion.div>

        {/* Bottom-Right: YOUR WORKOUT (Slides from RIGHT) */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          data-aos="fade-left"
          className="flex flex-col items-end justify-end text-right select-none max-w-[calc(50vw-220px)] sm:max-w-[calc(50vw-240px)] ml-auto"
        >
          <p className="mb-1 hidden sm:block text-[9px] md:text-[10.5px] font-normal tracking-[0.14em] text-neutral-400 uppercase">
            HEAVYWEIGHT COTTON & BREATHABLE WEAVE
          </p>
          <p className="mb-2.5 text-[9px] sm:text-[11px] md:text-[12px] font-medium tracking-[0.16em] text-neutral-600 uppercase">
            LEVEL UP // ATHLETIC PERFORMANCE
          </p>

          <span
            className="text-[5.2vw] sm:text-[4vw] md:text-[3.2vw] lg:text-[2.7vw] font-[500] uppercase leading-[1.02] tracking-wide text-neutral-900"
            style={{
              fontFamily: '"Outfit", "Plus Jakarta Sans", "Inter", sans-serif',
            }}
          >
            YOUR WORKOUT<br />
            ACTIVEWEAR<br />
            & ESSENTIALS
          </span>
        </motion.div>
      </div>

      {/* ── 2. Central 3D Editorial Squad Poster Card ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 flex flex-col items-center justify-center">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
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
          className="group relative w-full max-w-[360px] sm:max-w-[420px] md:max-w-[450px] h-[450px] sm:h-[510px] md:h-[540px] rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.14)] cursor-pointer bg-[#f7f8fa] border border-white/60"
        >
          {/* ── Background Geometric Artwork ── */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Soft background gradient fill */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff] via-[#f1f3f7] to-[#e4e7ed]" />

            {/* 1. Large Circular Backdrop Disc & Rings behind Top Model (Up High) */}
            <div className="absolute top-[2%] sm:top-[1%] left-1/2 -translate-x-1/2 flex items-center justify-center">
              {/* Outer Orbit Ring */}
              <div className="w-[310px] sm:w-[370px] md:w-[400px] h-[310px] sm:h-[370px] md:h-[400px] rounded-full border border-neutral-900/35" />

              {/* Inner Shaded Metallic Disc */}
              <div className="absolute w-[240px] sm:w-[290px] md:w-[315px] h-[240px] sm:h-[290px] md:h-[315px] rounded-full bg-gradient-to-b from-[#b8bdc7] via-[#d3d8e2] to-[#e9ecf2] shadow-inner" />

              {/* Subtle inner accent ring */}
              <div className="absolute w-[180px] sm:w-[220px] md:w-[240px] h-[180px] sm:h-[220px] md:h-[240px] rounded-full border border-white/40" />
            </div>

            {/* 2. Top-Left Dot Matrix Pattern (2 columns x 4 dots) */}
            <div className="absolute top-8 left-7 grid grid-cols-2 gap-x-2 gap-y-2.5 z-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
              ))}
            </div>

            {/* 3. Middle-Right Dot Matrix Pattern (2 columns x 4 dots) */}
            <div className="absolute top-[48%] right-6 grid grid-cols-2 gap-x-2 gap-y-2.5 z-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
              ))}
            </div>

            {/* 4. Left Diagonal Geometric Stripes & Polygon Bands */}
            <div className="absolute -left-12 bottom-16 w-48 h-48 -rotate-[38deg] pointer-events-none z-0">
              {/* Thick Light Grey Band */}
              <div className="w-full h-12 bg-[#d7dce4]/90 mb-3" />
              {/* Dark Charcoal Accent Strip */}
              <div className="w-3/4 h-3 bg-neutral-900 mb-2" />
              {/* Thin Line */}
              <div className="w-1/2 h-[2px] bg-neutral-600" />
            </div>

            {/* 5. Right Bottom Diagonal Accent Band */}
            <div className="absolute -right-16 -bottom-10 w-48 h-48 -rotate-[38deg] pointer-events-none z-0">
              <div className="w-full h-14 bg-[#2b2d32]" />
              <div className="w-full h-4 bg-[#8b919d] mt-2" />
            </div>

            {/* 6. Subtle Technical Geometric Accent Line */}
            <svg
              className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="15%" y1="10%" x2="85%" y2="80%" stroke="#000" strokeWidth="0.5" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* ── 3-Model Squad Cutouts Layering ── */}
          <div className="relative w-full h-full pointer-events-none z-10 overflow-hidden">

            {/* ── 1. Top Center Model (Sunglasses & Cream Polo) ── */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-[4%] sm:top-[5%] md:top-[8%] h-[86%] sm:h-[90%] md:h-[92%] w-auto z-10 flex items-start justify-center transition-transform duration-700 ease-out group-hover:scale-[1.18]"
            >
              <img
                src="/cardauto.png"
                alt="Center Model Sunglasses Polo"
                style={{ clipPath: 'inset(0 0 28% 0)' }}
                className="h-full w-auto object-contain object-top filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.3)] scale-[1.35] sm:scale-[1.42] origin-top"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/boyse.png';
                }}
              />
            </motion.div>

            {/* ── 2. Left Foreground Model (White Samurai Graphic Zip Shirt) ── */}
            <motion.div
              className="absolute left-[-6%] sm:left-[-20%] bottom-0 h-[64%] sm:h-[68%] w-auto z-20 flex items-end justify-start transition-transform duration-700 ease-out group-hover:-translate-x-1"
            >
              <img
                src="/cardaut2.png"
                alt="Left Model Samurai Shirt"
                className="h-full w-auto object-contain object-bottom filter drop-shadow-[0_16px_30px_rgba(0,0,0,0.45)]"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/boyse.png';
                }}
              />
            </motion.div>

            {/* ── 3. Right Foreground Model (Black Snake Graphic Tee) ── */}
            <motion.div
              className="absolute right-[-6%] sm:right-[-3%] bottom-0 h-[64%] sm:h-[68%] w-auto z-20 flex items-end justify-end transition-transform duration-700 ease-out group-hover:translate-x-1"
            >
              <img
                src="/side09.png"
                alt="Right Model Snake Tee"
                className="h-full w-auto object-contain object-bottom filter drop-shadow-[0_16px_30px_rgba(0,0,0,0.45)]"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/cardaut03.png';
                }}
              />
            </motion.div>
          </div>

          {/* Card Shimmer Sheen Beam */}
          <div className="card-shine z-25" />

          {/* Bottom Gradient Overlay for CTA Button Readability on Hover */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30" />

          {/* ── Hover CTA Floating Button ── */}
          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 z-40 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-xs font-black tracking-widest text-white uppercase shadow-2xl hover:bg-[#facc15] hover:text-black active:scale-95 transition-all border border-white/20"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>EXPLORE WORKOUT WEAR</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
