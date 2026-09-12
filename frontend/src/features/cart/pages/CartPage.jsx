import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Check,
  Truck,
  Plus,
  Minus,
} from 'lucide-react';
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  clearCouponError,
} from '../cartSlice';
import { fetchActiveCoupons } from '../../coupons/couponsSlice';

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items = [], summary = {}, coupon, loading, actionLoading, couponError } = useSelector(
    (state) => state.cart || {}
  );
  const { coupons: availableCoupons = [] } = useSelector((state) => state.coupons || {});
  const { isAuthenticated } = useSelector((state) => state.auth || {});

  const [couponInput, setCouponInput] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchActiveCoupons());
    }
  }, [dispatch, isAuthenticated]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      dispatch(applyCoupon(couponInput.trim()));
    }
  };

  const handleQuickApply = (code) => {
    setCouponInput(code);
    dispatch(applyCoupon(code));
  };

  /* 1. Unauthenticated State */
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-neutral-50/50">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-10 sm:p-14 text-center max-w-md w-full shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-black mb-5 border border-neutral-200/80 shadow-inner">
            <ShoppingBag className="h-9 w-9 stroke-[1.8]" />
          </div>
          <h2 className="text-lg font-black text-black uppercase tracking-wider">YOUR CART IS WAITING</h2>
          <p className="text-xs text-neutral-500 font-medium mt-1.5 mb-7 leading-relaxed">
            Please log in to your account to view your saved items and proceed to checkout.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-black px-6 py-3.5 text-xs font-black text-white uppercase tracking-wider hover:bg-neutral-800 transition shadow-md"
          >
            Sign In Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* 2. Empty Cart State */
  if (items.length === 0 && !loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-neutral-50/50">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-10 sm:p-14 text-center max-w-lg w-full shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-black mb-5 border border-neutral-200/80 shadow-inner">
            <ShoppingBag className="h-9 w-9 text-neutral-800 stroke-[1.8]" />
          </div>
          <h2 className="text-xl font-black text-black uppercase tracking-wider">YOUR CART IS EMPTY</h2>
          <p className="text-xs text-neutral-500 font-medium mt-2 mb-8 leading-relaxed max-w-sm mx-auto">
            Looks like you haven't added anything to your cart yet. Explore our latest trending deals and collections!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2.5 rounded-lg bg-black px-7 py-3.5 text-xs font-black text-white uppercase tracking-wider hover:bg-neutral-800 transition shadow-md hover:shadow-lg active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" /> EXPLORE PRODUCTS <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* 3. Cart Content */
  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400 block mb-1">
            Shopping Bag
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
            MY CART ({items.length})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-neutral-200/70 bg-white p-4 sm:p-5 shadow-sm transition hover:border-neutral-300"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product?.slug || item.product?._id}`}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200/80"
                  >
                    <img
                      src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'}
                      alt={item.product?.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    {item.product?.brand && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                        {item.product.brand}
                      </span>
                    )}
                    <Link
                      to={`/products/${item.product?.slug || item.product?._id}`}
                      className="block text-xs sm:text-sm font-extrabold text-black uppercase tracking-wide hover:text-neutral-600 truncate mt-0.5"
                    >
                      {item.product?.name}
                    </Link>

                    {(item.variant?.size || item.variant?.color) && (
                      <div className="flex gap-3 text-[11px] text-neutral-500 font-semibold mt-1">
                        {item.variant.size && <span>Size: <strong className="text-black uppercase">{item.variant.size}</strong></span>}
                        {item.variant.color && <span>Color: <strong className="text-black uppercase">{item.variant.color}</strong></span>}
                      </div>
                    )}

                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-sm font-black text-black">
                        ₹{item.price?.toLocaleString('en-IN')}
                      </span>
                      {item.product?.mrp && item.product?.mrp > item.price && (
                        <span className="text-xs text-neutral-400 line-through">
                          ₹{item.product?.mrp?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100">
                  <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 p-1">
                    <button
                      disabled={actionLoading}
                      onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                      className="h-7 w-7 rounded-md bg-white text-xs font-black text-black shadow-2xs hover:bg-neutral-200 flex items-center justify-center disabled:opacity-50 transition"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-black">{item.quantity}</span>
                    <button
                      disabled={actionLoading}
                      onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                      className="h-7 w-7 rounded-md bg-white text-xs font-black text-black shadow-2xs hover:bg-neutral-200 flex items-center justify-center disabled:opacity-50 transition"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <span className="text-sm font-black text-black min-w-[70px] text-right">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>

                  <button
                    onClick={() => dispatch(removeCartItem(item._id))}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Delivery threshold badge */}
            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 flex items-center gap-3 text-xs text-neutral-800 font-bold shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white shrink-0">
                <Truck className="h-4 w-4" />
              </div>
              <span>
                {summary.subtotal >= 500
                  ? 'Yay! You have unlocked FREE Express Delivery for this order!'
                  : `Add items worth ₹${500 - summary.subtotal} more to enjoy FREE Delivery!`}
              </span>
            </div>
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Coupon Box */}
            <div className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                <Tag className="h-4 w-4 text-black" /> Apply Discount Coupon
              </h3>

              {coupon ? (
                <div className="flex items-center justify-between rounded-lg bg-emerald-50/80 p-3 border border-emerald-200/80">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">{coupon.code}</span>
                      <p className="text-[10px] text-emerald-700 font-medium">Coupon applied successfully</p>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch(removeCoupon())}
                    className="text-xs font-black text-rose-600 uppercase hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. WELCOME50)"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      if (couponError) dispatch(clearCouponError());
                    }}
                    className="w-full uppercase rounded-lg border border-neutral-200 px-3.5 py-2.5 text-xs font-bold text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black/10"
                  />
                  <button
                    type="submit"
                    disabled={!couponInput.trim() || actionLoading}
                    className="shrink-0 rounded-lg bg-black px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-40 transition"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-xs text-rose-600 font-bold mt-1">{couponError}</p>
              )}

              {/* Available Coupons list */}
              {!coupon && availableCoupons.length > 0 && (
                <div className="pt-3 border-t border-neutral-100">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-2">
                    Available Offers
                  </span>
                  <div className="space-y-2">
                    {availableCoupons.slice(0, 2).map((c) => (
                      <div
                        key={c._id}
                        onClick={() => handleQuickApply(c.code)}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60 cursor-pointer transition"
                      >
                        <div>
                          <span className="text-xs font-black text-black uppercase tracking-wide">{c.code}</span>
                          <p className="text-[10px] text-neutral-500 font-medium">
                            {c.discountType === 'percentage'
                              ? `${c.discountValue}% OFF (Max ₹${c.maxDiscount})`
                              : c.discountType === 'freeDelivery'
                              ? 'Free Delivery'
                              : `Flat ₹${c.discountValue} OFF`}
                          </p>
                        </div>
                        <span className="text-[10px] font-black text-black uppercase tracking-wider border-b border-black">APPLY</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-black text-black uppercase tracking-wider mb-4 pb-3 border-b border-neutral-100">
                Order Summary
              </h3>

              <div className="space-y-3 text-xs text-neutral-600 font-semibold pb-4 border-b border-neutral-100">
                <div className="flex justify-between">
                  <span>Total MRP</span>
                  <span className="text-black font-bold">₹{summary.mrpTotal?.toLocaleString('en-IN')}</span>
                </div>

                {summary.productDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Product Discount</span>
                    <span>-₹{summary.productDiscount?.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {summary.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-extrabold">
                    <span>Coupon Savings</span>
                    <span>-₹{summary.couponDiscount?.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>
                    {summary.deliveryCharge === 0 ? (
                      <strong className="text-emerald-600 uppercase font-black">FREE</strong>
                    ) : (
                      `₹${summary.deliveryCharge}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>₹{summary.tax?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between py-4 text-black">
                <span className="text-xs font-black uppercase tracking-wider">Total Amount</span>
                <span className="text-xl font-black text-black">
                  ₹{summary.total?.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-black py-4 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-neutral-800 transition active:scale-98"
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Safe & Secure 256-Bit SSL Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
