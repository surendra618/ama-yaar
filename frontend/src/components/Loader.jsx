import React from 'react';

/**
 * Universal AMA YAAR Branded Loader
 * Uses the custom animated loading GIF with multiple sizes and display modes
 *
 * Props:
 * - size: 'xs' (36px) | 'sm' (52px) | 'md' (80px) | 'lg' (112px) | 'xl' (160px)
 * - label: optional text below the loader (e.g. 'Loading fits...', 'Please wait...')
 * - fullScreen: boolean - renders fixed full-screen backdrop
 * - minHeight: string - e.g. 'min-h-[50vh]', 'min-h-[300px]'
 * - className: additional wrapper classes
 * - variant: 'default' | 'card' | 'inline'
 */
export default function Loader({
  size = 'md',
  label = '',
  fullScreen = false,
  minHeight = '',
  className = '',
  variant = 'default',
}) {
  const sizeMap = {
    xs: 'w-9 h-9',
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-40 h-40',
  };

  const imgSizeClass = sizeMap[size] || sizeMap.md;
  const gifSource = size === 'xs' || size === 'sm' ? '/loading-sm.gif' : '/loading.gif';

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 select-none">
      <div className={`relative flex items-center justify-center ${imgSizeClass}`}>
        <img
          src={gifSource}
          alt="Loading AMA YAAR"
          className="w-full h-full object-contain pointer-events-none mix-blend-multiply"
          loading="eager"
        />
      </div>
      {label && (
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-600 animate-pulse text-center">
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white/85 backdrop-blur-xs transition-opacity ${className}`}
      >
        {content}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {content}
      </div>
    );
  }

  const containerMinHeight = minHeight || (variant === 'card' ? 'min-h-[220px]' : 'min-h-[45vh]');

  return (
    <div className={`flex w-full items-center justify-center py-10 ${containerMinHeight} ${className}`}>
      {content}
    </div>
  );
}
