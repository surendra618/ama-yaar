import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { openDrawer } from '../cartSlice';

export default function ZeptoFloatingCartBar() {
  const dispatch = useDispatch();
  const location = useLocation();

  const { items = [], summary = {}, isDrawerOpen } = useSelector(
    (state) => state.cart || {}
  );

  // Don't show floating bar if cart is empty, drawer is open, or currently on checkout page
  if (
    items.length === 0 ||
    isDrawerOpen ||
    location.pathname === '/checkout' ||
    location.pathname.startsWith('/orders/')
  ) {
    return null;
  }

  const totalQuantity = items.reduce((acc, i) => acc + (i.quantity || 1), 0);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div
        onClick={() => dispatch(openDrawer())}
        className="flex items-center justify-between rounded-2xl bg-neutral-950 px-4 py-3 text-white shadow-2xl border border-white/20 cursor-pointer hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all"
      >
        {/* Left Info: Cart Icon + Quantity + Subtotal */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shrink-0 shadow-sm">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white">
              {totalQuantity}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-black tracking-tight text-white">
                ₹{summary.total || 0}
              </span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-[10.5px] font-medium text-emerald-400">
              {summary.deliveryCharge === 0 ? 'FREE Express Delivery' : '+ ₹49 Delivery'}
            </p>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-black uppercase tracking-wider text-black shadow-xs">
          <span>View Cart</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
