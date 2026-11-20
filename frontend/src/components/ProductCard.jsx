import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ChevronLeft, ChevronRight, Star, ShoppingBag } from 'lucide-react';
import { addToCart, openDrawer } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { getMediaUrl } from '../utils/mediaUrl';

export default function ProductCard({ product }) {
  if (!product) return null;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: wishlistItems = [] } = useSelector((state) => state.wishlist || {});
  const { isAuthenticated } = useSelector((state) => state.auth || {});

  const isWishlisted = wishlistItems.some(
    (item) => (item._id || item) === product._id || (item.slug && item.slug === product.slug)
  );

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize images array
  const rawImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'];

  const images = rawImages.map((img) => {
    return getMediaUrl(img, product.name || product.slug);
  });

  // When hovering, switch to next image (or activeImgIndex)
  const displayImageIndex = isHovered && images.length > 1 && activeImgIndex === 0 ? 1 : (activeImgIndex % images.length);
  const currentImage = images[displayImageIndex];

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
    <div
      className="group relative flex flex-col bg-transparent select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveImgIndex(0);
      }}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[3/4.2] w-full overflow-hidden rounded-xs bg-neutral-100">
        <Link to={`/products/${product.slug || product._id}`} className="block h-full w-full">
          <img
            src={currentImage}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';
            }}
          />
        </Link>

        {/* Top-Left Action: SAVE X% Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-[#e62020] text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 tracking-wider uppercase rounded-xs shadow-xs">
              SAVE {discountPercent}%
            </span>
          </div>
        )}

        {/* Top-Right Action: Wishlist Heart Button */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAuthenticated) {
                window.dispatchEvent(new CustomEvent('open-auth-modal'));
                return;
              }
              dispatch(toggleWishlist(product._id));
            }}
            className="p-1 transition cursor-pointer text-neutral-800 hover:text-black drop-shadow-sm"
            aria-label="Save to wishlist"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${isWishlisted ? 'fill-[#e62020] text-[#e62020]' : 'text-neutral-800 stroke-[1.8]'
                }`}
            />
          </button>
        </div>

        {/* Image Carousel Arrows (shown on hover if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-black transition-opacity opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-black transition-opacity opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Slide Dots Indicator */}
            <div className="absolute bottom-11 left-1/2 -translate-x-1/2 z-15 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {images.map((_, dotIdx) => (
                <div
                  key={dotIdx}
                  className={`h-1.5 rounded-full transition-all ${displayImageIndex === dotIdx ? 'w-3.5 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                />
              ))}
            </div>
          </>
        )}

        {/* BonkersCorner Style Pop-up ADD TO CART Bar at the bottom of the card on hover */}
        <div className="absolute bottom-0 left-0 right-0 z-20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full bg-black hover:bg-neutral-900 text-white py-2.5 text-[11px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:bg-neutral-800"
          >
            ADD TO CART
          </button>
        </div>
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
