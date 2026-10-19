import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Truck,
  MapPin,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Tag,
  Check,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  closeDrawer,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  fetchCart,
} from '../cartSlice';
import { fetchAddresses } from '../../account/accountSlice';

export default function ZeptoCartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items = [],
    summary = {},
    coupon,
    isDrawerOpen,
    actionLoading,
    couponError,
  } = useSelector((state) => state.cart || {});

  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const { addresses = [] } = useSelector((state) => state.account || {});

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    if (isDrawerOpen && isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchAddresses());
    }
  }, [isDrawerOpen, isAuthenticated, dispatch]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def?._id);
    }
  }, [addresses, selectedAddressId]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const currentAddress =
    addresses.find((a) => a._id === selectedAddressId) ||
    addresses.find((a) => a.isDefault) ||
    addresses[0];

  const freeThreshold = summary.freeDeliveryThreshold || 500;
  const isFreeDelivery = summary.deliveryCharge === 0;
  const amountToFree = Math.max(0, freeThreshold - (summary.subtotal || 0));
  const progressPercent = Math.min(100, Math.round(((summary.subtotal || 0) / freeThreshold) * 100));

  const handleUpdateQty = (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      dispatch(removeCartItem(itemId));
    } else {
      dispatch(updateCartItem({ itemId, quantity: newQty }));
    }
  };

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCodeInput).trim().toUpperCase();
    if (!code) return;
    dispatch(applyCoupon(code));
    setCouponCodeInput('');
  };

  const handleProceedToCheckout = () => {
    dispatch(closeDrawer());
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => dispatch(closeDrawer())}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-neutral-50 shadow-2xl transition-transform duration-300 animate-in slide-in-from-right">
        {/* 1. Header with Zepto Style Address bar */}
        <div className="bg-white px-5 pt-4 pb-3 border-b border-neutral-200/80 shrink-0">
          <div className="flex items-center justify-between pb-2.5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-black" />
              <h2 className="text-sm font-black uppercase tracking-wide text-black">
                My Cart ({items.reduce((acc, i) => acc + (i.quantity || 1), 0)} Items)
              </h2>
            </div>
            <button
              onClick={() => dispatch(closeDrawer())}
              className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-black transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Delivery Address Pill (Zepto signature) */}
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-2.5 border border-neutral-200/70">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white shrink-0">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Delivering To
                </span>
                <p className="text-xs font-bold text-black truncate">
                  {currentAddress
                    ? `${currentAddress.line1}, ${currentAddress.city} - ${currentAddress.pincode}`
                    : 'Select or add delivery address'}
                </p>
              </div>
            </div>

            {addresses.length > 0 ? (
              <button
                onClick={() => setAddressModalOpen(true)}
                className="text-[11px] font-black uppercase tracking-wider text-black underline hover:text-neutral-600 shrink-0 pl-2"
              >
                Change
              </button>
            ) : (
              <Link
                to="/account/addresses"
                onClick={() => dispatch(closeDrawer())}
                className="text-[11px] font-black uppercase tracking-wider text-black underline shrink-0 pl-2"
              >
                Add
              </Link>
            )}
          </div>
        </div>

        {/* 2. Free Delivery Threshold Banner */}
        <div className="bg-white px-5 py-2.5 border-b border-neutral-200/60 shrink-0">
          {isFreeDelivery ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
              <span>Yay! You unlocked <strong className="uppercase font-black">FREE Express Delivery!</strong></span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-black" />
                  Add <strong className="text-black font-black">₹{amountToFree}</strong> more for{' '}
                  <strong className="text-emerald-600 uppercase font-black">FREE Delivery</strong>
                </span>
                <span className="text-[10.5px] font-black text-neutral-400">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Items List / Empty State */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-4">
                <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-black uppercase tracking-tight text-black">Your Cart is Empty</h3>
              <p className="text-xs text-neutral-500 font-medium mt-1 mb-6 max-w-xs">
                Explore our latest streetwear fits, oversized tees, and denim drops!
              </p>
              <button
                onClick={() => {
                  dispatch(closeDrawer());
                  navigate('/products');
                }}
                className="rounded-lg bg-black px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition shadow-sm"
              >
                Explore Drops &rarr;
              </button>
            </div>
          ) : (
            <>
              {/* Product Cards */}
              <div className="space-y-3">
                {items.map((item) => {
                  const p = item.product || {};
                  const img =
                    p.images?.[0] ||
                    '/model01.png';
                  const displayImg = img.startsWith('http') || img.startsWith('data:')
                    ? img
                    : img;

                  return (
                    <div
                      key={item._id}
                      className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-2xs"
                    >
                      {/* Product Thumbnail */}
                      <img
                        src={displayImg}
                        alt={p.name || 'Product'}
                        className="h-20 w-16 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200/60"
                      />

                      {/* Info & Variants */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-black line-clamp-1">
                          {p.name || 'Product'}
                        </h4>

                        <div className="flex items-center gap-2 mt-0.5">
                          {item.variant?.size && (
                            <span className="text-[10.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                              Size: {item.variant.size}
                            </span>
                          )}
                          {item.variant?.color && (
                            <span className="text-[10.5px] font-bold text-neutral-500">
                              {item.variant.color}
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className="text-xs font-black text-black">
                            ₹{item.price || p.price || 0}
                          </span>
                          {p.mrp && p.mrp > (item.price || p.price) && (
                            <span className="text-[10.5px] text-neutral-400 line-through">
                              ₹{p.mrp}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Zepto Stepper: [-] [qty] [+] */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center rounded-lg border border-black bg-black text-white shadow-2xs overflow-hidden">
                          <button
                            onClick={() => handleUpdateQty(item._id, item.quantity, -1)}
                            disabled={actionLoading}
                            className="flex h-7 w-7 items-center justify-center hover:bg-neutral-800 transition active:scale-95"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="flex h-7 min-w-[1.75rem] items-center justify-center text-xs font-black px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item._id, item.quantity, 1)}
                            disabled={actionLoading}
                            className="flex h-7 w-7 items-center justify-center hover:bg-neutral-800 transition active:scale-95"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="text-[11px] font-bold text-black">
                          ₹{(item.price || p.price || 0) * item.quantity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Coupon Widget */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-black" />
                  <span className="text-xs font-black uppercase tracking-wide text-black">
                    Coupons & Offers
                  </span>
                </div>

                {coupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <div>
                        <span className="text-xs font-black uppercase text-emerald-900 tracking-wider">
                          {coupon.code} Applied
                        </span>
                        <p className="text-[10px] text-emerald-700 font-medium">
                          You saved ₹{summary.couponDiscount} on this order!
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch(removeCoupon())}
                      className="text-xs font-black uppercase text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="ENTER COUPON CODE"
                        className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-bold uppercase placeholder:text-neutral-400 focus:border-black focus:outline-none"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        disabled={actionLoading || !couponCodeInput.trim()}
                        className="rounded-lg bg-black px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition disabled:opacity-40"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Quick 1-click active coupons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['WELCOME50', 'FREESHIP', 'AMA20'].map((code) => (
                        <button
                          key={code}
                          onClick={() => handleApplyCoupon(code)}
                          className="rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black hover:border-black transition"
                        >
                          +{code}
                        </button>
                      ))}
                    </div>

                    {couponError && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1">
                        {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Bill Details Accordion */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
                <button
                  onClick={() => setShowBillDetails(!showBillDetails)}
                  className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-black"
                >
                  <span>Bill Summary</span>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                    <span>{showBillDetails ? 'Hide' : 'View Details'}</span>
                    {showBillDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {showBillDetails && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-600 font-medium">
                      <span>Items MRP Total</span>
                      <span>₹{summary.mrpTotal || summary.subtotal}</span>
                    </div>

                    {summary.productDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Catalog Discount</span>
                        <span>-₹{summary.productDiscount}</span>
                      </div>
                    )}

                    {summary.couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Coupon Savings ({coupon?.code})</span>
                        <span>-₹{summary.couponDiscount}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-neutral-600 font-medium items-center">
                      <span>Delivery Fee</span>
                      <span>
                        {summary.deliveryCharge === 0 ? (
                          <strong className="text-emerald-600 uppercase font-black">FREE</strong>
                        ) : (
                          `₹${summary.deliveryCharge}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-600 font-medium">
                      <span>GST (5%)</span>
                      <span>₹{summary.tax || 0}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Zepto Safety Assurance */}
              <div className="flex items-center justify-center gap-4 py-2 text-[10.5px] font-bold text-neutral-400 uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-black" /> 100% Genuine Fits
                </span>
                <span>•</span>
                <span>Fast Express Delivery</span>
              </div>
            </>
          )}
        </div>

        {/* 4. Zepto Sticky Bottom Action Bar */}
        {items.length > 0 && (
          <div className="bg-white p-4 border-t border-neutral-200/80 shadow-lg shrink-0">
            <div className="flex items-center justify-between gap-4">
              {/* Total & Price breakdown toggle */}
              <div
                onClick={() => setShowBillDetails(!showBillDetails)}
                className="cursor-pointer min-w-0"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                  Total Payable
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-black">
                    ₹{summary.total || 0}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500 underline">
                    {showBillDetails ? 'Hide Bill' : 'View Bill'}
                  </span>
                </div>
              </div>

              {/* Big Action Button */}
              <button
                onClick={handleProceedToCheckout}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-black py-3.5 px-6 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition active:scale-98 shadow-md"
              >
                <span>Proceed to Pay</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Address Switcher Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-black">
                Select Delivery Address
              </h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => {
                    setSelectedAddressId(addr._id);
                    setAddressModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    selectedAddressId === addr._id
                      ? 'border-black bg-neutral-100 font-bold'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <p className="text-xs font-black text-black">{addr.fullName}</p>
                  <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-1">
                    {addr.line1}, {addr.city} - {addr.pincode}
                  </p>
                </div>
              ))}
            </div>

            <Link
              to="/account/addresses"
              onClick={() => {
                setAddressModalOpen(false);
                dispatch(closeDrawer());
              }}
              className="block text-center text-xs font-black uppercase text-black underline pt-2"
            >
              + Add New Address
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
