import React from 'react';
import { Zap, Shirt, Crown, Heart, Smile, Sparkles } from 'lucide-react';

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function InstagramBanner() {
  return (
    <section className="relative overflow-hidden bg-black py-12 lg:py-16 text-white border-t border-b border-yellow-500/20">
      {/* Background Yellow Glow */}
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-yellow-500/15 blur-3xl" />

      {/* Right Diagonal Yellow Geometric Slice */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-[25%] bg-[#facc15] [clip-path:polygon(35%_0,100%_0,100%_100%,0%_100%)] hidden lg:block z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">

          {/* Left: Brand Logo & Underline Tagline */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="group flex flex-col items-center">
              <img
                src="/logo.png"
                alt="AMA YAAR"
                className="h-28 sm:h-36 w-auto object-contain transition-transform group-hover:scale-105 filter invert"
              />
            </a>
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="h-[2px] w-8 bg-[#facc15]" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#facc15]">
                STYLE KA LAFDA
              </span>
              <div className="h-[2px] w-8 bg-[#facc15]" />
            </div>
          </div>

          {/* Vertical Divider line for desktop */}
          <div className="hidden lg:block h-40 w-[2px] bg-white/20" />

          {/* Middle: Main CTA Text, Features & Button */}
          <div className="flex flex-col items-center text-center">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.3em] text-white/90">
              STAY UPDATED ON
            </span>

            {/* Outline Instagram Icon + INSTAGRAM text */}
            <div className="mt-1.5 flex items-center justify-center gap-3 sm:gap-4">
              <InstagramIcon className="h-12 w-12 sm:h-16 sm:w-16 text-[#facc15] stroke-[2.2] shrink-0" />
              <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black italic tracking-tight text-[#facc15] uppercase">
                INSTAGRAM
              </h2>
            </div>

            <span className="mt-1 text-xs sm:text-sm font-extrabold uppercase tracking-[0.3em] text-white/90">
              FOR NEW OUTFITS
            </span>

            {/* Bottom Row: Features on Left, Pill Button on Right */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
              {/* Feature: DAILY NEW STOCK */}
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black tracking-wider text-white">
                <Shirt className="h-5 w-5 text-[#facc15] fill-[#facc15]" />
                <span>DAILY NEW STOCK</span>
              </div>

              {/* Instagram Link Pill Button */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#facc15] px-6 py-2.5 text-xs sm:text-sm font-black text-black transition-all hover:bg-yellow-300 hover:scale-105 shadow-xl shadow-yellow-500/30"
              >
                <InstagramIcon className="h-4 w-4 stroke-[2.5]" />
                <span className="text-black/40 font-normal">|</span>
                <span className="tracking-wide">amayaan.in</span>
              </a>
            </div>
          </div>

          {/* Right: Phone Mockup (Instagram Profile Preview) */}
          <div className="w-full max-w-[270px] shrink-0 lg:mr-2 relative z-10">
            <div className="relative mx-auto rounded-[36px] border-[5px] border-neutral-800 bg-neutral-950 p-4 shadow-2xl ring-1 ring-white/10">
              {/* Top Notch / Time bar */}
              <div className="mb-3 flex items-center justify-between text-[10px] font-semibold text-white/60 px-2">
                <span>9:41</span>
                <div className="h-2.5 w-12 rounded-full bg-neutral-800" />
                <span>5G</span>
              </div>

              {/* Instagram App Header */}
              <div className="flex items-center justify-between pb-2 text-xs border-b border-neutral-800">
                <span className="text-white/60 font-bold text-sm cursor-pointer">&larr;</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white text-xs">amayaan.in</span>
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 text-[8px] font-bold text-white">✓</span>
                </div>
                <span className="text-white/60 font-bold text-xs">•••</span>
              </div>

              {/* Profile Main info */}
              <div className="mt-3 flex items-center justify-between gap-2">
                {/* Avatar with yellow border ring */}
                <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-black p-0.5 ring-2 ring-[#facc15]">
                  <img src="/logo.png" alt="Ama Yaar" className="h-9 w-9 object-contain filter invert" />
                </div>

                {/* Stats */}
                <div className="flex flex-1 justify-around text-center">
                  <div>
                    <p className="text-xs font-bold text-white">150</p>
                    <p className="text-[9px] text-white/50">posts</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">20.2K</p>
                    <p className="text-[9px] text-white/50">followers</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">3</p>
                    <p className="text-[9px] text-white/50">following</p>
                  </div>
                </div>
              </div>

              {/* Profile Bio */}
              <div className="mt-3 text-[10px] leading-snug space-y-0.5">
                <p className="font-bold text-white text-xs">Ama Yaar</p>
                <p className="text-white/90">Style Ka Lafda? 😎🔥</p>
                <p className="text-white/80">Fits jo bole — "Bhai, kya pehna hai!" 👕👖</p>
                <p className="text-white/80">Menswear for every vibe</p>
                <p className="text-white/80 font-medium text-[9px]">No Boring Fits Allowed 🚫😎</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex items-center gap-2">
                <button className="flex-1 rounded-lg bg-[#facc15] py-1 text-center text-xs font-bold text-black hover:bg-yellow-400 transition">
                  Follow
                </button>
                <button className="flex-1 rounded-lg bg-neutral-800 py-1 text-center text-xs font-semibold text-white hover:bg-neutral-700 transition">
                  Message
                </button>
              </div>

              {/* Highlights Row */}
              <div className="mt-3 flex items-center justify-between gap-1 overflow-x-auto text-[8px] text-white/70">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-yellow-400">
                    <Crown className="h-3.5 w-3.5" />
                  </div>
                  <span className="scale-90 text-[7px]">NEW DROPS</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-yellow-400">
                    <Shirt className="h-3.5 w-3.5" />
                  </div>
                  <span className="scale-90 text-[7px]">FITS CHECK</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-yellow-400">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="scale-90 text-[7px]">STORE VIBES</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-yellow-400">
                    <Smile className="h-3.5 w-3.5" />
                  </div>
                  <span className="scale-90 text-[7px]">YOU ❤</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
