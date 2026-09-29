import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const COMBO_LOOKS = [
  {
    id: 'look-1',
    number: '01',
    title: 'Vintage Acid Wash Fit',
    topName: 'Acid Wash Oversized Tee',
    botName: '6-Pocket Utility Cargos',
    price: 1649,
    mrp: 3698,
    image: '/sectionbanner2.png',
    fallback: '/model01.png',
    imgPosition: 'object-[35%_center]',
    tag: 'MOST WANTED',
    topIdx: 0,
    botIdx: 0,
  },
  {
    id: 'look-2',
    number: '02',
    title: 'Cyber Skater Drip',
    topName: 'Heavy Boxy Cyber Graphic',
    botName: 'Vintage Acid Wash Denim',
    price: 1799,
    mrp: 3998,
    image: '/sectionbanner3.png',
    fallback: '/cardaut2.png',
    imgPosition: 'object-top',
    tag: 'HOT DROP',
    topIdx: 1,
    botIdx: 1,
  },
  {
    id: 'look-3',
    number: '03',
    title: 'Tactical Zipper Polo',
    topName: 'Textured Zipper Polo',
    botName: 'Relaxed Parachute Pants',
    price: 1649,
    mrp: 3698,
    image: '/sectionbanner.png',
    fallback: '/model03.png',
    imgPosition: 'object-[20%_center]',
    tag: 'BESTSELLER',
    topIdx: 2,
    botIdx: 2,
  },
];

const TOPWEAR_OPTIONS = [
  {
    id: 'top-1',
    name: 'Acid Wash Oversized Tee',
    price: 649,
    mrp: 1299,
    tag: '280 GSM',
    image: '/model01.png',
    colorName: 'Vintage Charcoal',
  },
  {
    id: 'top-2',
    name: 'Heavy Boxy Cyber Graphic',
    price: 699,
    mrp: 1399,
    tag: 'DTF ART',
    image: '/cardaut2.png',
    colorName: 'Obsidian Black',
  },
  {
    id: 'top-3',
    name: 'Textured Zipper Polo',
    price: 749,
    mrp: 1499,
    tag: 'KNIT SOFT',
    image: '/model03.png',
    colorName: 'Sand Beige',
  },
];

const BOTTOMWEAR_OPTIONS = [
  {
    id: 'bot-1',
    name: '6-Pocket Utility Cargos',
    price: 1199,
    mrp: 2399,
    tag: 'BAGGY TWILL',
    image: '/side2.png',
    colorName: 'Stealth Black',
  },
  {
    id: 'bot-2',
    name: 'Vintage Acid Wash Denim',
    price: 1299,
    mrp: 2599,
    tag: '90S SKATER',
    image: '/side2 (2).png',
    colorName: 'Washed Indigo',
  },
  {
    id: 'bot-3',
    name: 'Relaxed Parachute Pants',
    price: 1099,
    mrp: 2199,
    tag: 'LIGHTWEIGHT',
    image: '/side.png',
    colorName: 'Graphite Grey',
  },
];

export default function StyleLabShowcase() {
  const navigate = useNavigate();
  const [currentLookIdx, setCurrentLookIdx] = useState(0);
  const [selectedTop, setSelectedTop] = useState(TOPWEAR_OPTIONS[0]);
  const [selectedBottom, setSelectedBottom] = useState(BOTTOMWEAR_OPTIONS[0]);
  const [slideDirection, setSlideDirection] = useState(1);

  const currentLook = COMBO_LOOKS[currentLookIdx];
  const totalSavings = currentLook.mrp - currentLook.price;

  // Auto slide automatically every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideDirection(1);
      setCurrentLookIdx((prevIdx) => {
        const nextIdx = (prevIdx + 1) % COMBO_LOOKS.length;
        setSelectedTop(TOPWEAR_OPTIONS[COMBO_LOOKS[nextIdx].topIdx]);
        setSelectedBottom(BOTTOMWEAR_OPTIONS[COMBO_LOOKS[nextIdx].botIdx]);
        return nextIdx;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => {
    setSlideDirection(1);
    const nextIdx = (currentLookIdx + 1) % COMBO_LOOKS.length;
    setCurrentLookIdx(nextIdx);
    setSelectedTop(TOPWEAR_OPTIONS[COMBO_LOOKS[nextIdx].topIdx]);
    setSelectedBottom(BOTTOMWEAR_OPTIONS[COMBO_LOOKS[nextIdx].botIdx]);
  };

  const handlePrevSlide = () => {
    setSlideDirection(-1);
    const prevIdx = (currentLookIdx - 1 + COMBO_LOOKS.length) % COMBO_LOOKS.length;
    setCurrentLookIdx(prevIdx);
    setSelectedTop(TOPWEAR_OPTIONS[COMBO_LOOKS[prevIdx].topIdx]);
    setSelectedBottom(BOTTOMWEAR_OPTIONS[COMBO_LOOKS[prevIdx].botIdx]);
  };

  const handleSelectTop = (item, idx) => {
    setSelectedTop(item);
    if (COMBO_LOOKS[idx]) {
      setSlideDirection(1);
      setCurrentLookIdx(idx);
    }
  };

  const handleSelectBottom = (item, idx) => {
    setSelectedBottom(item);
    if (COMBO_LOOKS[idx]) {
      setSlideDirection(1);
      setCurrentLookIdx(idx);
    }
  };

  const handleBuyCombo = () => {
    navigate(`/products?search=${encodeURIComponent(currentLook.topName)}`);
  };

  return (
    <section className="bg-white py-16 text-black border-y border-neutral-200 w-full">
      <div className="mx-auto w-full max-w-[1550px] px-3 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="mb-2 text-[11px] sm:text-xs font-black uppercase tracking-widest text-neutral-800">
              INTERACTIVE STREETWEAR LAB
            </p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-tight">
              BUILD YOUR <span className="text-amber-500 italic font-serif">Signature Fit</span>
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
            Slide through curated complete lookbooks. Unlock flat ₹200 extra savings on paired combo fits with free priority delivery.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

          {/* LEFT: FULL-SCREEN SINGLE MODEL IMAGE SLIDER (6 cols) */}
          <div className="lg:col-span-6 relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-900 min-h-[540px] sm:min-h-[620px] flex flex-col justify-end p-6 sm:p-8 shadow-sm">

            {/* Sliding Full-Bleed Background Model Image */}
            <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
              <AnimatePresence mode="wait" custom={slideDirection}>
                <motion.div
                  key={currentLook.id}
                  initial={{ opacity: 0, x: slideDirection > 0 ? 60 : -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: slideDirection > 0 ? -60 : 60 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="relative h-full w-full"
                >
                  <img
                    src={currentLook.image}
                    alt={currentLook.title}
                    className={`h-full w-full object-cover ${currentLook.imgPosition || 'object-center'}`}
                    onError={(e) => {
                      e.target.src = currentLook.fallback;
                    }}
                  />
                  {/* Subtle Bottom Gradient for Text Legibility (Keeps top/middle bright & clear) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 via-40% to-transparent pointer-events-none" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slider Arrow Buttons (Left & Right Middle / Centered Vertically) */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/25 bg-black/70 text-white hover:bg-amber-400 hover:text-black hover:border-amber-400 transition-all duration-200 cursor-pointer backdrop-blur-md active:scale-90 shadow-lg"
              aria-label="Previous combo look"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/25 bg-black/70 text-white hover:bg-amber-400 hover:text-black hover:border-amber-400 transition-all duration-200 cursor-pointer backdrop-blur-md active:scale-90 shadow-lg"
              aria-label="Next combo look"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* BOTTOM DETAILS (Text Only, No Price or Button) */}
            <div className="relative z-10 pt-24 text-white drop-shadow-md">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 drop-shadow">
                {currentLook.topName} + {currentLook.botName}
              </p>
              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight mt-1 drop-shadow-lg">
                {currentLook.title}
              </h3>
            </div>
          </div>

          {/* RIGHT: SELECTORS (6 cols - Clean Open Layout) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-7">

            {/* Step 1: Select Topwear */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-black text-white">
                    1
                  </span>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                    Topwear Pieces
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-neutral-600">{selectedTop.colorName}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-5 pt-1">
                {TOPWEAR_OPTIONS.map((item, idx) => {
                  const isSelected = selectedTop.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectTop(item, idx)}
                      className="group cursor-pointer flex flex-col items-center p-1 pb-2 transition-all duration-200"
                    >
                      {/* Arched Top, Flat Bottom Window Image Container */}
                      <div className={`relative aspect-[3/4] overflow-hidden rounded-t-[48px] rounded-b-none bg-neutral-100 mb-2 w-full transition-all duration-200 border ${isSelected
                        ? 'border-neutral-800 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-400'
                        }`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-top"
                        />
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-2.5 py-0.5 text-[9px] font-black tracking-wider text-amber-400 backdrop-blur-sm whitespace-nowrap">
                          {item.tag}
                        </span>
                      </div>

                      {/* Product Title Only */}
                      <p className={`text-xs text-center truncate w-full px-0.5 mt-0.5 transition-colors duration-200 ${isSelected ? 'font-black text-black' : 'font-medium text-neutral-600 group-hover:text-black'
                        }`}>
                        {item.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Bottomwear */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-black text-white">
                    2
                  </span>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                    Bottomwear Pieces
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-neutral-600">{selectedBottom.colorName}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-5 pt-1">
                {BOTTOMWEAR_OPTIONS.map((item, idx) => {
                  const isSelected = selectedBottom.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectBottom(item, idx)}
                      className="group cursor-pointer flex flex-col items-center p-1 pb-2 transition-all duration-200"
                    >
                      {/* Arched Top, Flat Bottom Window Image Container */}
                      <div className={`relative aspect-[3/4] overflow-hidden rounded-t-[48px] rounded-b-none bg-neutral-100 mb-2 w-full transition-all duration-200 border ${isSelected
                        ? 'border-neutral-800 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-400'
                        }`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-top"
                        />
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-2.5 py-0.5 text-[9px] font-black tracking-wider text-amber-400 backdrop-blur-sm whitespace-nowrap">
                          {item.tag}
                        </span>
                      </div>

                      {/* Product Title Only */}
                      <p className={`text-xs text-center truncate w-full px-0.5 mt-0.5 transition-colors duration-200 ${isSelected ? 'font-black text-black' : 'font-medium text-neutral-600 group-hover:text-black'
                        }`}>
                        {item.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
