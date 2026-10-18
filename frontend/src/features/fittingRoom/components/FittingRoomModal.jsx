import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Camera,
  ChevronDown,
  Check,
  Plus,
} from 'lucide-react';
import {
  closeFittingRoom,
  openFittingRoom,
  removeWornItem,
  clearFittingRoom,
  setSelectedModel,
  setUserUploadedPhoto,
  setDressing,
} from '../fittingRoomSlice';
import { addToCart, openDrawer } from '../../cart/cartSlice';

// Custom Coat Hanger Icon matching reference screenshot exactly
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

const PRESET_MODELS = [
  {
    id: 'male-1',
    name: 'Kabir (Street)',
    gender: 'Male',
    baseImage: '/Curly-Haired Model in Beige Polo.png',
    fallback: '/model01.png',
  },
  {
    id: 'male-2',
    name: 'Arjun (Casual)',
    gender: 'Male',
    baseImage: '/Stylish Streetwear Man with Backpack.png',
    fallback: '/boyse.png',
  },
  {
    id: 'female-1',
    name: 'Riya (Editorial)',
    gender: 'Female',
    baseImage: '/fashion-model.jpg',
    fallback: '/model-nirvana.jpg',
  },
];

export default function FittingRoomModal() {
  const dispatch = useDispatch();
  const { wornItems, isOpen, isDressing, selectedModel, userUploadedPhoto } =
    useSelector((state) => state.fittingRoom);

  const [activeTab, setActiveTab] = useState('model'); // 'model' or 'models-picker'
  const fileInputRef = useRef(null);

  // Auto-finish dressing simulation after 1.2s
  useEffect(() => {
    if (isDressing) {
      const timer = setTimeout(() => {
        dispatch(setDressing(false));
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isDressing, dispatch]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        dispatch(setUserUploadedPhoto(event.target.result));
      };
      reader.readAsDataURL(file);
    }
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

  // Determine which model image to render
  const currentPreset =
    PRESET_MODELS.find((m) => m.id === selectedModel) || PRESET_MODELS[0];

  // If user has worn items, select the most featured garment's photo or the styled model composite
  const lastWorn = wornItems[wornItems.length - 1];
  const renderedModelImage =
    userUploadedPhoto && selectedModel === 'user'
      ? userUploadedPhoto
      : lastWorn
      ? lastWorn.images?.[0] || lastWorn.image || currentPreset.baseImage
      : currentPreset.baseImage;

  const totalLookPrice = wornItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  return (
    <>
      {/* 1. COLLAPSED FLOATING PILL TRIGGER (when closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => dispatch(openFittingRoom())}
          className="fixed bottom-5 left-5 z-[90] flex items-center gap-2.5 rounded-full bg-[#18181b]/95 hover:bg-black text-white px-4 py-2.5 shadow-2xl border border-neutral-700/80 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
          aria-label="Open Fitting Room"
        >
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#f97316] text-white">
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
                <span className="h-1.5 w-1.5 rounded-full bg-[#f97316] animate-pulse" />
              )}
            </p>
            <p className="text-[10px] text-neutral-400 font-medium">
              {wornItems.length > 0
                ? `${wornItems.length} piece${wornItems.length > 1 ? 's' : ''} worn`
                : 'Tap hanger on clothes to try'}
            </p>
          </div>
        </button>
      )}

      {/* 2. EXPANDED FITTING ROOM WIDGET (Exact Reference: Image uploaded by user) */}
      {isOpen && (
        <div className="fixed bottom-5 left-5 z-[95] w-[320px] sm:w-[350px] max-w-[calc(100vw-40px)] rounded-2xl bg-[#18181b] text-white p-4 shadow-2xl border border-neutral-800 flex flex-col font-sans animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <HangerIcon className="h-4 w-4 text-[#f97316]" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Fitting room
                </h3>
              </div>
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

          {/* Model Display Viewport matching screenshot */}
          <div className="relative mt-3 aspect-[3/3.8] w-full overflow-hidden rounded-xl bg-[#0e0e10] border border-neutral-800/80 flex items-center justify-center">
            {/* Model Image */}
            <img
              src={renderedModelImage}
              alt="Model Virtual Try-On"
              className={`h-full w-full object-cover object-center transition-all duration-500 ${
                isDressing ? 'blur-xs scale-98 opacity-40' : 'blur-0 scale-100 opacity-100'
              }`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/boyse.png';
              }}
            />

            {/* "Dressing your model" Loading State matching screenshot */}
            {isDressing ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-center animate-in fade-in duration-150">
                <div className="h-10 w-10 rounded-full border-2 border-neutral-700 border-t-[#f97316] animate-spin mb-3 shadow-lg" />
                <p className="text-xs font-bold text-white tracking-tight">
                  Dressing your model
                </p>
                <p className="mt-1 text-[10px] text-neutral-400 leading-tight max-w-[200px]">
                  The photo is being made for you. It takes a moment.
                </p>
              </div>
            ) : wornItems.length === 0 ? (
              /* Empty hint overlay */
              <div className="absolute inset-x-3 bottom-3 z-10 rounded-lg bg-black/70 backdrop-blur-md p-2 text-center border border-white/10">
                <p className="text-[10px] font-semibold text-white/90">
                  Ready to dress! Tap the 🧥 hanger icon on any product to wear it.
                </p>
              </div>
            ) : (
              /* Dressed success pill */
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[9px] font-bold text-white border border-white/10">
                <Sparkles className="h-3 w-3 text-[#f97316]" />
                <span>AI Try-On Ready</span>
              </div>
            )}

            {/* Model Switcher Pill on Top-Right */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setActiveTab((prev) => (prev === 'models' ? 'model' : 'models'))
                }
                className="flex items-center gap-1 rounded-full bg-black/70 hover:bg-black backdrop-blur-md px-2 py-1 text-[10px] font-bold text-white border border-white/10 transition cursor-pointer"
                title="Change AI Model"
              >
                <span>{selectedModel === 'user' ? 'My Photo' : currentPreset.name.split(' ')[0]}</span>
                <ChevronDown className="h-3 w-3 text-neutral-400" />
              </button>
            </div>

            {/* Model Selector Dropdown */}
            {activeTab === 'models' && (
              <div className="absolute inset-x-2 top-10 z-30 rounded-xl bg-[#202024] p-2.5 shadow-2xl border border-neutral-700 text-xs text-white space-y-1.5 animate-in fade-in duration-150">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1 mb-1">
                  Select Model
                </p>
                {PRESET_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      dispatch(setSelectedModel(m.id));
                      setActiveTab('model');
                    }}
                    className={`flex items-center justify-between w-full p-1.5 rounded-lg text-left transition ${
                      selectedModel === m.id
                        ? 'bg-[#f97316] text-white font-bold'
                        : 'hover:bg-white/10 text-neutral-300'
                    }`}
                  >
                    <span>{m.name}</span>
                    {selectedModel === m.id && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 w-full p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 transition text-[11px]"
                >
                  <Camera className="h-3.5 w-3.5 text-[#f97316]" />
                  <span>Upload Your Photo</span>
                </button>
              </div>
            )}
          </div>

          {/* Hidden File Input for Custom Photo Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />

          {/* "Your picks" Section matching screenshot */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Your picks</span>
              <span className="text-[11px] text-neutral-400 font-medium">
                {wornItems.length} {wornItems.length === 1 ? 'piece' : 'pieces'}
              </span>
            </div>

            {/* Horizontal reel of picked garments */}
            <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-hide min-h-[52px]">
              {wornItems.length === 0 ? (
                <p className="text-[11px] text-neutral-500 italic py-2">
                  No clothes worn yet. Tap the 🧥 icon on any product!
                </p>
              ) : (
                wornItems.map((item) => {
                  const pid = item._id || item.id || item.slug;
                  const thumb =
                    item.images?.[0] || item.image || '/model01.png';
                  return (
                    <div
                      key={pid}
                      className="group/pick relative flex-shrink-0 h-12 w-12 rounded-lg bg-neutral-900 border border-neutral-700 overflow-hidden shadow-xs"
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
                      {/* Delete / remove button matching screenshot */}
                      <button
                        type="button"
                        onClick={() => dispatch(removeWornItem(pid))}
                        className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/80 text-white hover:bg-red-600 transition"
                        title="Take off"
                      >
                        <X className="h-2.5 w-2.5 stroke-[3]" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Controls Row matching screenshot */}
          <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white transition cursor-pointer font-medium"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{userUploadedPhoto ? 'Change photo' : 'Your photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => dispatch(clearFittingRoom())}
              disabled={wornItems.length === 0}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-rose-400 disabled:opacity-40 transition cursor-pointer font-medium"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Start over</span>
            </button>
          </div>

          {/* Add Look to Bag CTA */}
          {wornItems.length > 0 && (
            <button
              type="button"
              onClick={handleAddAllToCart}
              className="mt-3 w-full rounded-xl bg-[#f97316] hover:bg-[#ea580c] py-2.5 px-3 text-center text-xs font-black uppercase tracking-wider text-white shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Look to Cart (₹{totalLookPrice.toLocaleString('en-IN')})</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}
