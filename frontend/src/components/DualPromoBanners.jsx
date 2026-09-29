import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const BANNER_PAIRS = [
  [
    {
      id: 'b1',
      brand: 'AMA YAAR',
      brandTag: 'EXCLUSIVE',
      saleBadge: {
        line1: 'THE BIG',
        line2: 'DROP DAYS',
        sub: 'Starts Today',
        sub2: 'Early Access Live',
      },
      title: 'Acid Wash Pro V2',
      subtitle: 'Launch today, 12 PM',
      specs: '280 GSM Heavyweight | 100% Combed Cotton',
      accentText: '280 GSM',
      image: '/model04.png',
      fallback: '/cardauto.png',
      link: '/products?search=acid+wash',
      theme: 'light',
      bgGradient: 'bg-gradient-to-r from-[#eef2f6] via-[#e2e8f0] to-[#c7d2fe]',
      textColor: 'text-black',
      banks: [
        { name: 'UPI PAY', offer: 'Extra ₹150 Off' },
        { name: 'PREPAID', offer: '10% Instant Discount*' },
      ],
    },
    {
      id: 'b2',
      brand: 'AMA YAAR',
      brandTag: 'STREET MATRIX',
      saleBadge: {
        line1: 'LIMITED',
        line2: 'SUMMER DROP',
        sub: 'Starts Today',
        sub2: 'Only 500 Pcs',
      },
      title: 'Oversized Cyber 5G',
      subtitle: 'Launch today',
      specs: 'Drop Shoulder Cut | Anti-Shrink Rib Collar',
      accentText: '100% COTTON',
      image: '/model01.png',
      fallback: '/cardaut2.png',
      link: '/products?category=oversized-printed',
      theme: 'dark',
      bgGradient: 'bg-gradient-to-r from-[#18181b] via-[#27272a] to-[#3f3f46]',
      textColor: 'text-white',
      banks: [
        { name: 'AXIS / ICICI', offer: '10% Savings' },
        { name: 'CODE: YAAR50', offer: 'Flat 50% Off' },
      ],
    },
  ],
  [
    {
      id: 'b3',
      brand: 'AMA YAAR',
      brandTag: 'UTILITY GEAR',
      saleBadge: {
        line1: 'MEGA',
        line2: 'RESTOCK DROP',
        sub: 'Live Now',
        sub2: 'Fast Shipping',
      },
      title: '6-Pocket Cargo Max',
      subtitle: 'Restocked today, 12 PM',
      specs: 'Heavy Cotton Twill | Parachute Baggy Fit',
      accentText: '6-POCKET',
      image: '/boys.png',
      fallback: '/boyse.png',
      link: '/products?search=cargo',
      theme: 'dark',
      bgGradient: 'bg-gradient-to-r from-[#1c1917] via-[#292524] to-[#44403c]',
      textColor: 'text-white',
      banks: [
        { name: 'PREPAID', offer: 'Free Shipping Across India' },
        { name: 'BUY 2 SAVE', offer: 'Flat ₹300 Off' },
      ],
    },
    {
      id: 'b4',
      brand: 'AMA YAAR',
      brandTag: 'LUXURY ESSENTIALS',
      saleBadge: {
        line1: 'TOP',
        line2: 'RATED 4.9★',
        sub: 'Bestseller',
        sub2: '10,000+ Yaars',
      },
      title: 'Vintage Zipper Polos',
      subtitle: 'Launch today',
      specs: 'Anti-Pilling Knit | All-Day Breathable Soft',
      accentText: 'PREMIUM',
      image: '/model03.png',
      fallback: '/side.png',
      link: '/products?category=polo-t-shirt',
      theme: 'light',
      bgGradient: 'bg-gradient-to-r from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]',
      textColor: 'text-black',
      banks: [
        { name: 'COMBO OFFER', offer: '2 Polos at ₹1,199' },
        { name: '7-DAY RETURN', offer: 'Easy Exchanges' },
      ],
    },
  ],
];

export default function DualPromoBanners() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_PAIRS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activePair = BANNER_PAIRS[currentSlide];

  return (
    <section
      className="bg-white py-8 px-4 sm:px-6 lg:px-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              {activePair.map((b) => {
                const isDark = b.theme === 'dark';

                return (
                  <Link
                    key={b.id}
                    to={b.link}
                    className={`group relative overflow-hidden rounded-3xl ${b.bgGradient} p-5 sm:p-6 transition-transform duration-200 hover:scale-[1.008] border ${
                      isDark ? 'border-neutral-800' : 'border-neutral-200'
                    } min-h-[260px] sm:min-h-[290px] flex flex-col justify-between`}
                  >
                    {/* Background Product Model on Right (Seamless blend) */}
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-[48%] sm:w-[44%] z-0 flex items-center justify-end overflow-hidden">
                      <img
                        src={b.image}
                        alt={b.title}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = b.fallback;
                        }}
                      />
                      {/* Gradient Mask to smoothly blend left edge into background */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${
                          isDark
                            ? 'from-[#18181b] via-transparent to-transparent'
                            : 'from-[#eef2f6] via-transparent to-transparent'
                        }`}
                      />
                    </div>

                    {/* TOP ROW: Brand on Left, Event Seal on Right */}
                    <div className="relative z-10 flex items-start justify-between">
                      {/* Brand Header */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm sm:text-base font-black tracking-wider uppercase ${
                            isDark ? 'text-white' : 'text-black'
                          }`}
                        >
                          {b.brand}
                        </span>
                        <span className="text-neutral-400 font-normal">|</span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider rounded px-1.5 py-0.5 ${
                            isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
                          }`}
                        >
                          {b.brandTag}
                        </span>
                      </div>

                      {/* Event Ribbon Badge (Flipkart / Big Billion Days Style) */}
                      <div className="flex flex-col items-center">
                        <div className="rounded-xl bg-[#facc15] px-2.5 py-1 text-center border border-amber-300">
                          <p className="text-[9px] font-black uppercase text-black leading-tight">
                            {b.saleBadge.line1}
                          </p>
                          <p className="text-[10px] font-black uppercase text-blue-900 leading-tight">
                            {b.saleBadge.line2}
                          </p>
                        </div>
                        <div className="mt-1 rounded bg-[#fef08a] px-1.5 py-0.5 text-[8px] font-bold text-black border border-amber-300 text-center">
                          <span className="block font-black">{b.saleBadge.sub}</span>
                          <span className="block text-[7px] text-neutral-700">{b.saleBadge.sub2}</span>
                        </div>
                      </div>
                    </div>

                    {/* MIDDLE SECTION: Large Bold Typography */}
                    <div className="relative z-10 my-3 max-w-[60%] sm:max-w-[58%]">
                      <h3
                        className={`text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight leading-none ${
                          isDark ? 'text-white' : 'text-black'
                        }`}
                      >
                        {b.title}
                      </h3>
                      <p
                        className={`mt-1.5 text-xs sm:text-sm font-bold ${
                          isDark ? 'text-neutral-200' : 'text-neutral-900'
                        }`}
                      >
                        {b.subtitle}
                      </p>
                      <p
                        className={`mt-1 text-[11px] sm:text-xs font-medium line-clamp-1 ${
                          isDark ? 'text-neutral-300' : 'text-neutral-600'
                        }`}
                      >
                        {b.specs}
                      </p>

                      {/* Giant Clean Accent Watermark */}
                      <p
                        className={`mt-2 font-black italic text-lg sm:text-2xl tracking-tighter ${
                          isDark ? 'text-amber-400/90' : 'text-neutral-800/90'
                        }`}
                      >
                        {b.accentText}
                      </p>
                    </div>

                    {/* BOTTOM ROW: Bank / Offer Strip + AD Tag */}
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-black/10 pt-2.5">
                      {/* Bank / Offer Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {b.banks.map((bank, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold ${
                              isDark
                                ? 'bg-black/60 text-white border border-white/10'
                                : 'bg-white text-black border border-neutral-300'
                            }`}
                          >
                            <span className="rounded bg-amber-400 px-1 py-0.2 text-[8px] font-black text-black">
                              {bank.name}
                            </span>
                            <span>{bank.offer}</span>
                          </div>
                        ))}
                      </div>

                      {/* Small Flat AD Label */}
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider rounded px-1.5 py-0.5 ${
                          isDark ? 'bg-white/10 text-white/50' : 'bg-black/10 text-black/50'
                        }`}
                      >
                        AD
                      </span>
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
