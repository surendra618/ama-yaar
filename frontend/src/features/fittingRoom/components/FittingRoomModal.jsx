import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Key,
  Check,
  ChevronDown,
  ZoomIn,
} from 'lucide-react';
import {
  closeFittingRoom,
  openFittingRoom,
  removeWornItem,
  removeBasePiece,
  clearFittingRoom,
  resetFittingRoom,
  setDressing,
  clearFlyingGarment,
} from '../fittingRoomSlice';
import { addToCart, openDrawer } from '../../cart/cartSlice';

// Custom Coat Hanger Icon matching video exactly
export const HangerIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 3a2.5 2.5 0 0 1 2.45 2H12a1 1 0 0 0-1 1v1.65L3.6 13.5A2 2 0 0 0 5 17h14a2 2 0 0 0 1.4-3.5L13 7.65V6a2.5 2.5 0 0 1-1-2z" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

// Base wardrobe items configuration matching video & user screenshot
const BASE_ITEMS_CONFIG = {
  pants: {
    id: 'pants',
    name: 'Charcoal Tailored Pants',
    type: 'pants',
    image: '/pick-pants.png',
    price: 1499,
  },
  shoes: {
    id: 'shoes',
    name: 'Classic Canvas High-Tops',
    type: 'shoes',
    image: '/pick-shoes.png',
    price: 1999,
  },
  inner: {
    id: 'inner',
    name: 'Ribbed Navy Henley',
    type: 'inner',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80',
    price: 799,
  },
  hat: {
    id: 'hat',
    name: 'Tan Newsboy Cap',
    type: 'hat',
    image: '/pick-cap.png',
    price: 499,
  },
};

const DEFAULT_OUTERWEAR = {
  id: 'default-puffer',
  name: 'Army Green Puffer Jacket',
  type: 'jacket',
  image: '/pick-jacket.png',
  price: 2499,
};

export default function FittingRoomModal() {
  const dispatch = useDispatch();
  const {
    wornItems = [],
    basePieces = ['pants', 'shoes', 'inner', 'hat'],
    isOpen,
    isDressing,
    flyingGarment,
  } = useSelector((state) => state.fittingRoom);

  const modelViewportRef = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ay_tryon_api_key') || '');
  const [customKeySaved, setCustomKeySaved] = useState(false);

  // Auto-finish dressing simulation after 900ms
  useEffect(() => {
    if (isDressing) {
      const timer = setTimeout(() => {
        dispatch(setDressing(false));
      }, 950);
      return () => clearTimeout(timer);
    }
  }, [isDressing, dispatch]);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('ay_tryon_api_key', apiKey.trim());
    setCustomKeySaved(true);
    setTimeout(() => {
      setCustomKeySaved(false);
      setApiKeyModalOpen(false);
    }, 700);
  };

  const isCustomWorn = wornItems.length > 0;
  const activeOuterwear = isCustomWorn ? wornItems[wornItems.length - 1] : DEFAULT_OUTERWEAR;
  const activeBaseList = (basePieces || []).map((id) => BASE_ITEMS_CONFIG[id]).filter(Boolean);

  // Total pieces = worn outerwear + active base pieces (matching "5 pieces" in the video)
  const totalPiecesCount = activeBaseList.length + (isCustomWorn ? wornItems.length : 1);

  const totalLookPrice =
    (isCustomWorn
      ? wornItems.reduce((acc, it) => acc + Number(it.price || 0), 0)
      : DEFAULT_OUTERWEAR.price) +
    activeBaseList.reduce((acc, it) => acc + Number(it.price || 0), 0);

  const handleAddAllToCart = () => {
    if (isCustomWorn) {
      wornItems.forEach((product) => {
        const defaultVariant = product.sizes?.[0] || 'Free Size';
        dispatch(
          addToCart({
            productId: product._id || product.id,
            quantity: 1,
            variant: defaultVariant,
          })
        );
      });
    }
    dispatch(openDrawer());
  };

  // Target position for the flying garment animation (bottom left Fitting Room viewport)
  const getTargetPosition = () => {
    if (modelViewportRef.current) {
      const rect = modelViewportRef.current.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - 40,
        y: rect.top + rect.height / 2 - 50,
      };
    }
    return { x: 70, y: window.innerHeight - 340 };
  };

  return (
    <>
      {/* 0. FLYING GARMENT ANIMATION (Matches Video 00:06) */}
      <AnimatePresence>
        {flyingGarment && (
          <motion.div
            key={flyingGarment.key || 'flying-garment'}
            initial={{
              position: 'fixed',
              top: flyingGarment.startRect.top,
              left: flyingGarment.startRect.left,
              width: flyingGarment.startRect.width,
              height: flyingGarment.startRect.height,
              opacity: 0.95,
              scale: 1,
              rotate: 0,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            animate={{
              top: getTargetPosition().y,
              left: getTargetPosition().x,
              width: 80,
              height: 100,
              scale: 0.6,
              opacity: 0.3,
              rotate: -12,
            }}
            exit={{ opacity: 0, scale: 0.2 }}
            transition={{
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1], // Natural bezier arc curve
            }}
            onAnimationComplete={() => {
              dispatch(clearFlyingGarment());
            }}
            className="rounded-xl overflow-hidden shadow-2xl drop-shadow-[0_15px_30px_rgba(224,122,95,0.4)]"
          >
            <img
              src={flyingGarment.image}
              alt="Flying Garment"
              className="h-full w-full object-contain filter drop-shadow-md"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. COLLAPSED FLOATING PILL TRIGGER (when closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => dispatch(openFittingRoom())}
          className="fixed bottom-6 left-6 z-[90] flex items-center gap-2.5 rounded-full bg-[#181820]/95 hover:bg-black text-white px-4 py-2.5 shadow-2xl border border-neutral-700/80 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
          aria-label="Open Fitting Room"
        >
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#e07a5f] text-white">
            <HangerIcon className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-black text-[9px] font-black shadow-xs">
              {totalPiecesCount}
            </span>
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Fitting room</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#e07a5f] animate-pulse" />
            </p>
            <p className="text-[10px] text-neutral-400 font-medium">
              {totalPiecesCount} pieces look ready
            </p>
          </div>
        </button>
      )}

      {/* 2. EXPANDED FITTING ROOM WIDGET (Exact match to User Screenshot & Video) */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-[95] w-[310px] sm:w-[335px] max-w-[calc(100vw-32px)] rounded-2xl bg-[#16161c] text-white p-3.5 shadow-2xl border border-neutral-700/80 flex flex-col font-sans animate-in fade-in slide-in-from-bottom-5 duration-200 select-none">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Fitting room
              </h3>
              <p className="mt-0.5 text-[11px] text-neutral-400 font-normal">
                Tap the hanger on any product to wear it.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch(closeFittingRoom())}
              className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              aria-label="Close fitting room"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Central Mannequin / Model Viewport with exact Screenshot Studio Look */}
          <div
            ref={modelViewportRef}
            className="relative mt-3 aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-b from-[#e8e7e4] via-[#dfdeda] to-[#d6d5d0] border border-neutral-700/60 flex items-center justify-center shadow-inner group"
          >
            {/* Real Studio Mannequin Photo (Exact match to user screenshot) */}
            <div
              className={`relative h-full w-full flex items-center justify-center transition-all duration-500 ${
                isDressing ? 'filter blur-[2px] opacity-35 scale-[0.98]' : 'filter blur-0 opacity-100 scale-100'
              }`}
            >
              <img
                src="/fitting-room-model.png"
                alt="AMA YAAR Mannequin Model"
                className="h-full w-full object-cover object-center drop-shadow-md select-none"
              />

              {/* Seamless overlay when user picks a different jacket/coat from the catalog */}
              <AnimatePresence mode="wait">
                {isCustomWorn && activeOuterwear && (
                  <motion.div
                    key={activeOuterwear._id || activeOuterwear.id || activeOuterwear.slug}
                    initial={{ opacity: 0, scale: 0.88, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="relative w-[65%] -mt-6">
                      <img
                        src={activeOuterwear.images?.[0] || activeOuterwear.image}
                        alt={activeOuterwear.name}
                        className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom-Right Magnifying Glass Zoom Button (Exact match to screenshot media_1792346507094_36124946.png) */}
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-2.5 right-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 hover:bg-black text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-md transition-all duration-200 cursor-pointer active:scale-95"
              title="Zoom outfit details"
              aria-label="Zoom outfit"
            >
              <ZoomIn className="h-3.5 w-3.5 stroke-[2.2]" />
            </button>

            {/* "Dressing your model" EXACT SCREENSHOT LOADING ANIMATION */}
            <AnimatePresence>
              {isDressing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-black/70 backdrop-blur-xs text-center"
                >
                  {/* Glowing Amber Gradient Rotating Ring (Exact match to screenshot) */}
                  <div className="relative h-12 w-12 flex items-center justify-center mb-3">
                    <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#4b5563"
                        strokeWidth="2.5"
                        fill="none"
                      />
                      <path
                        fill="none"
                        stroke="url(#dressing-gradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        d="M12 2a10 10 0 0 1 10 10"
                      />
                      <defs>
                        <linearGradient id="dressing-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#e07a5f" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Exact Text from Screenshot */}
                  <p className="text-xs font-bold text-white tracking-tight">
                    Dressing your model
                  </p>
                  <p className="mt-1 text-[10.5px] text-neutral-400 leading-snug max-w-[210px]">
                    The photo is being made for you. It takes a moment.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* "Your picks" Section matching screenshot */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Your picks</span>
              <span className="text-[11px] text-neutral-400 font-medium">
                {totalPiecesCount} pieces
              </span>
            </div>

            {/* Horizontal reel of picked garments matching video 00:03 & 00:07 */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {/* Active Base Wardrobe Pieces (Pants, Shoes, Henley, Cap) */}
              {activeBaseList.map((piece) => (
                <motion.div
                  key={piece.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="group/pick relative flex-shrink-0 h-10 w-10 rounded-lg bg-[#22222a] border border-neutral-700/80 overflow-hidden shadow-xs hover:border-[#e07a5f] transition"
                  title={piece.name}
                >
                  <img
                    src={piece.image}
                    alt={piece.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => dispatch(removeBasePiece(piece.id))}
                    className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-bl-sm bg-black/80 text-white hover:bg-rose-600 transition cursor-pointer"
                    title={`Take off ${piece.name}`}
                  >
                    <X className="h-2 w-2 stroke-[3]" />
                  </button>
                </motion.div>
              ))}

              {/* User selected outerwear garments (or default puffer if none chosen) */}
              {isCustomWorn ? (
                wornItems.map((item) => {
                  const pid = item._id || item.id || item.slug;
                  const thumb = item.images?.[0] || item.image || '/pick-jacket.png';
                  return (
                    <motion.div
                      key={pid}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className="group/pick relative flex-shrink-0 h-10 w-10 rounded-lg bg-[#22222a] border border-[#e07a5f] overflow-hidden shadow-xs ring-1 ring-[#e07a5f]"
                      title={item.name}
                    >
                      <img
                        src={thumb}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => dispatch(removeWornItem(pid))}
                        className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-bl-sm bg-black/80 text-white hover:bg-rose-600 transition cursor-pointer"
                        title="Take off"
                      >
                        <X className="h-2 w-2 stroke-[3]" />
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  key="default-puffer"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="group/pick relative flex-shrink-0 h-10 w-10 rounded-lg bg-[#22222a] border border-[#e07a5f]/80 overflow-hidden shadow-xs ring-1 ring-[#e07a5f]"
                  title={DEFAULT_OUTERWEAR.name}
                >
                  <img
                    src={DEFAULT_OUTERWEAR.image}
                    alt={DEFAULT_OUTERWEAR.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => dispatch(clearFittingRoom())}
                    className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-bl-sm bg-black/80 text-white hover:bg-rose-600 transition cursor-pointer"
                    title="Take off jacket"
                  >
                    <X className="h-2 w-2 stroke-[3]" />
                  </button>
                </motion.div>
              )}

              {/* Orange indicator dot matching screenshot media_1792345195839_00eec46b.png */}
              <div className="flex-shrink-0 flex items-center justify-center pl-1">
                <span className="h-2 w-2 rounded-full bg-[#e07a5f] animate-pulse" />
              </div>
            </div>

            {/* Hint text matching video 00:03 */}
            <p className="mt-1.5 text-[9.5px] text-neutral-400">
              Add another piece and it gets overlaid on your model.
            </p>
          </div>

          {/* Bottom Bar matching video: [🔑 Your API key]  [↺ Start over] */}
          <div className="mt-2.5 pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
            <button
              type="button"
              onClick={() => setApiKeyModalOpen(true)}
              className="flex items-center gap-1 hover:text-white transition cursor-pointer font-medium"
            >
              <Key className="h-3 w-3 text-neutral-400" />
              <span>{apiKey ? 'API key set' : 'Your API key'}</span>
            </button>

            <button
              type="button"
              onClick={() => dispatch(resetFittingRoom())}
              className="flex items-center gap-1 hover:text-rose-400 transition cursor-pointer font-medium"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Start over</span>
            </button>
          </div>

          {/* Quick Add Look to Bag CTA */}
          <button
            type="button"
            onClick={handleAddAllToCart}
            className="mt-2.5 w-full rounded-xl bg-[#e07a5f] hover:bg-[#d0694e] py-2 px-3 text-center text-[11px] font-black uppercase tracking-wider text-white shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Add Look to Cart (₹{totalLookPrice.toLocaleString('en-IN')})</span>
          </button>
        </div>
      )}

      {/* 3. LIGHTBOX FULL-SCREEN OUTFIT INSPECTOR (Triggered by Zoom button on model) */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-lg w-full rounded-2xl bg-[#16161c] border border-neutral-700/80 p-5 text-white shadow-2xl flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                    <span>Virtual Fitting Room — Full Outfit</span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-[#e07a5f]/20 text-[#e07a5f]">
                      {totalPiecesCount} pieces
                    </span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    High-resolution studio rendering of your styled mannequin look
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Large Model View */}
              <div className="relative mt-4 aspect-[3/4] w-full max-w-[320px] rounded-xl overflow-hidden bg-gradient-to-b from-[#e8e7e4] via-[#dfdeda] to-[#d6d5d0] border border-neutral-700/60 flex items-center justify-center shadow-lg">
                <img
                  src="/fitting-room-model.png"
                  alt="High Resolution Mannequin Look"
                  className="h-full w-full object-cover object-center"
                />
              </div>

              {/* Pieces Summary Grid */}
              <div className="w-full mt-4 grid grid-cols-2 gap-2 text-left text-xs">
                {activeBaseList.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#202028] border border-neutral-800"
                  >
                    <img src={p.image} alt={p.name} className="h-8 w-8 rounded-sm object-cover" />
                    <div className="truncate">
                      <p className="font-semibold text-white truncate text-[11px]">{p.name}</p>
                      <p className="text-[10px] text-neutral-400">₹{p.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#202028] border border-[#e07a5f]/60">
                  <img
                    src={activeOuterwear.images?.[0] || activeOuterwear.image || '/pick-jacket.png'}
                    alt={activeOuterwear.name}
                    className="h-8 w-8 rounded-sm object-cover"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-white truncate text-[11px]">{activeOuterwear.name}</p>
                    <p className="text-[10px] text-[#e07a5f] font-bold">
                      ₹{Number(activeOuterwear.price).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Add to cart CTA in Lightbox */}
              <div className="w-full mt-4 pt-3 border-t border-neutral-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleAddAllToCart();
                    setLightboxOpen(false);
                  }}
                  className="flex-1 rounded-xl bg-[#e07a5f] hover:bg-[#d0694e] py-2.5 px-4 text-center text-xs font-black uppercase tracking-wider text-white shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add Entire Look to Bag — ₹{totalLookPrice.toLocaleString('en-IN')}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. API KEY MODAL (Matching "Your API key" feature) */}
      {apiKeyModalOpen && (
        <div
          onClick={() => setApiKeyModalOpen(false)}
          className="fixed inset-0 z-[125] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-[#1e1e26] p-5 border border-neutral-700 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <Key className="h-4 w-4 text-[#e07a5f]" />
                <span>AI Virtual Try-On API Key</span>
              </h4>
              <button
                type="button"
                onClick={() => setApiKeyModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Connect your Gemini, Fal.ai, or Replicate API key for real-time generative AI try-on, or continue with the instant built-in model engine.
            </p>
            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <input
                type="password"
                placeholder="Enter AI API Key (optional)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-black/40 px-3 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:border-[#e07a5f] focus:outline-hidden"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#e07a5f] hover:bg-[#d0694e] py-2.5 text-xs font-bold text-white transition cursor-pointer"
                >
                  {customKeySaved ? 'Saved!' : 'Save Key'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('ay_tryon_api_key');
                    setApiKey('');
                    setApiKeyModalOpen(false);
                  }}
                  className="rounded-xl border border-neutral-700 px-3 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
