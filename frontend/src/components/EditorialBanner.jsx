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
    <section className="relative w-full bg-white text-black py-6 sm:py-8 md:py-10 overflow-hidden select-none">
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14 flex flex-col md:flex-row md:items-center md:justify-center min-h-[560px] sm:min-h-[580px] md:min-h-[600px] lg:min-h-[660px]">

        {/* Copy / Editorial Headline (Clean top-stacked on mobile, absolute left on desktop) */}
        <div className="relative md:absolute md:top-1/2 md:-translate-y-1/2 md:left-12 lg:left-16 z-30 w-full max-w-[340px] sm:max-w-[360px] md:max-w-[380px] text-left pointer-events-auto mb-6 md:mb-0">
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-[54px] font-black uppercase tracking-tight leading-[0.92] text-black">
            THE NOCTA<br />COLLECTION
          </h2>
          <p className="mt-2.5 sm:mt-3 md:mt-4 text-xs sm:text-sm font-medium text-neutral-600 leading-relaxed tracking-normal">
            Made for the night shift. / Worn around the clock.
          </p>
          <div className="mt-4 sm:mt-5 md:mt-6">
            <Link
              to={currentSlide.link || '/products'}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2 sm:py-2.5 md:py-3 rounded-full border-[2px] border-black text-[11px] sm:text-xs md:text-[13px] font-black uppercase tracking-wider text-black bg-transparent hover:bg-black hover:text-white transition-colors duration-200 shadow-xs"
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
          className="relative mx-auto w-[240px] xs:w-[270px] sm:w-[320px] md:w-[380px] lg:w-[420px] aspect-[9/16] max-h-[480px] sm:max-h-[540px] md:max-h-[620px] flex items-center justify-center z-10 touch-pan-y my-2 md:my-0"
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
              // Calculate shortest circular difference so slides wrap around infinitely in one direction
              let diff = idx - currentIndex;
              const n = slides.length;
              if (diff > n / 2) diff -= n;
              if (diff < -n / 2) diff += n;

              const isActive = diff === 0;
              const isNear = Math.abs(diff) === 1;

              // Compute X shift percentage based on circular slot distance
              const translateX = `${diff * 134}%`;
              const opacity = isActive ? 1 : isNear ? 0.32 : 0;
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
                    visibility: Math.abs(diff) <= 1 ? 'visible' : 'hidden',
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

      </div>
    </section>
  );
}
