import React from 'react';

/**
 * Universal Admin Loader
 * Uses the custom animated loading GIF with graceful fallback
 */
export default function Loader({
  size = 'md',
  label = 'Loading…',
  className = '',
  fullScreen = false,
}) {
  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const imgSizeClass = sizeMap[size] || sizeMap.md;

  const content = (
    <div className="flex flex-col items-center justify-center gap-2 select-none">
      <div className={`relative flex items-center justify-center ${imgSizeClass}`}>
        <img
          src="/loading-sm.gif"
          alt="Loading..."
          className="w-full h-full object-contain pointer-events-none mix-blend-multiply"
          loading="eager"
        />
      </div>
      {label && <span className="text-xs font-semibold text-slate-500 tracking-wide">{label}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      {content}
    </div>
  );
}
