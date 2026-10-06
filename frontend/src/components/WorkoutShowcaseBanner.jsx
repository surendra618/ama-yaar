import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Zap } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function WorkoutShowcaseBanner() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  // Initialize AOS for watermark slide animations
  useEffect(() => {
    AOS.init({ once: true, duration: 900, easing: 'ease-out-cubic' });
  }, []);

  // ── 1. Scroll-driven Progress ──
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 90%', 'center center'],
  });

  const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 22 });

  // (Watermark animation now handled by AOS)

  // Models scale down from slightly larger (1.15x) to Normal (1.0x) on scroll
  const imageScale = useTransform(smoothScroll, [0, 0.85], [1.15, 1.0]);

  // Card Text: Completely HIDDEN initially (opacity 0, y: 70px), appears & slides UP on scroll
  const textY = useTransform(smoothScroll, [0.25, 0.85], [70, 0]);
  const textOpacity = useTransform(smoothScroll, [0.25, 0.8], [0, 1]);

  // ── 2. Interactive 3D Cursor Tilt Effect ──
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
    <section
      ref={containerRef}
      className="relative w-full py-16 sm:py-24 bg-[#f4f5f7] overflow-hidden select-none flex items-center justify-center"
    >

      {/* ── 1. Giant Light Watermark Background Outline Typography ── */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-6 px-2 sm:px-6 overflow-hidden z-0 select-none">
        {/* Top Watermark Row — slides in from LEFT */}
        <div
          data-aos="fade-right"
          data-aos-delay="100"
          data-aos-offset="80"
          className="w-full flex justify-between items-center text-[7.5vw] sm:text-[8vw] uppercase tracking-tighter leading-none"
        >
          <span
            className="font-light tracking-wide text-transparent"
            style={{
              fontFamily: '"Outfit", "Inter", sans-serif',
              WebkitTextStroke: '1.5px #d1d7de',
            }}
          >
            FRESH FOR
          </span>

        </div>

        {/* Bottom Watermark Row — slides in from RIGHT */}
        <div
          data-aos="fade-left"
          data-aos-delay="200"
          data-aos-offset="80"
          className="w-full flex justify-end items-center gap-6 text-[7.5vw] sm:text-[8vw] uppercase tracking-tighter leading-none"
        >
          <span
            className="font-light tracking-wide text-transparent"
            style={{
              fontFamily: '"Outfit", "Inter", sans-serif',
              WebkitTextStroke: '1.5px #d1d7de',
            }}
          >
            YOUR
          </span>
          <span
            className="font-light tracking-wide text-transparent"
            style={{
              fontFamily: '"Outfit", "Inter", sans-serif',
              WebkitTextStroke: '1.5px #d1d7de',
            }}
          >
            WORKOUT
          </span>
        </div>
      </div>

      {/* ── 2. Central Dark 3D Editorial Workout Card ── */}
      <div className="relative z-10 mx-auto w-full max-w-[520px] px-4 flex flex-col items-center justify-center">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            width: '100%',
            maxWidth: '780px',
          }}
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            type: 'spring',
            stiffness: 90,
            damping: 16,
          }}
          className="group relative h-[500px] sm:h-[550px] md:h-[580px] rounded-[2.5rem] overflow-hidden shadow-md cursor-pointer bg-[#22252a] border border-white/10"
        >
          {/* ── Dark Card Background Concentric Circles Motif ── */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
              <div className="w-[440px] sm:w-[540px] md:w-[620px] h-[440px] sm:h-[540px] md:h-[620px] rounded-full border border-white/10" />
              <div className="absolute w-[330px] sm:w-[410px] md:w-[470px] h-[330px] sm:h-[410px] md:h-[470px] rounded-full border border-white/15 bg-gradient-to-b from-white/5 to-transparent" />
              <div className="absolute w-[220px] sm:w-[280px] md:w-[320px] h-[220px] sm:h-[280px] md:h-[320px] rounded-full border border-white/20" />
            </div>
          </div>

          {/* ── Top Header Text Overlay (Exact Font Match) ── */}
          <motion.div
            style={{ y: textY, opacity: textOpacity }}
            className="relative z-30 pt-5 sm:pt-6 px-4 text-center flex flex-col items-center pointer-events-none"
          >
            {/* VEXO Tag (Ultra-Thin Sleek Font) */}
            <span
              className="text-[11px] sm:text-[12px] font-medium uppercase tracking-[0.3em] text-white/90"
              style={{ fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif' }}
            >
              VEXO
            </span>

            {/* Sub-header */}
            <span
              className="text-[8.5px] sm:text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50 mt-0.5"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              LEVEL UP
            </span>

            {/* Stacked Main Title */}
            <h2
              className="text-base sm:text-lg md:text-[20px] font-semibold uppercase tracking-wide text-white leading-tight mt-1 drop-shadow-md max-w-[290px] sm:max-w-[320px]"
              style={{ fontFamily: '"Outfit", "Plus Jakarta Sans", "Inter", sans-serif' }}
            >
              WITH THE LATEST IN<br />
              <span className="text-white font-semibold">WORKOUT WEAR</span>
            </h2>
          </motion.div>

          {/* ── All 5 Models Squad Layering (Clean 3D Composition) ── */}
          <div className="relative w-full h-[360px] sm:h-[400px] pointer-events-none z-10 overflow-hidden mt-1 sm:mt-2">
            <motion.div
              style={{ scale: imageScale }}
              className="relative w-full h-full transform-gpu origin-top"
            >
              {/* 1. TOP CENTER MAIN MODEL */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[4%] sm:top-[2%] h-[78%] w-auto z-10 flex items-start justify-center">
                <img
                  src="/cardaut03.png"
                  alt="Center Model Beanie Hoodie"
                  className="h-full w-auto object-contain object-top filter drop-shadow-[0_12px_25px_rgba(0,0,0,0.6)]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/boyse.png';
                  }}
                />
              </div>

              {/* 2. MIDDLE LEFT BACKGROUND MODEL */}
              <div className="absolute left-[-2%] sm:left-[2%] top-[14%] h-[56%] w-auto z-15 flex items-start">
                <img
                  src="/cardauto.png"
                  alt="Left Background Model"
                  className="h-full w-auto object-contain object-top filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/boyse.png';
                  }}
                />
              </div>

              {/* 3. MIDDLE RIGHT BACKGROUND MODEL */}
              <div className="absolute right-[-2%] sm:right-[2%] top-[14%] h-[56%] w-auto z-15 flex items-start">
                <img
                  src="/model-nirvana.jpg"
                  alt="Right Background Model"
                  className="h-full w-auto object-contain object-top filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/side09.png';
                  }}
                />
              </div>

              {/* 4. FOREGROUND FRONT LEFT MODEL */}
              <div className="absolute left-[0%] sm:left-[4%] bottom-0 h-[64%] sm:h-[68%] w-auto z-30 flex items-end justify-start">
                <img
                  src="/cardaut2.png"
                  alt="Foreground Left Model"
                  className="h-full w-auto object-contain object-bottom filter drop-shadow-[0_18px_35px_rgba(0,0,0,0.8)]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/boyse.png';
                  }}
                />
              </div>

              {/* 5. FOREGROUND FRONT RIGHT MODEL */}
              <div className="absolute right-[0%] sm:right-[4%] bottom-0 h-[64%] sm:h-[68%] w-auto z-30 flex items-end justify-end">
                <img
                  src="/side09.png"
                  alt="Foreground Right Model"
                  className="h-full w-auto object-contain object-bottom filter drop-shadow-[0_18px_35px_rgba(0,0,0,0.8)]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/cardaut2.png';
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Bottom Dark Gradient Fade */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1b1d22] via-[#1b1d22]/50 to-transparent pointer-events-none z-30" />

          {/* ── Hover CTA Floating Button ── */}
          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 z-40 transition-all duration-300 transform group-hover:scale-105">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-xs font-black tracking-widest text-black uppercase shadow-2xl hover:bg-[#facc15] active:scale-95 transition-all border border-white/40"
            >
              <Zap className="h-3.5 w-3.5 fill-current text-black" />
              <span>SHOP WORKOUT WEAR</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
