import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ChevronLeft, ChevronRight, Star, ShoppingBag } from 'lucide-react';
import { addToCart, openDrawer } from '../features/cart/cartSlice';
import { toggleWearItem, setFlyingGarment } from '../features/fittingRoom/fittingRoomSlice';
import { HangerIcon } from '../features/fittingRoom/components/FittingRoomModal';

export default function ProductCard({ product }) {
  if (!product) return null;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Check if this item is currently in the AI Virtual Fitting Room
  const wornItems = useSelector((state) => state.fittingRoom?.wornItems || []);
  const pid = product._id || product.id || product.slug;
  const isWorn = wornItems.some((it) => (it._id || it.id || it.slug) === pid);

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
    : 15;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

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

  const handleToggleFittingRoom = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isWorn && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      dispatch(
        setFlyingGarment({
          image: currentImage,
          startRect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
          key: Date.now(),
        })
      );
    }
    dispatch(toggleWearItem(product));
  };

  return (
    <div ref={cardRef} className="group relative flex flex-col bg-transparent select-none">
      {/* Product Image Container (3:4 portrait, tall streetwear framing matching Video) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-neutral-900/10">
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

        {/* Top-Left Action Stack: Wishlist Heart + Hanger Button (Matching Video 00:01) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-center">
          {/* Heart Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted((prev) => !prev);
            }}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#272732]/90 hover:bg-[#353544] text-white flex items-center justify-center shadow-md transition cursor-pointer backdrop-blur-xs"
            aria-label="Save to wishlist"
          >
            <Heart
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
                isWishlisted ? 'fill-[#e11d48] text-[#e11d48]' : 'text-neutral-200'
              }`}
            />
          </button>

          {/* Hanger Virtual Try-On Button (exact match to video, turns terracotta with pulse when active) */}
          <button
            type="button"
            onClick={handleToggleFittingRoom}
            className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300 cursor-pointer ${
              isWorn
                ? 'bg-[#e07a5f] text-white scale-110 shadow-orange-500/50 ring-4 ring-[#e07a5f]/40'
                : 'bg-[#272732]/90 hover:bg-[#e07a5f] text-neutral-200 hover:text-white backdrop-blur-xs'
            }`}
            title={isWorn ? 'Currently in Fitting Room (Tap to remove)' : 'Tap hanger to wear in Fitting Room'}
            aria-label="Wear in Fitting Room"
          >
            <HangerIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Top-Right: Rating Badge Pill (Matching Video 00:01) */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 rounded-full bg-[#272732]/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-white/10 shadow-xs">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-white text-[9.5px]">
            {product.rating ? Number(product.rating).toFixed(1) : '4.3'}
          </span>
        </div>

        {/* Bottom-Right Bag Button: Transforms from circular to large corner quarter-circle when worn (Matching Video 00:01 & 00:06) */}
        {isWorn ? (
          <button
            type="button"
            onClick={handleAddToCart}
            className="absolute -bottom-0.5 -right-0.5 z-20 h-12 w-12 sm:h-14 sm:w-14 rounded-tl-[32px] bg-[#e07a5f] hover:bg-[#d0694e] text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-95 group/bag animate-in fade-in zoom-in-95"
            title="Add to Cart"
            aria-label="Add to Cart"
          >
            <ShoppingBag className="h-4 w-4 stroke-[2.2] translate-x-1 translate-y-1" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="absolute bottom-2.5 right-2.5 z-20 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#272732]/90 hover:bg-[#e07a5f] text-neutral-200 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md backdrop-blur-xs group/bag"
            title="Add to Cart"
            aria-label="Add to Cart"
          >
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.2]" />
          </button>
        )}

        {/* Image Carousel Arrows (shown on hover) */}
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
      </div>

      {/* Details Below Image */}
      <div className="pt-2 px-0.5">
        {/* Product Title: Clean sans-serif title case */}
        <Link
          to={`/products/${product.slug || product._id}`}
          className="block text-xs sm:text-[13px] font-semibold text-neutral-900 hover:underline leading-snug line-clamp-1 tracking-tight"
        >
          {product.name}
        </Link>

        {/* Price Row matching Video 00:01: $189 $229 Sale */}
        <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xs sm:text-[13.5px] font-bold text-neutral-900">
            ₹{product.price?.toLocaleString('en-IN')}.00
          </span>
          {product.mrp && product.mrp > product.price && (
            <>
              <span className="text-[11px] sm:text-xs text-neutral-400 line-through font-normal">
                ₹{product.mrp?.toLocaleString('en-IN')}.00
              </span>
              <span className="text-[9px] font-bold text-[#e07a5f] bg-[#e07a5f]/10 px-1.5 py-0.2 rounded-xs uppercase tracking-wider">
                Sale
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
