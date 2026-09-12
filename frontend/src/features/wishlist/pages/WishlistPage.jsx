import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { fetchWishlist, toggleWishlist, moveWishlistItemToCart } from '../wishlistSlice';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items = [], loading } = useSelector((state) => state.wishlist || {});
  const { isAuthenticated } = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-neutral-200/60 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-black mb-4 border border-neutral-200">
          <Heart className="h-8 w-8 stroke-[2.2]" />
        </div>
        <h3 className="text-base font-black text-black uppercase tracking-wider">PLEASE SIGN IN</h3>
        <p className="text-xs text-neutral-500 font-medium mt-1 mb-6 max-w-sm mx-auto">
          Log in to your account to view and manage items in your personal wishlist.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-xs font-black text-white uppercase tracking-wider hover:bg-neutral-800 transition shadow-sm"
        >
          Sign In Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="rounded-xl border border-neutral-200/60 bg-white p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
            <Heart className="h-5 w-5 text-black fill-black" />
            MY WISHLIST
          </h2>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            {items.length} {items.length === 1 ? 'saved item' : 'saved items'} in your collection
          </p>
        </div>
        {items.length > 0 && (
          <span className="rounded-full bg-black px-3 py-1 text-[11px] font-black text-white uppercase tracking-widest">
            {items.length} ITEMS
          </span>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 && !loading ? (
        <div className="rounded-xl border border-neutral-200/60 bg-white p-14 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-black mb-5 border border-neutral-200/80 shadow-inner">
            <Heart className="h-9 w-9 text-neutral-800 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-black text-black uppercase tracking-wider">YOUR WISHLIST IS EMPTY</h3>
          <p className="text-xs text-neutral-500 font-medium mt-1.5 mb-7 max-w-md mx-auto leading-relaxed">
            Save your favorite items here to keep track of styles you love, monitor price drops, and move them to cart anytime.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2.5 rounded-lg bg-black px-7 py-3.5 text-xs font-black text-white uppercase tracking-wider hover:bg-neutral-800 transition shadow-md hover:shadow-lg active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" /> BROWSE PRODUCTS <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        /* Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((product) => (
            <div
              key={product._id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-xs hover:shadow-md transition-all duration-200"
            >
              {/* Product Image & Remove Button */}
              <Link to={`/products/${product.slug || product._id}`} className="relative aspect-square overflow-hidden bg-neutral-100">
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(toggleWishlist(product._id));
                  }}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/75 backdrop-blur-md text-white hover:bg-rose-600 transition shadow-md"
                  title="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Link>

              {/* Product Info */}
              <div className="flex flex-1 flex-col p-4">
                {product.brand && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    {product.brand}
                  </span>
                )}
                <Link
                  to={`/products/${product.slug || product._id}`}
                  className="text-xs font-extrabold text-black uppercase tracking-wide line-clamp-2 hover:text-neutral-600 mt-0.5 mb-3"
                >
                  {product.name}
                </Link>

                <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-neutral-400 font-bold uppercase block text-[9px] tracking-wider">Price</span>
                    <span className="text-sm font-black text-black">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => dispatch(moveWishlistItemToCart(product._id))}
                    className="flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition shadow-xs"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Move to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
