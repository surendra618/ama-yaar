import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminLogo({ size = 'md', className = '' }) {
  const heights = {
    sm: 'h-9',
    md: 'h-12',
    lg: 'h-15',
    xl: 'h-20 sm:h-22',
    '2xl': 'h-24',
  };

  return (
    <Link to="/" className={`group inline-flex items-center ${className}`}>
      <img
        src="/logo.png"
        alt="AMA-YAAR"
        className={`${heights[size] || 'h-13'} w-auto object-contain transition-transform group-hover:scale-105`}
      />
    </Link>
  );
}
