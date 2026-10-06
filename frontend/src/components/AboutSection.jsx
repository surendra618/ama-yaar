import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Flame, Zap } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="w-full bg-white text-black py-16 lg:py-20 border-t border-b border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Tagline & Title */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#facc15]">
            <Sparkles className="h-4 w-4" /> ABOUT AMA YAAR
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl lg:text-6xl font-black italic tracking-tight text-black uppercase leading-tight">
            CRAFTED FOR THE <span className="underline decoration-[#facc15] underline-offset-8">UNFILTERED &amp; BOLD</span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-2xl">
            At AMA YAAR, streetwear is more than just clothes — it's an attitude. We craft high-density, heavyweight 240+ GSM oversized fits with signature hand-washed vintage treatments designed for pure urban presence.
          </p>
        </div>

        {/* 2-Column Grid Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Brand Showcase & Narrative */}
          <div className="lg:col-span-6 bg-neutral-950 text-white p-8 sm:p-10 border border-neutral-800">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#facc15]">
              OUR PHILOSOPHY • STYLE KA LAFDA
            </span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-black italic uppercase text-white leading-snug">
              Heavyweight Fabrics. No Boring Fits Allowed.
            </h3>
            <p className="mt-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Every drop from our design lab is engineered with 100% combed cotton, reinforced double-stitched collar seams, and boxy drop-shoulder cuts that hold their structure wash after wash.
            </p>

            <div className="mt-6 pt-6 border-t border-neutral-800 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#facc15]">240+ GSM</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">Heavy Cotton</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#facc15]">50K+ YAARS</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">Satisfied Across India</p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-[#facc15] px-6 py-3 text-xs font-black text-black hover:bg-yellow-300 transition uppercase tracking-wider"
              >
                Read Full Brand Story <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right: 4 Minimalist Feature Blocks */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-50 p-5 border border-neutral-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black text-neutral-400">01 /</span>
                <Flame className="h-4 w-4 text-neutral-900" />
              </div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Heavyweight Drops</h4>
              <p className="mt-1.5 text-[11.5px] text-neutral-600 leading-relaxed">
                240 to 280 GSM thick cotton boxy fits engineered for structured draping.
              </p>
            </div>

            <div className="bg-neutral-50 p-5 border border-neutral-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black text-neutral-400">02 /</span>
                <Sparkles className="h-4 w-4 text-neutral-900" />
              </div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Handcrafted Washes</h4>
              <p className="mt-1.5 text-[11.5px] text-neutral-600 leading-relaxed">
                Signature acid wash and vintage distressed treatments making every tee unique.
              </p>
            </div>

            <div className="bg-neutral-50 p-5 border border-neutral-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black text-neutral-400">03 /</span>
                <Shield className="h-4 w-4 text-neutral-900" />
              </div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">High Density Art</h4>
              <p className="mt-1.5 text-[11.5px] text-neutral-600 leading-relaxed">
                Screen-printed cyber anime and street artwork built for zero cracking.
              </p>
            </div>

            <div className="bg-neutral-50 p-5 border border-neutral-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black text-neutral-400">04 /</span>
                <Zap className="h-4 w-4 text-neutral-900" />
              </div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Fast Dispatch</h4>
              <p className="mt-1.5 text-[11.5px] text-neutral-600 leading-relaxed">
                All orders processed and shipped within 24 hours with live tracking.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
