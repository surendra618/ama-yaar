import React, { useEffect, useState } from 'react';
import { Tag, Ticket, Copy, Check, Sparkles, Percent, Clock, AlertCircle } from 'lucide-react';
import api from '../../../lib/axios';
import Loader from '../../../components/Loader';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons/active');
      const list = res.data?.data || res.data || [];
      setCoupons(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load active coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black shrink-0">
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-black uppercase tracking-wide">Available Coupons & Offers</h2>
            <p className="text-[12px] text-neutral-500 font-medium">
              Copy promo codes to claim instant discounts at checkout
            </p>
          </div>
          {coupons.length > 0 && (
            <span className="ml-auto rounded-full bg-black px-3 py-1 text-[11px] font-black text-white uppercase tracking-wider">
              {coupons.length} Active
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-8 text-center shadow-xs">
          <Loader size="md" label="Checking available discount vouchers..." variant="card" />
        </div>
      )}

      {/* Empty State */}
      {!loading && coupons.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-16 text-center shadow-xs">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <Ticket className="h-7 w-7 text-neutral-400" />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-800">No coupons active right now</p>
          <p className="text-xs text-neutral-400 font-medium mt-1">Check back during upcoming seasonal drops!</p>
        </div>
      )}

      {/* Coupons Grid */}
      {!loading && coupons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon) => {
            const isCopied = copiedCode === coupon.code;
            const discountLabel =
              coupon.discountType === 'percentage'
                ? `${coupon.discountValue}% OFF`
                : coupon.discountType === 'freeDelivery'
                ? 'FREE DELIVERY'
                : `₹${coupon.discountValue} FLAT OFF`;

            return (
              <div
                key={coupon._id}
                className="relative flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs hover:border-black/50 transition overflow-hidden group"
              >
                {/* Decorative cutouts for ticket look */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-neutral-50 border border-neutral-200/80" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-neutral-50 border border-neutral-200/80" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-black">
                      <Sparkles className="h-3 w-3 text-amber-500" /> {discountLabel}
                    </span>
                    {coupon.expiryDate && (
                      <span className="text-[10.5px] font-medium text-neutral-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Valid till {new Date(coupon.expiryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black tracking-tight text-black uppercase">
                    Save with code {coupon.code}
                  </h3>

                  <p className="text-xs text-neutral-500 font-medium mt-1">
                    {coupon.minOrderValue > 0
                      ? `Valid on all orders above ₹${coupon.minOrderValue}`
                      : 'Applicable on any order value with no minimum spend'}
                    {coupon.maxDiscount ? ` (up to ₹${coupon.maxDiscount})` : ''}.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-dashed border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-md bg-neutral-100 font-mono text-xs font-black tracking-widest text-black border border-neutral-200/80">
                      {coupon.code}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-black text-white hover:bg-neutral-800'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
