import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Key,
  Check,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  closeFittingRoom,
  openFittingRoom,
  removeWornItem,
  clearFittingRoom,
  setSelectedModel,
  setDressing,
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

// Standard base wardrobe pieces (Pants, Shoes, Hat, Innerwear) matching the video
const BASE_WARDROBE = [
  {
    id: 'base-pants',
    name: 'Relaxed Street Cargo Trousers',
    type: 'pants',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&q=80',
    price: 999,
  },
  {
    id: 'base-shoes',
    name: 'Chunky Sole Streetwear Boots',
    type: 'shoes',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&q=80',
    price: 1499,
  },
  {
    id: 'base-inner',
    name: 'Heavyweight Ribbed Crewneck Tee',
    type: 'inner',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80',
    price: 499,
  },
  {
    id: 'base-hat',
    name: 'Vintage Knit Docker Beanie',
    type: 'hat',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=200&q=80',
    price: 299,
  },
];

export default function FittingRoomModal() {
  const dispatch = useDispatch();
  const { wornItems, isOpen, isDressing } = useSelector(
    (state) => state.fittingRoom
  );

  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ay_tryon_api_key') || '');
  const [customKeySaved, setCustomKeySaved] = useState(false);

  // Auto-finish dressing simulation after 800ms
  useEffect(() => {
    if (isDressing) {
      const timer = setTimeout(() => {
        dispatch(setDressing(false));
      }, 850);
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

  const handleAddAllToCart = () => {
    if (wornItems.length === 0) return;
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
    dispatch(openDrawer());
  };

  // The active outerwear item on the model
  const activeOuterwear = wornItems.length > 0 ? wornItems[wornItems.length - 1] : null;

  // Total pieces = worn user items + base pieces (matching the "5 pieces" in the video!)
  const totalPiecesCount = BASE_WARDROBE.length + wornItems.length;

  const totalLookPrice =
    wornItems.reduce((acc, it) => acc + Number(it.price || 0), 0) +
    BASE_WARDROBE.reduce((acc, it) => acc + Number(it.price || 0), 0);

  return (
    <>
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
            {wornItems.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-black text-[9px] font-black shadow-xs">
                {wornItems.length}
              </span>
            )}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Fitting room</span>
              {wornItems.length > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#e07a5f] animate-pulse" />
              )}
            </p>
            <p className="text-[10px] text-neutral-400 font-medium">
              {wornItems.length > 0
                ? `${totalPiecesCount} pieces look ready`
                : 'Tap hanger on products to wear'}
            </p>
          </div>
        </button>
      )}

      {/* 2. EXPANDED FITTING ROOM WIDGET (Exact match to LinkedIn Video) */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-[95] w-[310px] sm:w-[335px] max-w-[calc(100vw-32px)] rounded-2xl bg-[#16161c] text-white p-3.5 shadow-2xl border border-neutral-700/80 flex flex-col font-sans animate-in fade-in slide-in-from-bottom-5 duration-200">
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
              className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              aria-label="Close fitting room"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Central Mannequin / Standing Model Viewport matching Video */}
          <div className="relative mt-3 aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#0c0c0e] border border-neutral-800 flex items-center justify-center">
            {/* Base Standing Mannequin / Streetwear Model (Pants, Boots, Beanie) */}
            <div className="relative h-full w-full flex flex-col items-center justify-between p-2">
              {/* Head / Beanie / Sunglasses layer */}
              <div className="relative z-10 flex flex-col items-center mt-1">
                {/* Vintage Beanie */}
                <div className="h-7 w-12 rounded-t-full bg-[#b8860b]/90 border border-neutral-700 shadow-xs flex items-center justify-center">
                  <span className="text-[7px] font-black text-black/60 uppercase tracking-widest">AY</span>
                </div>
                {/* Head / Face Silhouette */}
                <div className="h-8 w-8 rounded-full bg-[#3a3530] border border-neutral-700 -mt-1.5 flex items-center justify-center shadow-inner">
                  {/* Streetwear Sunglasses */}
                  <div className="h-2 w-6 bg-black rounded-xs -mt-1 shadow-xs" />
                </div>
              </div>

              {/* Torso / Worn Garment layer */}
              <div className="relative z-20 flex-1 w-full max-w-[210px] my-1 flex items-center justify-center">
                {activeOuterwear ? (
                  /* Outerwear worn on model */
                  <div className="relative h-full w-full flex items-center justify-center animate-in zoom-in-95 duration-300">
                    <img
                      src={activeOuterwear.images?.[0] || activeOuterwear.image || '/boyse.png'}
                      alt={activeOuterwear.name}
                      className={`max-h-[175px] w-auto max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] transition-all duration-300 ${
                        isDressing ? 'scale-95 opacity-50 blur-xs' : 'scale-100 opacity-100'
                      }`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/boyse.png';
                      }}
                    />
                  </div>
                ) : (
                  /* Default Raw Streetwear Crewneck */
                  <div className="relative h-24 w-32 rounded-lg bg-[#24242a] border border-neutral-700 flex flex-col items-center justify-center shadow-md">
                    <span className="text-[9px] font-extrabold text-neutral-400 tracking-wider">AMA YAAR</span>
                    <span className="text-[8px] text-neutral-500 mt-0.5">INNER LAYER</span>
                  </div>
                )}
              </div>

              {/* Legs / Dark Relaxed Cargo Pants layer */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Trousers */}
                <div className="flex gap-2">
                  <div className="h-14 w-6 rounded-xs bg-[#1f2127] border-t border-neutral-700 shadow-sm" />
                  <div className="h-14 w-6 rounded-xs bg-[#1f2127] border-t border-neutral-700 shadow-sm" />
                </div>
                {/* Chunky Boots */}
                <div className="flex gap-3 -mt-0.5 mb-1">
                  <div className="h-3.5 w-7 rounded-sm bg-[#0e0e10] border border-neutral-800 shadow-md" />
                  <div className="h-3.5 w-7 rounded-sm bg-[#0e0e10] border border-neutral-800 shadow-md" />
                </div>
              </div>
            </div>

            {/* "Dressing your model" Loading State matching screenshot / video */}
            {isDressing && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-black/75 backdrop-blur-xs text-center animate-in fade-in duration-150">
                <div className="h-9 w-9 rounded-full border-2 border-neutral-700 border-t-[#e07a5f] animate-spin mb-2 shadow-lg" />
                <p className="text-xs font-bold text-white tracking-tight">
                  Dressing your model
                </p>
                <p className="mt-0.5 text-[10px] text-neutral-400 leading-tight max-w-[200px]">
                  The photo is being made for you. It takes a moment.
                </p>
              </div>
            )}
          </div>

          {/* "Your picks" Section matching video */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Your picks</span>
              <span className="text-[11px] text-neutral-400 font-medium">
                {totalPiecesCount} pieces
              </span>
            </div>

            {/* Horizontal reel of picked garments matching video 00:03 & 00:07 */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {/* User selected outerwear garments */}
              {wornItems.map((item) => {
                const pid = item._id || item.id || item.slug;
                const thumb = item.images?.[0] || item.image || '/model01.png';
                return (
                  <div
                    key={pid}
                    className="group/pick relative flex-shrink-0 h-10 w-10 rounded-lg bg-[#22222a] border border-[#e07a5f]/60 overflow-hidden shadow-xs ring-1 ring-[#e07a5f]"
                    title={item.name}
                  >
                    <img
                      src={thumb}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/model01.png';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => dispatch(removeWornItem(pid))}
                      className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-bl-sm bg-black/80 text-white hover:bg-rose-600 transition"
                      title="Take off"
                    >
                      <X className="h-2 w-2 stroke-[3]" />
                    </button>
                  </div>
                );
              })}

              {/* Base wardrobe pieces (cargo pants, shoes, tee, beanie) */}
              {BASE_WARDROBE.map((bw) => (
                <div
                  key={bw.id}
                  className="relative flex-shrink-0 h-10 w-10 rounded-lg bg-[#1a1a22] border border-neutral-700/80 overflow-hidden opacity-85 hover:opacity-100 transition"
                  title={bw.name}
                >
                  <img
                    src={bw.image}
                    alt={bw.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
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
              onClick={() => dispatch(clearFittingRoom())}
              disabled={wornItems.length === 0}
              className="flex items-center gap-1 hover:text-rose-400 disabled:opacity-40 transition cursor-pointer font-medium"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Start over</span>
            </button>
          </div>

          {/* Quick Add Look to Bag CTA */}
          {wornItems.length > 0 && (
            <button
              type="button"
              onClick={handleAddAllToCart}
              className="mt-2.5 w-full rounded-xl bg-[#e07a5f] hover:bg-[#d0694e] py-2 px-3 text-center text-[11px] font-black uppercase tracking-wider text-white shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Look to Cart (₹{totalLookPrice.toLocaleString('en-IN')})</span>
            </button>
          )}
        </div>
      )}

      {/* API Key Modal matching "Your API key" feature */}
      {apiKeyModalOpen && (
        <div
          onClick={() => setApiKeyModalOpen(false)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
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
              Connect your Gemini, Fal.ai, or Replicate API key for real-time AI generative dressing, or use the built-in instant streetwear mannequin engine.
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
