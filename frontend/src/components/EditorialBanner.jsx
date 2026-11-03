import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import api from '../lib/axios';

const DEFAULT_SLIDES = [
  {
    id: 1,
    name: 'PUFFER JACKET 01',
    category: 'OUTERWEAR / DROP 01',
    garment: '/nocta-stage/garment-01.png',
    link: '/products',
  },
  {
    id: 2,
    name: 'TACTICAL HOODIE 02',
    category: 'HEAVY FLEECE / DROP 02',
    garment: '/nocta-stage/garment-02.png',
    link: '/products',
  },
  {
    id: 3,
    name: 'CREWNECK SWEATSHIRT 03',
    category: 'OVERSIZED TERRY / DROP 03',
    garment: '/nocta-stage/garment-03.png',
    link: '/products',
  },
  {
    id: 4,
    name: 'TECH FLEECE ZIP 04',
    category: 'ESSENTIAL LAYER / DROP 04',
    garment: '/nocta-stage/garment-04.png',
    link: '/products',
  },
];

export default function EditorialBanner() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const touchStartX = useRef(null);
  const containerRef = useRef(null);

  // Auto-play interval (3.5 seconds)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePointerDown = (e) => {
    touchStartX.current = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(diff) > 40) {
      if (diff < 0) handleNext();
      else handlePrev();
    }
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section className="relative w-full bg-white text-black py-12 md:py-20 overflow-hidden select-none">
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14 min-h-[580px] sm:min-h-[660px] md:min-h-[740px] lg:min-h-[820px] flex items-center justify-center">

        {/* Left Side Copy / Editorial Headline (NOCTA Studio Style) */}
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 md:top-1/2 md:-translate-y-1/2 md:left-12 lg:left-16 z-30 max-w-[320px] sm:max-w-[360px] md:max-w-[380px] text-left pointer-events-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black uppercase tracking-tight leading-[0.92] text-black">
            THE NOCTA<br />COLLECTION
          </h2>
          <p className="mt-3.5 sm:mt-4 text-xs sm:text-sm font-medium text-neutral-600 leading-relaxed tracking-normal">
            Made for the night shift. / Worn around the clock.
          </p>
          <div className="mt-5 sm:mt-6">
            <Link
              to={currentSlide.link || '/products'}
              className="inline-flex items-center justify-center px-7 sm:px-8 py-2.5 sm:py-3 rounded-full border-[2px] border-black text-xs sm:text-[13px] font-black uppercase tracking-wider text-black bg-transparent hover:bg-black hover:text-white transition-colors duration-200 shadow-xs"
            >
              Shop now
            </Link>
          </div>
        </div>

        {/* Center Stage: Base Model + Sliding Garment Outfits */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="relative w-[300px] sm:w-[380px] md:w-[440px] lg:w-[480px] xl:w-[500px] aspect-[9/16] max-h-[760px] flex items-center justify-center z-10 touch-pan-y"
        >
          {/* Static High-Resolution Base Model Figure */}
          <img
            src="/nocta-stage/model-base.jpg"
            alt="Model base silhouette"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
            draggable="false"
          />

          {/* Interactive Garment Carousel Track */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
            {slides.map((slide, idx) => {
              const diff = idx - currentIndex;
              const isActive = diff === 0;
              const isNear = Math.abs(diff) === 1;

              // Compute X shift percentage based on slot distance
              const translateX = `${diff * 134}%`;
              const opacity = isActive ? 1 : isNear ? 0.32 : 0.08;
              const scale = isActive ? 1 : 0.94;

              return (
                <div
                  key={slide.id || idx}
                  onClick={() => !isActive && setCurrentIndex(idx)}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive ? 'pointer-events-auto cursor-default' : 'pointer-events-auto cursor-pointer'
                  }`}
                  style={{
                    transform: `translateX(${translateX}) scale(${scale})`,
                    opacity,
                  }}
                  title={slide.name}
                >
                  <img
                    src={slide.garment}
                    alt={slide.name}
                    className="w-full h-full object-contain select-none"
                    draggable="false"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Prev Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous garment"
          className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/5 hover:bg-black/15 backdrop-blur-md text-black flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Next Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next garment"
          className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/5 hover:bg-black/15 backdrop-blur-md text-black flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Bottom Left Garment Label (Shopify NOCTA style) */}
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 md:bottom-8 md:left-12 z-30 pointer-events-none">
          <p className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.2em] text-neutral-800 uppercase">
            {currentSlide.name}
          </p>
        </div>

        {/* Bottom Center Indicator Dots + Autoplay Pause/Play Toggle */}
        <div className="absolute bottom-4 inset-x-0 sm:bottom-6 md:bottom-8 z-30 flex items-center justify-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            {slides.map((slide, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="h-6 w-6 flex items-center justify-center p-0 bg-transparent cursor-pointer"
                >
                  <span
                    className={`block rounded-full bg-black transition-all duration-300 ${
                      isActive ? 'h-2 w-2 opacity-100 scale-125' : 'h-1.5 w-1.5 opacity-25 hover:opacity-60 scale-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Autoplay Pause/Resume button */}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pause automatic change' : 'Resume automatic change'}
            className="h-6 w-6 flex items-center justify-center text-black/60 hover:text-black transition cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="h-3 w-3 stroke-[2.5]" />
            ) : (
              <Play className="h-3 w-3 fill-current stroke-none" />
            )}
          </button>
        </div>

      </div>
    </section>
  );
}
