import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  Flame,
  Check,
  Zap,
} from 'lucide-react';

const LOOKBOOK_DROPS = [
  {
    id: 'oversized',
    number: '01',
    title: 'Oversized Boxy',
    verticalTitle: 'OVERSIZED BOXY FIT',
    category: 'Topwear Series',
    tagline: 'HEAVYWEIGHT 240 GSM',
    description: 'Custom drop-shoulder cut drafted with ultra-dense combed cotton. Engineered to maintain its boxy drape all day.',
    price: '₹599',
    mrp: '₹1,199',
    discount: '50% OFF',
    image: '/model01.png',
    fallback: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    link: '/products?category=oversized-printed',
    bgText: 'OVERSIZED',
    colorAccent: '#facc15', // yellow
    specs: ['240 GSM Combed Cotton', 'Drop Shoulder Fit', 'Anti-Sag Collar'],
  },
  {
    id: 'acidwash',
    number: '02',
    title: 'Vintage Acid Wash',
    verticalTitle: 'ACID WASH SERIES',
    category: 'Limited Wash Drop',
    tagline: '1-OF-1 MINERAL DYES',
    description: 'Multi-stage mineral enzyme wash creating authentic distressed textures. Soft brushed hand-feel with vintage aesthetic.',
    price: '₹649',
    mrp: '₹1,299',
    discount: '50% OFF',
    image: '/model04.png',
    fallback: '/cardauto.png',
    link: '/products?search=acid+wash',
    bgText: 'VINTAGE',
    colorAccent: '#38bdf8', // sky blue
    specs: ['Enzyme Washed Dye', 'Brushed Texture', 'Reinforced Seams'],
  },
  {
    id: 'cargos',
    number: '03',
    title: 'Utility Cargo Fits',
    verticalTitle: '6-POCKET CARGOS',
    category: 'Bottomwear Series',
    tagline: 'BAGGY PARACHUTE CUT',
    description: 'Heavy cotton twill pants with deep multi-functional cargo pockets and relaxed wide-leg street profile.',
    price: '₹1,199',
    mrp: '₹2,399',
    discount: '50% OFF',
    image: '/boys.png',
    fallback: '/boyse.png',
    link: '/products?search=cargo',
    bgText: 'CARGOS',
    colorAccent: '#4ade80', // green
    specs: ['6 Deep Tactical Pockets', 'Wide Leg Baggy Cut', 'Durable Twill'],
  },
  {
    id: 'cyberpunk',
    number: '04',
    title: 'Cyber & Anime Art',
    verticalTitle: 'ANIME GRAPHICS',
    category: 'Graphic Drops',
    tagline: 'HIGH-DENSITY BACK PRINTS',
    description: 'Intricate back-print graphic illustrations created with high-density plastisol and DTF inks that never crack or fade.',
    price: '₹699',
    mrp: '₹1,399',
    discount: '50% OFF',
    image: '/cardaut03.png',
    fallback: '/model03.png',
    link: '/products?search=anime',
    bgText: 'GRAPHIC',
    colorAccent: '#c084fc', // purple
    specs: ['Non-Crack DTF Print', 'Original Artwork', '50+ Washes Tested'],
  },
];

const QUICK_FEATURES = [
  {
    icon: Zap,
    title: '240+ GSM HEAVYWEIGHT',
    desc: 'Dense, structured cotton that stays fresh wash after wash.',
  },
  {
    icon: Sparkles,
    title: 'ORIGINAL STREET ART',
    desc: 'Exclusive graphics illustrated for the Indian streetwear culture.',
  },
  {
    icon: ShoppingBag,
    title: 'PREPAID FREE SHIPPING',
    desc: 'Fast express delivery across all 28,000+ Indian pin codes.',
  },
  {
    icon: Flame,
    title: 'STYLE KA LAFDA',
    desc: 'Raw, unfiltered aesthetic designed for those who stand out.',
  },
];

export default function BrandDnaShowcase() {
  const [activeId, setActiveId] = useState('oversized');

  return (
    <section className="relative bg-black py-20 text-white overflow-hidden border-t border-neutral-900">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-amber-500/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              LOOKBOOK & DROP MATRIX
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              SIGNATURE <span className="text-amber-400 italic font-serif">Street Fits</span>
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Engineered silhouettes, heavyweight cotton, and raw aesthetic. Hover over each signature drop to experience the fit.
          </p>
        </div>

        {/* Expanding Accordion Carousel (Desktop & Tablet) */}
        <div className="hidden sm:flex h-[520px] w-full gap-3 overflow-hidden rounded-3xl p-1">
          {LOOKBOOK_DROPS.map((drop) => {
            const isActive = activeId === drop.id;
            return (
              <motion.div
                key={drop.id}
                onMouseEnter={() => setActiveId(drop.id)}
                onClick={() => setActiveId(drop.id)}
                layout
                transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                className={`relative flex cursor-pointer overflow-hidden rounded-2xl border transition-colors duration-300 ${
                  isActive
                    ? 'flex-[3.8] border-amber-400/60 shadow-2xl shadow-black/80'
                    : 'flex-[1] border-neutral-800 hover:border-neutral-700 bg-neutral-950'
                }`}
              >
                {/* Background high-res image */}
                <div className="absolute inset-0 h-full w-full">
                  <img
                    src={drop.image}
                    alt={drop.title}
                    className={`h-full w-full object-cover object-center transition-all duration-700 ${
                      isActive ? 'scale-105 opacity-90' : 'scale-100 opacity-40 grayscale-[40%]'
                    }`}
                    onError={(e) => {
                      e.target.src = drop.fallback;
                    }}
                  />
                  {/* Dynamic dark gradient */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      isActive
                        ? 'bg-gradient-to-t from-black via-black/40 to-black/20'
                        : 'bg-black/75'
                    }`}
                  />
                </div>

                {/* Giant faint background watermark text for active card */}
                {isActive && (
                  <div className="pointer-events-none absolute right-4 top-4 select-none text-right font-black text-white/5 text-7xl lg:text-8xl uppercase tracking-tighter leading-none">
                    {drop.bgText}
                  </div>
                )}

                {/* ACTIVE STATE CONTENT */}
                {isActive ? (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="relative z-10 flex h-full w-full flex-col justify-between p-6 lg:p-8"
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white border border-white/20">
                          {drop.number}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                          {drop.category}
                        </span>
                      </div>
                      <span className="rounded-full bg-amber-400/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/30">
                        {drop.tagline}
                      </span>
                    </div>

                    {/* Bottom Details & CTA */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white drop-shadow-md">
                          {drop.title}
                        </h3>
                        <p className="mt-2 max-w-lg text-xs lg:text-sm text-neutral-300 line-clamp-2 leading-relaxed">
                          {drop.description}
                        </p>
                      </div>

                      {/* Specs pills */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {drop.specs.map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-neutral-200 backdrop-blur-md border border-white/10"
                          >
                            ✓ {spec}
                          </span>
                        ))}
                      </div>

                      {/* Price & Shop button */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/15">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl sm:text-2xl font-black text-white">{drop.price}</span>
                          <span className="text-xs text-neutral-400 line-through">{drop.mrp}</span>
                          <span className="text-xs font-bold text-emerald-400">{drop.discount}</span>
                        </div>

                        <Link
                          to={drop.link}
                          className="group inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all duration-200 hover:bg-white hover:shadow-lg active:scale-95"
                        >
                          Shop This Fit
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* INACTIVE VERTICAL STRIP */
                  <div className="relative z-10 flex h-full w-full flex-col justify-between p-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-xs font-black text-neutral-400 border border-white/10">
                      {drop.number}
                    </span>

                    {/* Vertical rotated title */}
                    <div className="flex items-center justify-center pb-8">
                      <p
                        className="text-xs font-black uppercase tracking-widest text-neutral-300 whitespace-nowrap"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        {drop.verticalTitle}
                      </p>
                    </div>

                    <span className="text-center text-[10px] font-bold text-amber-400">
                      {drop.price}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile View (Swipeable / Stacked Cards) */}
        <div className="grid grid-cols-1 gap-4 sm:hidden">
          {LOOKBOOK_DROPS.map((drop) => (
            <div
              key={drop.id}
              className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-xl"
            >
              <div className="relative h-64 w-full overflow-hidden rounded-xl bg-neutral-900 mb-4">
                <img
                  src={drop.image}
                  alt={drop.title}
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    e.target.src = drop.fallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <span className="absolute top-3 left-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-black uppercase text-amber-400 backdrop-blur-md">
                  DROP {drop.number}
                </span>
                <span className="absolute top-3 right-3 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black uppercase text-black">
                  {drop.discount}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  {drop.tagline}
                </p>
                <h4 className="text-xl font-black uppercase text-white">{drop.title}</h4>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {drop.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-white">{drop.price}</span>
                    <span className="text-xs text-neutral-500 line-through">{drop.mrp}</span>
                  </div>
                  <Link
                    to={drop.link}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-black"
                  >
                    Shop <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Feature Pillars */}
        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4 sm:gap-6 border-t border-neutral-900 pt-10">
          {QUICK_FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 transition-all duration-300 hover:border-amber-400/40 hover:bg-neutral-900"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <h5 className="text-xs font-black uppercase tracking-wider text-white">
                  {item.title}
                </h5>
                <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
