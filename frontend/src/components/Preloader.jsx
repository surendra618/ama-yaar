import { useState, useEffect } from 'react';

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phaseText, setPhaseText] = useState('Initializing AMA YAAR...');
  const [isClosing, setIsClosing] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  // Coordinated Animation States
  const [logoEntered, setLogoEntered] = useState(false);
  const [amaEntered, setAmaEntered] = useState(false);
  const [typedYaar, setTypedYaar] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [badgeEntered, setBadgeEntered] = useState(false);

  useEffect(() => {
    // Disable body scroll while loading
    document.body.style.overflow = 'hidden';

    // 1. Logo drops down smoothly from top (at 200ms, smooth 1.2s transition)
    const logoTimer = setTimeout(() => setLogoEntered(true), 200);

    // 2. "AMA" slides in from left (at 900ms)
    const amaTimer = setTimeout(() => setAmaEntered(true), 900);

    // 3. "YAAR" typing animation (starts at 1500ms, slow & elegant)
    const word = 'YAAR';
    const typingTimers = [];
    for (let i = 1; i <= word.length; i++) {
      const t = setTimeout(() => {
        setTypedYaar(word.slice(0, i));
        if (i === word.length) {
          setIsTypingDone(true);
        }
      }, 1500 + (i - 1) * 200);
      typingTimers.push(t);
    }

    // 4. Badge & Tagline enter (at 2400ms)
    const badgeTimer = setTimeout(() => setBadgeEntered(true), 2350);

    // Dynamic Phase messages
    const phase1 = setTimeout(() => setPhaseText('Curating Premium Streetwear...'), 700);
    const phase2 = setTimeout(() => setPhaseText('Loading Exclusive 2026 Drops...'), 1700);
    const phase3 = setTimeout(() => setPhaseText('Welcome to AMA YAAR'), 2600);

    // Progress counter animation (3.2s total duration for a relaxed cinematic entrance)
    const startTime = Date.now();
    const duration = 3200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const current = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsClosing(true);
          setTimeout(() => {
            setIsRemoved(true);
            document.body.style.overflow = '';
            if (onComplete) onComplete();
          }, 800);
        }, 400);
      }
    }, 20);

    return () => {
      clearInterval(interval);
      clearTimeout(logoTimer);
      clearTimeout(amaTimer);
      typingTimers.forEach(clearTimeout);
      clearTimeout(badgeTimer);
      clearTimeout(phase1);
      clearTimeout(phase2);
      clearTimeout(phase3);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  if (isRemoved) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#ffffff] text-neutral-900 select-none transition-all duration-800 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isClosing ? 'opacity-0 -translate-y-12 pointer-events-none scale-105' : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Ambient background warm illumination */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-amber-100/50 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full bg-yellow-100/50 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-amber-50/70 blur-[130px]" />

      {/* Luxury Subtle Dot Pattern Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-3xl w-full">
        
        {/* 1. LOGO — Clean & Flat (No Shadow), Slides down slowly from TOP */}
        <div
          className={`relative mb-3 flex items-center justify-center transition-all duration-1000 ease-out transform ${
            logoEntered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-24 scale-90'
          }`}
        >
          <div className="relative flex h-18 sm:h-22 md:h-26 w-auto items-center justify-center p-1">
            <img
              src="/logo.png"
              alt="AMA YAAR"
              className="h-full w-auto max-w-[160px] sm:max-w-[190px] md:max-w-[220px] object-contain"
            />
          </div>
        </div>

        {/* 2. EDITION TEXT (Only clean text, no box) */}
        <div
          className={`mb-3 transition-all duration-700 ease-out transform ${
            badgeEntered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>STREETWEAR EDITION 2026</span>
          </div>
        </div>

        {/* 3. BIG "AMA YAAR" TITLE (AMA from LEFT + YAAR TYPING EFFECT) */}
        <div className="mb-3 flex items-center justify-center select-none overflow-hidden py-1">
          <h1
            className="font-display font-black tracking-tight leading-none uppercase flex items-center justify-center flex-wrap"
            style={{ fontSize: 'clamp(3rem, 9.5vw, 6.2rem)' }}
          >
            {/* "AMA" slides in from LEFT (slower, elegant easing) */}
            <span
              className={`inline-block text-black transition-all duration-800 ease-out transform pr-3 sm:pr-4 ${
                amaEntered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-32'
              }`}
            >
              AMA
            </span>

            {/* "YAAR" typed letter by letter */}
            <span
              className="inline-flex items-center bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent min-h-[1.1em] min-w-[2.8ch]"
            >
              {typedYaar}
              {/* Blinking typing cursor */}
              {!isTypingDone && amaEntered && (
                <span className="inline-block w-[3px] sm:w-[4px] h-[0.8em] bg-amber-500 ml-1 rounded-full animate-pulse" />
              )}
            </span>
          </h1>
        </div>

        {/* 4. TAGLINE */}
        <p
          className={`text-xs sm:text-sm font-bold text-neutral-500 tracking-[0.28em] uppercase mb-9 transition-all duration-700 ease-out transform ${
            badgeEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          Better Looks • Bigger Dreams
        </p>

        {/* 5. CIRCULAR PROGRESS LOADER */}
        <div
          className={`flex flex-col items-center justify-center transition-all duration-700 ease-out transform ${
            badgeEntered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          {/* Circular SVG Ring */}
          <div className="relative flex items-center justify-center">
            <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 64 64">
              <defs>
                <linearGradient id="amberRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              
              {/* Background Track Circle */}
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#f3f4f6"
                strokeWidth="3.5"
                fill="none"
              />
              
              {/* Animated Progress Circle */}
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="url(#amberRingGradient)"
                strokeWidth="3.5"
                fill="none"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 - (2 * Math.PI * 26 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-150 ease-out"
              />
            </svg>

            {/* Percentage in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-xs font-black text-amber-600">
                {progress}%
              </span>
            </div>
          </div>

          {/* Dynamic Phase text below circle */}
          <span className="mt-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 transition-all duration-300">
            {phaseText}
          </span>
        </div>
      </div>
    </div>
  );
}
