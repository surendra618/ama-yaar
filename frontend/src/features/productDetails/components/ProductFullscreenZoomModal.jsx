import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function ProductFullscreenZoomModal({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  productName = '',
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const lastTouchRef = useRef({ x: 0, y: 0 });
  const touchStartRef = useRef({ x: 0, y: 0 });
  const pinchStartDistRef = useRef(null);
  const pinchStartScaleRef = useRef(1);
  const lastTapRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Sync index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setPan({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && images.length > 1) {
        handlePrev();
      }
      if (e.key === 'ArrowRight' && images.length > 1) {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const resetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    resetZoom();
    setCurrentIndex((prev) => (prev <= 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    resetZoom();
    setCurrentIndex((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
  };

  const getMaxPan = (currentScale) => {
    if (!containerRef.current || currentScale <= 1) return { maxX: 0, maxY: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const maxX = (rect.width * (currentScale - 1)) / 2;
    const maxY = (rect.height * (currentScale - 1)) / 2;
    return { maxX, maxY };
  };

  // Touch Handlers
  const handleTouchStart = (e) => {
    if (!e.touches) return;
    hasMovedRef.current = false;

    // Two finger pinch
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = scale;
      setIsDragging(true);
      return;
    }

    // Single touch
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };

      // Double tap detection
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (scale > 1.1) {
          resetZoom();
        } else {
          // Zoom into tapped location
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const relX = touch.clientX - rect.left - rect.width / 2;
            const relY = touch.clientY - rect.top - rect.height / 2;
            const newScale = 2.5;
            const { maxX, maxY } = getMaxPan(newScale);
            const targetX = Math.max(-maxX, Math.min(maxX, -relX * (newScale - 1)));
            const targetY = Math.max(-maxY, Math.min(maxY, -relY * (newScale - 1)));
            setScale(newScale);
            setPan({ x: targetX, y: targetY });
          }
        }
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!e.touches) return;

    // Handle Pinch Zoom
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      const dist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      const newScale = Math.max(1, Math.min(4, pinchStartScaleRef.current * (dist / pinchStartDistRef.current)));
      const { maxX, maxY } = getMaxPan(newScale);
      setScale(newScale);
      setPan((p) => ({
        x: Math.max(-maxX, Math.min(maxX, p.x)),
        y: Math.max(-maxY, Math.min(maxY, p.y)),
      }));
      hasMovedRef.current = true;
      if (e.cancelable) e.preventDefault();
      return;
    }

    // Handle Single Finger Pan / Swipe
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouchRef.current.x;
      const deltaY = touch.clientY - lastTouchRef.current.y;
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };

      const moveDist = Math.hypot(
        touch.clientX - touchStartRef.current.x,
        touch.clientY - touchStartRef.current.y
      );
      if (moveDist > 6) {
        hasMovedRef.current = true;
      }

      if (scale > 1.05) {
        // Zoomed: Slide finger to pan
        const { maxX, maxY } = getMaxPan(scale);
        setPan((prev) => ({
          x: Math.max(-maxX, Math.min(maxX, prev.x + deltaX)),
          y: Math.max(-maxY, Math.min(maxY, prev.y + deltaY)),
        }));
        if (e.cancelable) e.preventDefault();
      }
    }
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);
    pinchStartDistRef.current = null;

    if (scale <= 1.05) {
      // Swiping between images when not zoomed
      if (hasMovedRef.current && e.changedTouches && e.changedTouches[0]) {
        const touch = e.changedTouches[0];
        const diffX = touch.clientX - touchStartRef.current.x;
        const diffY = touch.clientY - touchStartRef.current.y;
        if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) {
            handleNext();
          } else {
            handlePrev();
          }
        }
      }
      setScale(1);
      setPan({ x: 0, y: 0 });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col select-none animate-in fade-in duration-200"
      onClick={(e) => {
        // Tap on outer area closes modal if not zoomed
        if (scale <= 1.05 && !hasMovedRef.current) {
          onClose();
        }
      }}
    >
      {/* Top Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-md z-30 border-b border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-white truncate max-w-[200px] sm:max-w-md">
            {productName || 'Amayaar'}
          </span>
          <span className="text-[11px] font-bold text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {scale > 1.05 && (
            <button
              type="button"
              onClick={resetZoom}
              className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 text-white px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition cursor-pointer"
            aria-label="Close Fullscreen View"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Zoomable Viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full overflow-hidden flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentImage}
          alt={productName || `Product view ${currentIndex + 1}`}
          draggable={false}
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
          }}
          className="max-h-full max-w-full object-contain pointer-events-none select-none will-change-transform"
        />

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer backdrop-blur-sm border border-neutral-700 shadow-lg"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer backdrop-blur-sm border border-neutral-700 shadow-lg"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Dynamic Zoom Help Banner */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-700 text-[11px] font-medium text-neutral-300 pointer-events-none shadow-md">
          {scale > 1.05
            ? `${scale.toFixed(1)}x • Slide finger to explore details`
            : 'Pinch or double-tap to zoom • Swipe to change'}
        </div>
      </div>

      {/* Bottom Thumbnails Strip */}
      {images.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 p-3 bg-black/80 backdrop-blur-md border-t border-neutral-800 shrink-0 overflow-x-auto z-30"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                resetZoom();
                setCurrentIndex(idx);
              }}
              className={`h-12 w-10 rounded-sm overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                currentIndex === idx
                  ? 'border-white opacity-100 scale-105'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
