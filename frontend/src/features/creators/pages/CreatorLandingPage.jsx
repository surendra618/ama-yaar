import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Share2,
  Wallet,
  TrendingUp,
  Percent,
  Flame,
  CheckCircle2,
  Sliders,
  Crown,
  ChevronRight,
  HelpCircle,
  Zap,
} from 'lucide-react';

export default function CreatorLandingPage() {
  const [ordersReferred, setOrdersReferred] = useState(60);

  // Dynamic calculations based on ₹1,900 AOV & 10% commission
  const avgOrderValue = 1900;
  const estimatedSales = ordersReferred * avgOrderValue;
  const estimatedEarnings = Math.round(estimatedSales * 0.10);

  const getTier = (orders) => {
    if (orders >= 200) return { name: 'Elite Icon', badge: 'VIP Drop Access + 12% Custom Rate', color: 'from-amber-400 to-amber-600' };
    if (orders >= 100) return { name: 'Streetwear Pro', badge: 'Free Wardrobe PR Box', color: 'from-purple-400 to-indigo-500' };
    if (orders >= 50) return { name: 'Active Stylist', badge: '10% Commission + Studio Priority', color: 'from-emerald-400 to-teal-500' };
    return { name: 'Rising Creator', badge: '10% Commission + Deep Links', color: 'from-neutral-400 to-neutral-200' };
  };

  const currentTier = getTier(ordersReferred);

  const FAQS = [
    {
      q: 'Who can join the Amayaar Creator Program?',
      a: 'We welcome influencers, fashion creators, streetwear enthusiasts, and UGC stylists. Whether you have 1,000 or 100,000 followers, if you produce authentic streetwear content, we want to collaborate with you.',
    },
    {
      q: 'How much commission will I earn?',
      a: 'Approved creators start with a standard 10% commission on all eligible net merchandise sales driven via their unique link or custom discount code.',
    },
    {
      q: 'How do tracking links and cookies work?',
      a: 'When a customer clicks your link, a 30-day tracking cookie is attached. Any order completed within that 30-day window is attributed to your account on a last-click model.',
    },
    {
      q: 'When and how do I receive payouts?',
      a: 'Payouts are request-based once your available earnings reach ₹500. Payouts are transferred directly to your verified Indian Bank Account or UPI ID.',
    },
    {
      q: 'Do I get free clothes or PR packages?',
      a: 'Active creators in our Pro and Elite tiers receive complimentary PR gift boxes featuring our freshest heavyweight t-shirts, acid-wash drops, and upcoming lookbook samples.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white selection:bg-amber-400 selection:text-black relative overflow-hidden font-sans">

      {/* ══════════════ CREATIVE BACKGROUND MESH & GLOWS ══════════════ */}

      {/* 1. Ambient Glowing Neon Blobs */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none -z-0" />
      <div className="absolute top-32 left-10 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none -z-0" />
      <div className="absolute top-[40%] right-10 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none -z-0" />
      <div className="absolute bottom-20 left-1/3 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[170px] pointer-events-none -z-0" />

      {/* 2. Cyber Dot Matrix Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none -z-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.18) 1.2px, transparent 1.2px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
        }}
      />

      {/* 3. Oversized Background Watermark Typography */}
      <div className="absolute top-6 sm:top-10 left-0 right-0 overflow-hidden pointer-events-none select-none -z-0 opacity-[0.035] flex whitespace-nowrap">
        <span
          className="text-[12vw] font-black uppercase tracking-tighter text-transparent"
          style={{ WebkitTextStroke: '2px rgba(255,255,255,0.7)' }}
        >
          AMAYAAR CREATIVE ROSTER · STREETWEAR UGC · DROP 2026 ·
        </span>
      </div>

      {/* ══════════════ 1. HERO SECTION ══════════════ */}
      <section className="relative z-10 pt-6 sm:pt-8 md:pt-10 pb-8 sm:pb-12 md:pb-16 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-4 text-center lg:text-left">

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[0.95]">
                Your Style.<br />
                <span className="text-neutral-400">Your Audience.</span><br />
                <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  Your Earnings.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm md:text-base text-neutral-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Partner with Amayaar, India’s raw streetwear and oversized fit label.
                Share curated fits, unlock personal discount codes for your followers, and earn up to{' '}
                <strong className="text-white font-bold">10% commission</strong> on every order you drive.
              </p>

              {/* Call to Actions */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link
                  to="/pages/creator-application"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black px-7 sm:px-8 py-3.5 sm:py-4 text-xs font-black uppercase tracking-wider hover:bg-neutral-200 transition active:scale-95 shadow-xl shadow-white/10"
                >
                  Apply as a Creator <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/creator/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-md px-7 sm:px-8 py-3.5 sm:py-4 text-xs font-black uppercase tracking-wider text-white hover:bg-white/[0.08] hover:border-white/30 transition active:scale-95"
                >
                  Creator Studio Login
                </Link>
              </div>

              {/* 4 Quick Pillars */}
              <div className="pt-4 sm:pt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center sm:text-left border-t border-white/[0.08]">
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02]">
                  <p className="text-lg sm:text-2xl font-black text-amber-400">10%</p>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">Starting Cut</p>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02]">
                  <p className="text-lg sm:text-2xl font-black text-white">30 Days</p>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">Attribution</p>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02]">
                  <p className="text-lg sm:text-2xl font-black text-emerald-400">₹500</p>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">Min Cashout</p>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02]">
                  <p className="text-lg sm:text-2xl font-black text-white">₹0</p>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">Joining Fee</p>
                </div>
              </div>

            </div>

            {/* Right Column: Creative Visual Streetwear Card - Scaled to balance left side */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end mt-4 lg:mt-0">

              {/* Glowing Background Spotlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-transparent rounded-3xl blur-2xl -z-10" />

              {/* Main Lookbook Poster Card */}
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[410px] rounded-3xl bg-gradient-to-b from-neutral-900/80 via-neutral-950/90 to-black p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between">

                {/* Top Creator Tag */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-black text-xs">
                      AY
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1">
                        @priya_streetwear <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      </p>
                      <p className="text-[10px] text-neutral-400">Amayaar Official Partner</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>

                {/* Model / Streetwear Visual Frame - Scaled up to give prominent visual impact */}
                <div className="relative my-3 rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center group h-[260px] sm:h-[300px] lg:h-[320px]">
                  <img
                    src="/Streetwear Model in Oversized Hoodie.png"
                    alt="Amayaar Streetwear Creator"
                    className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                  {/* Floating Overlay Badge 1 */}
                  <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/80 backdrop-blur-md p-2.5 sm:p-3 flex items-center justify-between shadow-xl">
                    <div>
                      <p className="text-[9px] sm:text-[10px] uppercase font-bold text-neutral-400">Audience Discount</p>
                      <p className="text-xs sm:text-sm font-mono font-bold text-amber-400">CODE: AYPRIYA5 (5% OFF)</p>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-1 bg-white text-black rounded-lg">
                      Copy
                    </span>
                  </div>
                </div>

                {/* Live Performance Stat Teaser */}
                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  <div className="rounded-xl bg-white/[0.02] p-2.5 sm:p-3">
                    <span className="text-[9px] font-bold uppercase text-neutral-500 block">Attributed Sales</span>
                    <span className="text-xs sm:text-sm font-black text-white">₹1,84,200</span>
                  </div>
                  <div className="rounded-xl bg-amber-500/5 p-2.5 sm:p-3">
                    <span className="text-[9px] font-bold uppercase text-amber-400 block">Commission Earned</span>
                    <span className="text-xs sm:text-sm font-black text-amber-400">+₹18,420</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ══════════════ 2. INTERACTIVE EARNINGS ESTIMATOR ══════════════ */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-white/[0.08] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-400 block">
              Transparent Economics
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white mt-1">
              Estimate Your Monthly Payout
            </h2>
            <p className="text-xs text-neutral-400 mt-2 max-w-sm sm:max-w-md mx-auto">
              Slide to see how much you could earn by recommending Amayaar fits to your followers.
            </p>
          </div>

          {/* Calculator Glass Card */}
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/[0.04] to-black/80 backdrop-blur-xl p-5 sm:p-8 md:p-10 shadow-2xl space-y-6 sm:space-y-8">

            {/* Range Slider */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Estimated Orders per Month:
                </span>
                <span className="text-xl sm:text-3xl font-black text-white font-mono">
                  {ordersReferred} <span className="text-[11px] sm:text-xs font-bold text-neutral-500">Orders</span>
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={ordersReferred}
                onChange={(e) => setOrdersReferred(Number(e.target.value))}
                className="w-full h-2 sm:h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              <div className="flex justify-between text-[9px] sm:text-[10px] font-bold text-neutral-500 font-mono">
                <span>10 orders</span>
                <span>100 orders</span>
                <span>200 orders</span>
                <span>300+ orders</span>
              </div>
            </div>

            {/* Calculations Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-white/[0.08]">

              <div className="rounded-xl sm:rounded-2xl bg-white/[0.02] p-4 sm:p-5">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                  Eligible Sales Driven
                </span>
                <p className="text-xl sm:text-2xl font-black text-white mt-1 sm:mt-2">
                  ₹{estimatedSales.toLocaleString('en-IN')}
                </p>
                <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-0.5">Average basket ₹1,900</p>
              </div>

              <div className="rounded-xl sm:rounded-2xl bg-amber-500/10 p-4 sm:p-5 shadow-lg relative sm:-translate-y-2">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  Your Monthly Income (10%)
                </span>
                <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 sm:mt-2">
                  ₹{estimatedEarnings.toLocaleString('en-IN')}
                </p>
                <p className="text-[9px] sm:text-[10px] text-amber-200/70 mt-0.5">Direct to Bank / UPI</p>
              </div>

              <div className="rounded-xl sm:rounded-2xl bg-white/[0.02] p-4 sm:p-5">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                  Unlocked Creator Tier
                </span>
                <p className="text-base sm:text-lg font-black text-white mt-1 sm:mt-2 flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-amber-400" /> {currentTier.name}
                </p>
                <p className="text-[9px] sm:text-[10px] text-neutral-400 mt-0.5 truncate">{currentTier.badge}</p>
              </div>

            </div>

            {/* Join CTA */}
            <div className="text-center pt-1 sm:pt-2">
              <Link
                to="/pages/creator-application"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black px-7 sm:px-8 py-3.5 sm:py-4 text-xs font-black uppercase tracking-wider hover:bg-neutral-200 transition active:scale-95 shadow-xl"
              >
                Start Earning with Amayaar <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════ 3. HOW IT WORKS ══════════════ */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-white/[0.08] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-16">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-neutral-400 block">
              Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white mt-1">
              How the Program Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                step: '01',
                title: 'Apply Online',
                desc: 'Submit your profile, social handles, and creator niche. No fixed follower gate required at launch.',
                icon: Sparkles,
              },
              {
                step: '02',
                title: 'Get Approved',
                desc: 'Our editorial team reviews your aesthetic and activates your profile within 24-48 hours.',
                icon: ShieldCheck,
              },
              {
                step: '03',
                title: 'Share & Tag',
                desc: 'Generate tracked links and exclusive discount codes from your Creator Studio to share on IG and YouTube.',
                icon: Share2,
              },
              {
                step: '04',
                title: 'Earn & Withdraw',
                desc: 'Track sales real-time. Request payouts directly to your Indian Bank Account or UPI once you hit ₹500.',
                icon: Wallet,
              },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl sm:rounded-3xl bg-white/[0.02] hover:bg-white/[0.05] p-5 sm:p-6 flex flex-col justify-between transition duration-300 group shadow-lg backdrop-blur-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="text-xs font-mono font-black text-neutral-500 group-hover:text-amber-400 transition">
                        {s.step}
                      </span>
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center group-hover:scale-110 transition">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                      </div>
                    </div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-white">{s.title}</h3>
                    <p className="text-[11px] sm:text-xs text-neutral-400 mt-1.5 sm:mt-2 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════ 4. FAQ SECTION ══════════════ */}
      <section className="py-12 sm:py-16 md:py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-10 sm:mb-14">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-neutral-400 block">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl sm:rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] p-4 sm:p-6 transition backdrop-blur-md"
              >
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white flex items-center gap-2">
                  <span className="text-amber-400 font-mono text-xs">Q.</span>
                  {faq.q}
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-400 mt-2 sm:mt-2.5 leading-relaxed pl-4 sm:pl-5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Banner Card */}
          <div className="mt-10 sm:mt-14 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/10 via-neutral-900 to-black p-6 sm:p-10 text-center space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-black uppercase text-white">
              Ready to Turn Your Fits Into Income?
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Join the Amayaar Creator Program today. Zero fees, instant link creation, and verified payouts.
            </p>
            <div className="pt-2">
              <Link
                to="/pages/creator-application"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black px-7 sm:px-8 py-3 sm:py-3.5 text-xs font-black uppercase tracking-wider hover:bg-neutral-200 transition"
              >
                Apply as a Creator Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
