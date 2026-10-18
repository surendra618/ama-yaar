import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function ProductCard({ product }) {
  if (!product) return null;

  const [isWishlisted, setIsWishlisted] = useState(false);

  const rawImg = product.images?.[0];
  const mainImage = rawImg
    ? (rawImg.startsWith('http') || rawImg.startsWith('data:')
      ? rawImg
      : rawImg.startsWith('/uploads')
      ? `http://localhost:5000${rawImg}`
      : rawImg)
    : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';

  const rawImg2 = product.images?.[1];
  const secondImage = rawImg2
    ? (rawImg2.startsWith('http') || rawImg2.startsWith('data:')
      ? rawImg2
      : rawImg2.startsWith('/uploads')
      ? `http://localhost:5000${rawImg2}`
      : rawImg2)
    : null;

  // Calculate discount percentage
  const discountPercent = product.discount > 0
    ? product.discount
    : (product.mrp && product.mrp > product.price)
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  const isBestseller = product.isFeatured || product.isTrending || (product.rating && product.rating >= 4.5);

  return (
    <div className="group relative flex flex-col bg-transparent">
      {/* Product Image Container (3:4 portrait, zero shadow, exact match to reference Image 2) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Link to={`/products/${product.slug || product._id}`} className="block h-full w-full">
          {/* Primary Image with object-center for optimal garment framing */}
          <img
            src={mainImage}
            alt={product.name}
            className={`h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
              secondImage ? 'group-hover:opacity-0' : ''
            }`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';
            }}
          />

          {/* Secondary Hover Image (Smooth alternate flip on hover) */}
          {secondImage && (
            <img
              src={secondImage}
              alt={`${product.name} alternate view`}
              className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
              loading="lazy"
            />
          )}
        </Link>

        {/* Badges in Top-Left (Exact Image 2 Reference) */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {discountPercent && discountPercent > 0 && (
            <span className="bg-[#e11d48] text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 tracking-wider uppercase">
              {discountPercent}% OFF
            </span>
          )}
          {isBestseller && (
            <span className="bg-black text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Wishlist Button in Top-Right (Exact Image 2 Reference) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted((prev) => !prev);
          }}
          className="absolute top-2 right-2 z-10 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/95 hover:bg-white flex items-center justify-center text-neutral-700 hover:text-black shadow-xs transition cursor-pointer"
          aria-label="Save to wishlist"
        >
          <Heart
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-700'
            }`}
          />
        </button>
      </div>

      {/* Details Directly Below Image */}
      <div className="pt-2.5 px-0.5">
        {/* Brand Label */}
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
          {product.brand || 'AMA YAAR'}
        </p>

        {/* Product Title: Title case, clean sans-serif, hover:underline */}
        <Link
          to={`/products/${product.slug || product._id}`}
          className="block text-xs sm:text-[13px] font-semibold text-neutral-900 hover:underline leading-snug line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Price Row: ₹ {price}.00  ₹ {mrp}.00 */}
        <div className="mt-1 flex items-baseline gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-bold text-neutral-900">
            ₹ {product.price?.toLocaleString('en-IN')}.00
          </span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-[11px] sm:text-xs text-neutral-400 line-through font-normal">
              ₹ {product.mrp?.toLocaleString('en-IN')}.00
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
