import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Heart, ShoppingCart, Check } from 'lucide-react';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const isWishlisted = wishlistItems.some(
    (item) => (item._id || item) === product._id || (item.slug && item.slug === product.slug)
  );

  const [added, setAdded] = React.useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  const rawImg = product.images?.[0];
  const mainImage = rawImg
    ? rawImg.startsWith('http') || rawImg.startsWith('data:')
      ? rawImg
      : rawImg.startsWith('/uploads')
      ? `http://localhost:5000${rawImg}`
      : rawImg
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-md border border-neutral-200/60 bg-white shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow hover:border-neutral-300">
      {/* Product Image Container */}
      <Link to={`/products/${product.slug || product._id}`} className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={mainImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';
          }}
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
              {product.discount}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
              BESTSELLER
            </span>
          )}
          {product.isNewArrival && (
            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-md transition hover:scale-110 ${isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-slate-500 hover:text-rose-500'
            }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand & Category */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
          <span className="uppercase tracking-wider font-semibold text-indigo-600 truncate">
            {product.brand || product.category?.name || 'AMA-YAAR'}
          </span>
          {product.rating > 0 && (
            <span className="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 font-bold text-amber-700">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {product.rating}
              {product.numReviews > 0 && (
                <span className="text-[10px] text-slate-400 font-normal">({product.numReviews})</span>
              )}
            </span>
          )}
        </div>

        {/* Title */}
        <Link
          to={`/products/${product.slug || product._id}`}
          className="text-sm font-semibold text-slate-800 line-clamp-2 hover:text-indigo-600 transition leading-snug mb-2"
        >
          {product.name}
        </Link>

        {/* Pricing & Add Button */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.mrp?.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`flex items-center justify-center rounded-md p-2.5 text-xs font-semibold shadow-xs transition-all duration-200 ${product.stock <= 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : added
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-50 text-indigo-600 hover:bg-yellow-400 hover:text-black'
              }`}
            title="Add to Cart"
          >
            {added ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
