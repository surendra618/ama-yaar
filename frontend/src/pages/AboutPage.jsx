import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Flame,
  Heart,
  ArrowRight,
  Zap,
  Award,
  Users,
  Shirt,
  Scissors,
  CheckCircle2,
  Package,
} from 'lucide-react';

const TEAM = [
  {
    name: 'Vansh Singh',
    role: 'Founder & Head of Design',
    image: '/model-nirvana.jpg',
    bio: 'Pioneered 240+ GSM heavyweight boxy cuts for Indian street fashion culture.',
  },
  {
    name: 'Arjun Yadav',
    role: 'Creative Director',
    image: '/model01.png',
    bio: 'Crafted our signature acid washes and vintage distressed denim treatments.',
  },
  {
    name: 'Sunil Kashyap',
    role: 'Lead Stylist',
    image: '/model03.png',
    bio: 'Curates drop shoulder lookbooks and utility 6-pocket cargo fits.',
  },
  {
    name: 'Rohan Verma',
    role: 'Art & Graphics Director',
    image: '/model04.png',
    bio: 'Illustrates high-density cyber anime prints built for zero cracking.',
  },
];

const FIT_SHOWCASE = [
  {
    id: '01',
    title: 'Ivory Zip Jacket & Utility Cargo Fit',
    category: '280 GSM OUTERWEAR',
    image: '/Ivory Jacket Streetwear Cutout (1).png',
    desc: 'Structured boxy zip-up jacket paired with 6-pocket urban utility cargos for effortless airport lookbooks.',
  },
  {
    id: '02',
    title: '240 GSM Oversized Graphic Tee',
    category: 'BOXY STREETWEAR TEE',
    image: '/model-nirvana.jpg',
    desc: 'Heavyweight bio-washed 100% combed cotton tee with reinforced double-stitched collar and drop shoulders.',
  },
  {
    id: '03',
    title: 'Handcrafted Vintage Acid Wash Top',
    category: 'VINTAGE WASH SERIES',
    image: '/cardauto.png',
    desc: 'Individually distressed and acid-washed cotton top engineered for 1-of-1 unique urban identity.',
  },
  {
    id: '04',
    title: 'Urban Utility Cargo & Drop Shoulder Fit',
    category: 'CYBER STREET EDITION',
    image: '/Stylish Streetwear Man with Backpack.png',
    desc: 'Relaxed drop-shoulder oversized streetwear fit paired with multi-pocket functional urban cargos.',
  },
];

const CRAFT_STEPS = [
  {
    step: '01',
    title: 'Heavyweight Cotton Sourcing',
    desc: 'We start with 100% combed 240+ GSM bio-washed cotton engineered for supreme thickness and shape retention.',
    icon: Shirt,
  },
  {
    step: '02',
    title: 'Handcrafted Vintage Washes',
    desc: 'Every piece undergoes specialized acid wash and vintage distressed treatments, making each item 1-of-1 unique.',
    icon: Scissors,
  },
  {
    step: '03',
    title: 'High-Density Screen Printing',
    desc: 'Our cyber anime back-prints and streetwear typography are cured using premium inks that never fade or crack.',
    icon: Zap,
  },
  {
    step: '04',
    title: 'Boxy Drop-Shoulder Tailoring',
    desc: 'Stitched with double-reinforced collar seams and relaxed drop shoulders for unmatched urban drape.',
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  const [activeFitIndex, setActiveFitIndex] = useState(0);
  const activeFit = FIT_SHOWCASE[activeFitIndex] || FIT_SHOWCASE[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 select-none">
      {/* 1. Hero Header Banner */}
      <section className="bg-black py-20 lg:py-24 text-white border-b border-neutral-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#facc15]">
            <Sparkles className="h-4 w-4" /> BORN ON THE STREETS OF INDIA • EST. 2026
          </span>
          <h1 className="mt-5 font-display text-4xl sm:text-6xl lg:text-7xl font-black italic uppercase tracking-tight text-white leading-none">
            STYLE KA LAFDA? <span className="text-[#facc15]">WE GOT YOU.</span>
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-xs sm:text-sm font-medium text-neutral-400 leading-relaxed uppercase tracking-wider">
            AMA YAAR is engineered for those who wear their individuality with pride.
            No thin cotton tees, no boring fits. Just raw, heavy, unfiltered streetwear presence.
          </p>
        </div>
      </section>

      {/* 2. Brand Story & Culture Grid (Left Text, Right Image) */}
      <section className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Narrative Column */}
          <div className="lg:col-span-7 space-y-6 pt-2 sm:pt-4 lg:pt-6">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500 block mb-2">
                OUR CULTURE &amp; MISSION
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase italic">
                WE DON'T FOLLOW TRENDS. <br />
                <span className="text-amber-500 font-black inline-block leading-none mt-1.5">
                  WE CREATE CULTURE.
                </span>
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Founded with a mission to revolutionize everyday Indian streetwear, AMA YAAR combines ultra-heavyweight fabrics (240+ GSM), handcrafted vintage acid washes, and boxy drop-shoulder cuts crafted to perfection.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Every stitch, print, and silhouette is engineered in our design lab to deliver unmatched comfort, heavy drape, and long-lasting durability — whether you're hitting campus, hanging out with friends, or making a statement on the grid.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-black px-8 py-3.5 text-xs font-black text-[#facc15] hover:bg-neutral-900 transition uppercase tracking-widest rounded-sm border border-black shadow-xs"
              >
                EXPLORE LATEST DROPS <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Editorial Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md h-[460px] sm:h-[520px] flex items-center justify-center overflow-hidden rounded-sm">
              <img
                src="/Ivory Jacket Streetwear Cutout (1).png"
                alt="AMA YAAR Culture"
                className="h-full w-full object-contain object-top rounded-sm"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80';
                }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* 3. REVERSED SECTION: LEFT IMAGE, RIGHT TEXT */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Image Column */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <div className="w-full max-w-md h-[550px] sm:h-[500px] flex items-center justify-center overflow-hidden rounded-sm">
                <img
                  src="/Stylish Streetwear Man with Backpack.png"
                  alt="AMA YAAR Fit Details"
                  className="h-full w-full object-contain object-bottom rounded-sm"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80';
                  }}
                />
              </div>
            </div>

            {/* Right Text Column */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500 block mb-2">
                  CRAFTED WITHOUT COMPROMISE
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase italic">
                  HEAVYWEIGHT DRAPE. <br />
                  <span className="text-amber-500 font-black block">
                    ZERO COLLAR DEFORMATION.
                  </span>
                </h2>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">240 to 280 GSM Premium Combed Cotton</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium mt-0.5">
                      Thick, bio-washed cotton yarn engineered for structured boxy draping that never sags after repeated washes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Signature Drop-Shoulder Silhouette</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium mt-0.5">
                      Relaxed boxy cut with lower armhole seams designed for complete movement and effortless urban presence.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Handcrafted Vintage Acid Washes</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium mt-0.5">
                      Individually treated in small artisan batches to create unique 1-of-1 distressed highlights.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-black px-8 py-3.5 text-xs font-black text-[#facc15] hover:bg-neutral-900 transition uppercase tracking-widest rounded-md border border-black shadow-xs"
                >
                  SHOP STREETWEAR COLLECTION <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE SHOWCASE: LEFT NUMBERED TEXT LIST, RIGHT DYNAMIC IMAGE */}
      <section className="py-12 sm:py-16 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500 block mb-1">
                INTERACTIVE LOOKBOOK &amp; SILHOUETTES
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                ENGINEERED FOR <span className="text-amber-500">URBAN PRESENCE</span>
              </h2>
            </div>

            <div className="max-w-md">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Click any fit number on the left to inspect
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  4 EXCLUSIVE LOOKBOOKS LIVE
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* Left Column: All Numbered Text Items */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
              {FIT_SHOWCASE.map((fit, index) => {
                const isActive = activeFitIndex === index;
                return (
                  <div
                    key={fit.id}
                    onClick={() => setActiveFitIndex(index)}
                    className={`p-5 rounded-sm cursor-pointer transition duration-300 border ${isActive
                        ? 'bg-black text-white border-black border-l-4 border-l-[#facc15] shadow-lg'
                        : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono text-base sm:text-lg font-black ${isActive ? 'text-[#facc15]' : 'text-slate-400'
                            }`}
                        >
                          #{fit.id}
                        </span>
                        <div>
                          <span className={`text-[10px] font-black uppercase tracking-wider block ${isActive ? 'text-neutral-400' : 'text-slate-500'
                            }`}>
                            {fit.category}
                          </span>
                          <h3 className={`text-sm sm:text-base font-black uppercase tracking-wide mt-0.5 ${isActive ? 'text-white' : 'text-slate-800'
                            }`}>
                            {fit.title}
                          </h3>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-black uppercase tracking-wider shrink-0 px-2.5 py-1 rounded-sm ${isActive
                            ? 'bg-[#facc15] text-black font-black'
                            : 'text-slate-400'
                          }`}
                      >
                        {isActive ? 'ACTIVE' : 'SELECT'}
                      </span>
                    </div>

                    {/* Detailed info visible when active */}
                    {isActive && (
                      <div className="mt-3.5 pt-3.5 border-t border-neutral-800 space-y-3 animate-in fade-in duration-200">
                        <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                          {fit.desc}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            AMA YAAR ORIGINAL
                          </span>
                          <Link
                            to="/products"
                            className="inline-flex items-center gap-1.5 text-xs font-black text-[#facc15] hover:text-white transition uppercase tracking-wider"
                          >
                            SHOP FIT <ArrowRight className="h-3.5 w-3.5 text-[#facc15]" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Clean Cutout Image (No Box/Card Container) */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="w-full h-[480px] sm:h-[540px] flex items-center justify-center relative">
                <img
                  key={activeFit.id}
                  src={activeFit.image}
                  alt={activeFit.title}
                  className="h-full w-full object-contain object-center transition-all duration-300 animate-in fade-in zoom-in-95"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80';
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Craftsmanship Timeline & Steps */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
            BEHIND THE DROPS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1 uppercase italic">
            OUR CRAFTSMANSHIP PROCESS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CRAFT_STEPS.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white p-6 border border-slate-200 rounded-sm shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-black text-neutral-400">{item.step} /</span>
                  <div className="h-9 w-9 bg-black text-[#facc15] flex items-center justify-center rounded-sm">
                    <IconComp className="h-4.5 w-4.5" />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Core Brand Pillars Grid */}
      <section className="bg-neutral-50 py-16 sm:py-20 border-t border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
              WHAT DRIVES US
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1 uppercase italic">
              THE AMA YAAR PROMISE
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-xs">
              <div className="h-10 w-10 bg-black text-[#facc15] flex items-center justify-center font-bold mb-4 rounded-sm">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">240+ GSM Heavy Cotton</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                Thick, premium 100% combed cotton that maintains shape and structured boxy drape wear after wear.
              </p>
            </div>

            <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-xs">
              <div className="h-10 w-10 bg-black text-[#facc15] flex items-center justify-center font-bold mb-4 rounded-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Reinforced Quality</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                Double-stitched collar seams, high-density artwork prints, and pre-shrunk bio-washed softness.
              </p>
            </div>

            <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-xs">
              <div className="h-10 w-10 bg-black text-[#facc15] flex items-center justify-center font-bold mb-4 rounded-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Signature Vintage Washes</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                Handcrafted acid wash &amp; vintage distressed treatments making every single garment 1-of-1.
              </p>
            </div>

            <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-xs">
              <div className="h-10 w-10 bg-black text-[#facc15] flex items-center justify-center font-bold mb-4 rounded-sm">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Community First</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                Built with passion by Indian streetwear creators for our nationwide squad of authentic Yaars.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Creative Squad / Team Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
            MEET THE CREATORS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1 uppercase italic">
            THE AMA YAAR SQUAD
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-xs hover:border-slate-300 transition group"
            >
              <div className="h-56 overflow-hidden relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover object-top group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80';
                  }}
                />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">{member.name}</h3>
                <p className="text-[11px] font-bold text-[#facc15] bg-black px-2 py-0.5 rounded-sm inline-block mt-1 uppercase tracking-wider">
                  {member.role}
                </p>
                <p className="mt-3 text-xs text-slate-600 leading-relaxed font-medium">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Live Metrics Counter */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200 py-6">
          <div>
            <p className="text-3xl sm:text-5xl font-black text-black italic">150+</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Unique Drops</p>
          </div>
          <div>
            <p className="text-3xl sm:text-5xl font-black text-black italic">50K+</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Satisfied Yaars</p>
          </div>
          <div>
            <p className="text-3xl sm:text-5xl font-black text-black italic">4.9★</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Average Rating</p>
          </div>
          <div>
            <p className="text-3xl sm:text-5xl font-black text-black italic">100%</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Original Cotton</p>
          </div>
        </div>
      </section>

      {/* 9. Bottom CTA Banner */}
      <section className="bg-black py-16 text-white text-center border-t border-neutral-800">
        <div className="max-w-2xl mx-auto px-4 space-y-4">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#facc15]">
            <Sparkles className="h-4 w-4" /> READY TO UPGRADE YOUR WARDROBE?
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight">
            JOIN THE YAAR SQUAD
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-medium max-w-lg mx-auto">
            Experience 240+ GSM boxy fits, vintage acid washes, and fast 24-hour dispatch across India.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#facc15] px-8 py-3.5 text-xs font-black text-black hover:bg-yellow-300 transition uppercase tracking-widest rounded-sm border border-black shadow-xs"
            >
              SHOP LATEST DROPS NOW <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
