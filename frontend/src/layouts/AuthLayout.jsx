import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Zap, Heart, Flame, Sparkles, Truck, Crown } from 'lucide-react';

export default function AuthLayout() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="al-root">
      {/* ══════════════ LEFT PANEL — DARK GRADIENT ══════════════ */}
      <div className="al-left">
        {/* Background gradient & blobs */}
        <div className="al-left-bg" />
        <div className="al-blob al-blob-1" />
        <div className="al-blob al-blob-2" />
        <div className="al-blob al-blob-3" />

        {/* 3D Glowing Arch Ring */}
        <div className="al-model-arch" />

        {/* Boy Model Image — placed directly in al-left for full height & far right alignment */}
        <img src="/fashion-model.jpg" alt="Fashion Model" className="al-model-img" />

        {/* Content Layer */}
        <div className="al-left-content">

          {/* Logo — click to go home */}
          <Link to="/" className="al-logo-link">
            <img src="/logo.png" alt="AMA YAAR" className="al-logo-img" />
          </Link>

          {/* Top Right "Better Looks" floating badge */}
          <div className="al-hero-badge">
            <Crown size={18} className="al-hero-badge-crown mx-auto" />
            Better<br />
            Looks<br />
            Bigger<br />
            Dreams
          </div>

          {/* Center Content */}
          <div className="al-hero-center">
            {/* Style Pill */}
            <div className="al-style-pill">
              <span className="al-pill-dot">✦</span> Your Style · Our Priority
            </div>

            {/* Headline */}
            <h1 className="al-headline">
              Dressing up<br />
              just got{' '}
              <span className="al-headline-color">
                cooler
                <span className="al-headline-underline" />
              </span>
            </h1>

            <p className="al-tagline">
              India ka sabse swaggy fashion destination.<br />
              Be you. Be bold.
            </p>

            {/* Feature Pills */}
            <div className="al-features">
              <div className="al-feature">
                <span className="al-feature-icon al-feature-icon--fire">
                  <Flame size={15} className="text-pink-500" />
                </span>
                <div>
                  <div className="al-feature-title">Trending</div>
                  <div className="al-feature-sub">Latest styles</div>
                </div>
              </div>
              <div className="al-feature">
                <span className="al-feature-icon al-feature-icon--gem">
                  <Sparkles size={15} className="text-purple-500" />
                </span>
                <div>
                  <div className="al-feature-title">Premium</div>
                  <div className="al-feature-sub">Top brands</div>
                </div>
              </div>
              <div className="al-feature">
                <span className="al-feature-icon al-feature-icon--bolt">
                  <Truck size={15} className="text-sky-500" />
                </span>
                <div>
                  <div className="al-feature-title">Fast Delivery</div>
                  <div className="al-feature-sub">Across India</div>
                </div>
              </div>
            </div>

            {/* Bottom Cursive Script */}
            <div className="al-script">
              Style • Confidence • You
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════ RIGHT PANEL — CLEAN WHITE CARD ══════════════ */}
      <div className="al-right">


        {/* Center Auth Card */}
        <div className="al-right-body">
          <div className="al-auth-card">
            <Outlet />

            {/* Trust Badges inside Card */}
            <div className="al-trust-badges">
              <div className="al-trust-item">
                <ShieldCheck size={16} className="al-trust-icon" />
                <div>
                  <div className="al-trust-title">Secure Login</div>
                  <div className="al-trust-sub">Your data is safe</div>
                </div>
              </div>
              <div className="al-trust-item">
                <Zap size={16} className="al-trust-icon" />
                <div>
                  <div className="al-trust-title">Quick Access</div>
                  <div className="al-trust-sub">Get started fast</div>
                </div>
              </div>
              <div className="al-trust-item">
                <Heart size={16} className="al-trust-icon" />
                <div>
                  <div className="al-trust-title">Made for You</div>
                  <div className="al-trust-sub">Personalized style</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="al-bottom-bar">
          <span> 100% Secure</span>
          <span> Fast Delivery</span>
          <span>Trusted by 1M+</span>
        </div>
      </div>
    </div>
  );
}
