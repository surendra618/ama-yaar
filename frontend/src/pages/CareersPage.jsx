import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Briefcase,
  Zap,
  Heart,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Building2,
  Flame,
  X,
  Award,
  Send,
} from 'lucide-react';

const PERKS = [
  {
    icon: Zap,
    title: 'Creative Autonomy',
    desc: 'Zero corporate bureaucracy. Pitch bold streetwear concepts and watch them launch to thousands of customers nationwide.',
  },
  {
    icon: Flame,
    title: 'Unlimited Free Apparel',
    desc: 'Get exclusive first access to every drop, custom team colorways, staff discounts, and free apparel allowance.',
  },
  {
    icon: Rocket,
    title: 'Rapid Career Scaling',
    desc: 'Work directly alongside founders and leaders building one of India’s fastest-growing heavyweight apparel brands.',
  },
  {
    icon: Award,
    title: 'Competitive Pay & Bonuses',
    desc: 'Top-tier salaries, performance ROAS bonuses, health insurance coverage, and wellness allowances.',
  },
  {
    icon: Building2,
    title: 'Modern Delhi Studio & Lab',
    desc: 'Work out of our sleek Delhi HQ featuring high-speed editing bays, photo studios, and a relaxed lounge workspace.',
  },
  {
    icon: Heart,
    title: 'Flexible Hybrid Schedules',
    desc: 'We value speed and tangible output over clocking hours. Enjoy flexible hybrid work arrangements and creative autonomy.',
  },
];

export default function CareersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleInterest: 'Streetwear Fashion Designer',
    portfolio: '',
    experience: '1-3 Years',
    whyUs: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setApplied(true);
  };

  const scrollToApply = () => {
    const el = document.getElementById('open-positions');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#facc15] selection:text-black">
      {/* 1. HERO SECTION - Dark Luxe Accent */}
      <section className="bg-slate-950 text-white pt-6 sm:pt-8 pb-12 sm:pb-16 relative overflow-hidden border-b border-black">
        {/* Subtle Background Mesh Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-3.5 -mt-2 sm:-mt-4">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-[#facc15] mb-2">
                  <Rocket className="h-3.5 w-3.5 text-[#facc15]" /> WE ARE HIRING YAARS
                </span>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[1.05] mt-1 font-['Outfit']">
                  BUILD THE FUTURE OF <span className="text-[#facc15]">STREETWEAR</span>
                </h1>
              </div>

              <p className="text-sm sm:text-base text-neutral-300 font-medium leading-relaxed max-w-2xl">
                Join a high-octane team of fashion designers, content creators, and growth hackers building India’s rawest heavyweight apparel movement. We value speed, unfiltered passion, and relentless execution.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={scrollToApply}
                  className="bg-[#facc15] text-black px-8 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-yellow-400 transition flex items-center gap-2 rounded-full border border-[#facc15]"
                >
                  EXPLORE OPEN ROLES <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#culture"
                  className="bg-neutral-900 text-white border border-neutral-800 px-8 py-4 text-xs font-black uppercase tracking-widest hover:border-neutral-700 transition rounded-full"
                >
                  OUR CULTURE
                </a>
              </div>
            </div>

            {/* Right Visual Cutout Showcase - NO BOX CONTAINER */}
            <div className="lg:col-span-5 relative hidden lg:flex items-center justify-center">
              <div className="relative w-full flex justify-center items-center">
                <img
                  src="/cardaut03.png"
                  alt="AMA YAAR Streetwear Model Cutout"
                  className="h-[460px] xl:h-[500px] w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] filter contrast-110 hover:scale-105 transition duration-500 pointer-events-none"
                />
                <span className="absolute top-2 right-0 bg-black/90 text-[#facc15] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest border border-neutral-800">
                  DROP 2026 / CREATIVE LAB
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="bg-neutral-900 text-white border-b border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="border-r border-neutral-800 last:border-r-0">
              <span className="text-3xl font-black text-[#facc15] uppercase italic block">100K+</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">YAAR COMMUNITY</span>
            </div>
            <div className="border-r border-neutral-800 last:border-r-0">
              <span className="text-3xl font-black text-[#facc15] uppercase italic block">240+ GSM</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">HEAVYWEIGHT BENCHMARK</span>
            </div>
            <div className="border-r border-neutral-800 last:border-r-0">
              <span className="text-3xl font-black text-[#facc15] uppercase italic block">100%</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">CREATIVE FREEDOM</span>
            </div>
            <div>
              <span className="text-3xl font-black text-[#facc15] uppercase italic block">3X</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">YEAR-ON-YEAR GROWTH</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CULTURE & PERKS SECTION */}
      <section id="culture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 sm:pb-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 font-['Outfit']">
            PERKS &amp; CULTURE AT AMA YAAR
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
            We don't do boring corporate cubicles or endless approval layers. We build fast, break conventions, and reward exceptional talent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PERKS.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-neutral-200 p-8 hover:border-neutral-300 transition duration-300 group flex flex-col justify-between rounded-md"
              >
                <div>
                  <div className="h-12 w-12 bg-black text-[#facc15] flex items-center justify-center font-bold mb-6 rounded-md group-hover:scale-105 transition">
                    <Icon className="h-6 w-6 text-[#facc15]" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide group-hover:text-black transition font-['Outfit']">
                    {perk.title}
                  </h3>
                  <p className="mt-3 text-xs text-neutral-600 font-medium leading-relaxed">
                    {perk.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-black transition">
                  <span>PILLAR 0{idx + 1}</span>
                  <span>AMA YAAR HQ</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SINGLE MASTER APPLICATION CARD SECTION */}
      <section id="open-positions" className="bg-white pt-6 sm:pt-8 pb-12 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-900">
              <Briefcase className="h-3.5 w-3.5 text-slate-900" /> JOIN THE CREW
            </span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 font-['Outfit']">
              OPEN ROLES &amp; APPLICATIONS
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600 font-medium max-w-xl mx-auto">
              Designers • Video &amp; Reel Creators • Operations &amp; Supply Chain • Performance Marketing
            </p>
          </div>

          {/* ONE SINGLE CLEAN MASTER CARD */}
          <div className="bg-white border border-neutral-200 p-8 sm:p-12 transition duration-300 flex flex-col md:flex-row items-center justify-between gap-8 rounded-none shadow-sm hover:border-neutral-300">
            <div className="space-y-4 text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span className="bg-black text-[#facc15] px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-none">
                  CREATIVE &amp; GROWTH CREW
                </span>
                <span className="bg-neutral-100 text-slate-800 border border-neutral-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-none">
                  FULL-TIME &amp; HYBRID
                </span>
                <span className="bg-neutral-100 text-neutral-600 border border-neutral-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-none">
                  NEW DELHI HQ
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-wide font-['Outfit']">
                APPLY TO JOIN THE AMA YAAR SQUAD
              </h3>

              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-2xl">
                We are actively hiring fashion designers, video creators, e-commerce specialists, and marketers. Submit your application and portfolio directly to get reviewed by our founders.
              </p>

              <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold text-neutral-500 pt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-black" /> New Delhi HQ / Remote
                </span>
                <span>•</span>
                <span className="text-black font-extrabold">Fast Response Within 5 Days</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsModalOpen(true);
                setApplied(false);
              }}
              className="inline-flex items-center justify-center gap-2 bg-black text-[#facc15] px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition shrink-0 rounded-full border border-black shadow-md"
            >
              APPLY NOW <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM TALENT CALLOUT BANNER */}
      <section className="bg-slate-950 text-white py-16 sm:py-20 border-t border-b border-black relative overflow-hidden">
        {/* Background Subtle Accent Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#facc15] mb-4">
            <Flame className="h-3.5 w-3.5 text-[#facc15]" /> OPEN CALL FOR TALENT
          </span>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-['Outfit']">
            DON'T SEE YOUR EXACT ROLE LISTED?
          </h2>

          <p className="mt-4 text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed max-w-2xl mx-auto">
            We are always hunting for visionaries — fashion stylists, video creators, pattern makers, copywriters, and supply chain hustlers. If you are passionate about streetwear, drop us a line.
          </p>

          <div className="mt-8">
            <a
              href="mailto:careers@amayaar.com"
              className="inline-flex items-center gap-2 bg-[#facc15] text-black px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-yellow-400 transition rounded-full border border-[#facc15]"
            >
              SEND DIRECT PORTFOLIO TO CAREERS@AMAYAAR.COM <Send className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 6. APPLICATION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white max-w-xl w-full p-6 sm:p-8 relative border border-slate-300 rounded-none shadow-2xl my-8"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-black p-1 transition"
              >
                <X className="h-6 w-6" />
              </button>

              {applied ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600 mb-4" />
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 mb-2">
                    APPLICATION RECEIVED
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 uppercase font-['Outfit']">YOUR APPLICATION HAS BEEN SUBMITTED!</h3>
                  <p className="mt-3 text-xs text-neutral-600 font-medium leading-relaxed max-w-md mx-auto">
                    We've received your application. Our hiring team reviews submissions weekly and will reach out if your profile matches our drop requirements.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="mt-8 bg-black text-[#facc15] px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition rounded-none"
                  >
                    RETURN TO CAREERS
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-6 pb-4 border-b border-neutral-200">
                    <span className="bg-black text-[#facc15] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest inline-block mb-1.5">
                      JOIN THE SQUAD
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase leading-tight font-['Outfit']">
                      SUBMIT YOUR APPLICATION
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium mt-1">
                      New Delhi HQ • Hybrid &amp; Remote Roles
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-900 mb-1">
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rohan Sharma"
                        className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-neutral-400 focus:outline-none focus:border-black focus:bg-white rounded-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-900 mb-1">
                          EMAIL ADDRESS *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="rohan@gmail.com"
                          className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-neutral-400 focus:outline-none focus:border-black focus:bg-white rounded-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-900 mb-1">
                          PHONE NUMBER *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-neutral-400 focus:outline-none focus:border-black focus:bg-white rounded-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-900 mb-1">
                          ROLE / DEPARTMENT INTEREST *
                        </label>
                        <select
                          value={formData.roleInterest}
                          onChange={(e) => setFormData({ ...formData, roleInterest: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-black focus:bg-white rounded-none"
                        >
                          <option>Streetwear Fashion Designer</option>
                          <option>Video Creator &amp; Reel Director</option>
                          <option>E-Commerce Operations</option>
                          <option>Performance Marketing Manager</option>
                          <option>3D Render &amp; Graphic Artist</option>
                          <option>Customer Experience &amp; Community</option>
                          <option>Other / Open Role</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-900 mb-1">
                          PORTFOLIO / LINKEDIN LINK *
                        </label>
                        <input
                          type="url"
                          required
                          value={formData.portfolio}
                          onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                          placeholder="https://behance.net/rohan or Drive link"
                          className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-neutral-400 focus:outline-none focus:border-black focus:bg-white rounded-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-900 mb-1">
                        WHY DO YOU WANT TO JOIN AMA YAAR? *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formData.whyUs}
                        onChange={(e) => setFormData({ ...formData, whyUs: e.target.value })}
                        placeholder="Tell us about your background, passion for streetwear, and what you bring to the squad..."
                        className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-neutral-400 focus:outline-none focus:border-black focus:bg-white rounded-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-black text-[#facc15] py-3.5 text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition rounded-none border border-black mt-2"
                    >
                      SUBMIT APPLICATION NOW
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
