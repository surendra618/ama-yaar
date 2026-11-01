import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Heart, ChevronLeft, ChevronRight, Star, ShoppingBag } from 'lucide-react';
import { addToCart, openDrawer } from '../features/cart/cartSlice';
import { getMediaUrl } from '../utils/mediaUrl';

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
    return getMediaUrl(img);
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
        product,
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
      {/* Product Image Container (Tall high-impact streetwear framing matching reference) */}
      <div className="relative aspect-[3/4.2] w-full overflow-hidden rounded-xs bg-neutral-100">
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

        {/* Top-Left Action: SAVE X% Badge (Exact match with reference image) */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-[#e62020] text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 tracking-wider uppercase rounded-xs shadow-xs">
              SAVE {discountPercent}%
            </span>
          </div>
        )}

        {/* Top-Right Action: Wishlist Heart Button (Exact match with reference image) */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted((prev) => !prev);
            }}
            className="p-1 transition cursor-pointer text-neutral-800 hover:text-black drop-shadow-sm"
            aria-label="Save to wishlist"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isWishlisted ? 'fill-[#e62020] text-[#e62020]' : 'text-neutral-800 stroke-[1.8]'
              }`}
            />
          </button>
        </div>

        {/* Bottom-Right Bag Button (appears on hover) */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute bottom-2.5 right-2.5 z-20 h-8 w-8 rounded-full bg-white/95 hover:bg-black text-black hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md opacity-0 group-hover:opacity-100"
          title="Add to Cart"
          aria-label="Add to Cart"
        >
          <ShoppingBag className="h-4 w-4 stroke-[2.2]" />
        </button>

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

      {/* Details Below Image (Exact styling from reference image) */}
      <div className="pt-2.5 px-0.5">
        {/* Product Title: Clean bold uppercase */}
        <Link
          to={`/products/${product.slug || product._id}`}
          className="block text-xs sm:text-[13px] font-bold text-neutral-900 uppercase hover:underline leading-snug line-clamp-1 tracking-tight"
        >
          {product.name}
        </Link>

        {/* Price Row: Rs. 2,199.00 (strikethrough)  Rs. 1,999.00 (red) */}
        <div className="mt-1 flex items-baseline gap-2 flex-wrap">
          {product.mrp && product.mrp > product.price ? (
            <>
              <span className="text-[11px] sm:text-xs text-neutral-400 line-through font-normal">
                Rs.{product.mrp?.toLocaleString('en-IN')}.00
              </span>
              <span className="text-xs sm:text-[13.5px] font-bold text-[#e62020]">
                Rs.{product.price?.toLocaleString('en-IN')}.00
              </span>
            </>
          ) : (
            <span className="text-xs sm:text-[13.5px] font-bold text-neutral-900">
              Rs.{product.price?.toLocaleString('en-IN')}.00
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
