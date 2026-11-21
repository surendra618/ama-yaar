import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, ArrowRight, ShoppingBag } from 'lucide-react';

export default function EmptyState({
  title = "NO PRODUCTS AVAILABLE RIGHT NOW",
  subtitle = "Our exclusive drops are currently out of stock or being prepared in our streetwear lab. Stay tuned for the next heavyweight drop!",
  badge = "VAULT RESTOCKING",
  actionText = "Explore Categories",
  actionLink = "/products",
  onAction,
  secondaryActionText = "Refresh",
  onRefresh,
  className = "",
  compact = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative w-full max-w-3xl mx-auto py-12 px-4 sm:px-8 text-center flex flex-col items-center justify-center overflow-hidden ${className}`}
    >
      {/* ── Ambient Background Glow & Concentric Radar Rings ── */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-tr from-amber-400/20 via-pink-500/10 to-purple-500/15 blur-3xl"
        />
      </div>

      {/* ── Central Animated Illustration ── */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Outer Rotating Dashed Radar Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-dashed border-neutral-300 pointer-events-none"
        />

        {/* Inner Pulsing Ring */}
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-neutral-200/90 pointer-events-none"
        />

        {/* Orbiting Satellite Dot 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full pointer-events-none"
        >
          <span className="absolute top-2 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80" />
        </motion.div>

        {/* Orbiting Satellite Dot 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full pointer-events-none"
        >
          <span className="absolute bottom-1 right-4 h-1.5 w-1.5 rounded-full bg-black/60" />
        </motion.div>

        {/* Floating Sparkle 1 */}
        <motion.div
          animate={{
            y: [-4, 6, -4],
            rotate: [0, 15, 0],
            scale: [0.9, 1.15, 0.9],
          }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-3 -right-3 text-amber-500 drop-shadow-sm pointer-events-none z-10"
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.div>

        {/* Floating Sparkle 2 */}
        <motion.div
          animate={{
            y: [4, -6, 4],
            rotate: [0, -20, 0],
            scale: [1, 0.85, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -bottom-2 -left-4 text-neutral-400 drop-shadow-sm pointer-events-none z-10"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>

        {/* Floating Tag Badge */}
        <motion.div
          animate={{
            y: [-3, 4, -3],
            x: [2, -2, 2],
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-3 right-0 sm:right-2 z-10 bg-black text-[#facc15] border border-neutral-800 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>AY // 2026</span>
        </motion.div>

        {/* Main Floating SVG Illustration (Streetwear Hanger & Oversized Tee Outline) */}
        <motion.div
          animate={{
            y: [-6, 8, -6],
            rotate: [-1.5, 1.5, -1.5],
          }}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-b from-white via-neutral-50 to-neutral-100 border border-neutral-200/90 shadow-xl shadow-neutral-200/60 flex items-center justify-center p-5"
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-neutral-900"
          >
            {/* Hanger Hook */}
            <motion.path
              d="M50 20 C50 14 55 12 55 9 C55 6 52 4 49 4 C46 4 44 6 44 9"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Hanger Shoulder Triangle */}
            <path
              d="M50 20 L25 33 C22 34.5 22 37 25 37 L75 37 C78 37 78 34.5 75 33 Z"
              fill="#f1f5f9"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Streetwear Oversized Tee Silhouette */}
            <motion.path
              animate={{
                d: [
                  "M28 37 L14 48 L22 55 L28 49 L28 82 C28 85 30 87 33 87 L67 87 C70 87 72 85 72 82 L72 49 L78 55 L86 48 L72 37 Z",
                  "M28 37 L13 47 L21 54 L28 48 L28 83 C28 86 31 87.5 67 87.5 C69 87.5 72 86 72 83 L72 48 L79 54 L87 47 L72 37 Z",
                  "M28 37 L14 48 L22 55 L28 49 L28 82 C28 85 30 87 33 87 L67 87 C70 87 72 85 72 82 L72 49 L78 55 L86 48 L72 37 Z"
                ]
              }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              fill="white"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Crewneck Collar Cut */}
            <path
              d="M40 37 C40 43 60 43 60 37"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Chest Graphic Badge / Monogram Outline */}
            <rect
              x="43"
              y="50"
              width="14"
              height="10"
              rx="2.5"
              fill="#facc15"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            {/* Monogram Detail Lines */}
            <line x1="46" y1="54" x2="54" y2="54" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="46" y1="57" x2="51" y2="57" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
            {/* Bottom Hemline Stitches */}
            <line x1="33" y1="83" x2="67" y2="83" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
        </motion.div>
      </div>

      {/* ── Badge Pill ── */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 text-[#facc15] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] mb-3.5 shadow-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#facc15] animate-ping" />
          <span>{badge}</span>
        </motion.div>
      )}

      {/* ── Main Headline ── */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-neutral-900 leading-tight mb-2.5 max-w-lg"
      >
        {title}
      </motion.h3>

      {/* ── Subtitle Description ── */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed max-w-md mx-auto mb-7"
        >
          {subtitle}
        </motion.p>
      )}

      {/* ── Action Buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center justify-center gap-3 flex-wrap"
      >
        {/* Primary Action Button */}
        {actionLink ? (
          <Link
            to={actionLink}
            onClick={onAction}
            className="group inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-neutral-800 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            <span>{actionText}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        ) : onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="group inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-neutral-800 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            <span>{actionText}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        ) : null}

        {/* Secondary Action (e.g. Refresh) */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="group inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-neutral-800 hover:bg-neutral-50 hover:border-black transition-all duration-300 active:scale-95 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-neutral-500 transition-transform duration-500 group-hover:rotate-180" />
            <span>{secondaryActionText}</span>
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
