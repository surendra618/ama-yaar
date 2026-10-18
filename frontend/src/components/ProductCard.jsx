import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { addToCart, openDrawer } from '../features/cart/cartSlice';

export default function ProductCard({ product }) {
  if (!product) return null;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Normalize images array
  const rawImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'];

  const images = rawImages.map((img) => {
    if (!img) return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
    return img;
  });

  const currentImage = images[activeImgIndex % images.length];

  // Calculate discount percentage
  const discountPercent = product.discount > 0
    ? product.discount
    : (product.mrp && product.mrp > product.price)
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 15; // default subtle discount if not specified

  const isBestseller = product.isFeatured || product.isTrending || (product.rating && product.rating >= 4.5);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if product has sizes/variants
    if (product.sizes?.length > 1 || product.variants?.length > 1) {
      navigate(`/products/${product.slug || product._id}`);
      return;
    }

    const defaultVariant = product.sizes?.[0] || 'Free Size';
    dispatch(
      addToCart({
        productId: product._id,
        quantity: 1,
        variant: defaultVariant,
      })
    );
    dispatch(openDrawer());
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="group relative flex flex-col bg-transparent select-none">
      {/* Product Image Container (3:4 portrait, tall streetwear framing matching Image 1) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900/10">
        <Link to={`/products/${product.slug || product._id}`} className="block h-full w-full">
          <img
            src={currentImage}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';
            }}
          />
        </Link>

        {/* Top-Left Badges (Brand Tag + Red SAVE % Tag matching Image 1) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
          <div className="flex items-center gap-1">
            <span className="bg-black/80 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded-xs tracking-wider uppercase">
              AMA YAAR
            </span>
          </div>
          {discountPercent > 0 && (
            <span className="bg-[#e11d48] text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-xs tracking-wide uppercase shadow-xs">
              SAVE {discountPercent}%
            </span>
          )}
          {isBestseller && (
            <span className="bg-black text-white text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase rounded-xs">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Top-Right: Brand Logo Monogram & Wishlist Heart */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-center gap-1.5">
          {/* Brand Monogram Icon */}
          <div className="h-6 w-6 rounded-full bg-black/60 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white text-[9px] font-black">
            AY
          </div>

          {/* Heart Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted((prev) => !prev);
            }}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-neutral-800 hover:text-black shadow-xs transition cursor-pointer"
            aria-label="Save to wishlist"
          >
            <Heart
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
                isWishlisted ? 'fill-[#e11d48] text-[#e11d48]' : 'text-neutral-700'
              }`}
            />
          </button>
        </div>

        {/* Image Carousel Arrows (shown when multiple images exist or on hover) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs hover:bg-black transition opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs hover:bg-black transition opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}

        {/* ADD TO CART Bar at bottom of image (matching Image 1) */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute inset-x-0 bottom-0 z-10 w-full bg-black/85 backdrop-blur-xs py-2 sm:py-2.5 text-center text-[10.5px] sm:text-[11.5px] font-black uppercase tracking-widest text-white hover:bg-black transition-all cursor-pointer opacity-95 sm:opacity-0 group-hover:opacity-100 duration-200"
        >
          ADD TO CART
        </button>
      </div>

      {/* Details Below Image */}
      <div className="pt-2 px-0.5">
        {/* Product Title: Bold, uppercase streetwear typography */}
        <Link
          to={`/products/${product.slug || product._id}`}
          className="block text-xs sm:text-[13px] font-bold uppercase text-neutral-900 hover:underline leading-snug line-clamp-1 tracking-tight"
        >
          {product.name}
        </Link>

        {/* Price Row: Rs. 1,999.00  Rs. 1,799.00 (Red discounted price matching Image 1) */}
        <div className="mt-1 flex items-baseline gap-2 flex-wrap">
          {product.mrp && product.mrp > product.price && (
            <span className="text-[11px] sm:text-xs text-neutral-400 line-through font-normal">
              Rs.{product.mrp?.toLocaleString('en-IN')}.00
            </span>
          )}
          <span className="text-xs sm:text-[13.5px] font-bold text-[#e11d48]">
            Rs.{product.price?.toLocaleString('en-IN')}.00
          </span>
        </div>
      </div>
    </div>
  );
}
