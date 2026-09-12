import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RotateCcw, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { fetchMyOrders } from '../../orders/ordersSlice';
import { createReturnRequest } from '../returnsSlice';

export default function ReturnRequestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const orderIdParam = searchParams.get('orderId') || '';
  const { orders = [] } = useSelector((state) => state.orders || {});

  const [selectedOrderId, setSelectedOrderId] = useState(orderIdParam);
  const [reason, setReason] = useState('defective');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    setSubmitting(true);
    const res = await dispatch(
      createReturnRequest({
        orderId: selectedOrderId,
        reason,
        comment,
      })
    );
    setSubmitting(false);
    if (res.payload?._id) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-neutral-200/60 bg-white p-12 text-center shadow-sm max-w-md mx-auto">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4 border border-emerald-200">
          <CheckCircle2 className="h-9 w-9 stroke-[2]" />
        </div>
        <h2 className="text-base font-black text-black uppercase tracking-wider">RETURN REQUEST SUBMITTED</h2>
        <p className="text-xs text-neutral-500 font-medium mt-1.5 mb-6 leading-relaxed">
          Our support team is reviewing your request. Doorstep pickup will be scheduled upon approval.
        </p>
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-xs font-black text-white uppercase tracking-wider hover:bg-neutral-800 transition shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back Link */}
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-2 text-xs font-extrabold text-black uppercase tracking-wider hover:text-neutral-600 transition"
      >
        <ArrowLeft className="h-4 w-4 text-black" /> Back to My Orders
      </Link>

      {/* Main Card */}
      <div className="rounded-xl border border-neutral-200/60 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-neutral-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white shrink-0 shadow-md">
            <RotateCcw className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
              Returns & Refunds
            </span>
            <h1 className="text-lg font-black text-black uppercase tracking-tight">Request Product Return</h1>
          </div>
        </div>

        {/* Guarantee Info Banner */}
        <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200/80 rounded-lg p-3.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-xs text-neutral-600 font-bold">
            7-Day Doorstep Pickup & Full Refund Guarantee on eligible orders.
          </p>
        </div>

        {/* Return Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-2">
              Select Order:
            </label>
            <select
              required
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-xs font-semibold text-black transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black/10 cursor-pointer"
            >
              <option value="">-- Choose Order --</option>
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  Order #{o.orderNumber || o._id.slice(-6).toUpperCase()} (₹{o.total?.toLocaleString('en-IN')}) - {new Date(o.createdAt).toLocaleDateString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-2">
              Return Reason:
            </label>
            <select
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-xs font-semibold text-black transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black/10 cursor-pointer"
            >
              <option value="defective">Defective / Not working</option>
              <option value="damaged">Damaged during transit</option>
              <option value="wrong_product">Received wrong product</option>
              <option value="size_issue">Size / Fit issue</option>
              <option value="not_as_expected">Product not as described</option>
              <option value="other">Other reason</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-2">
              Detailed Comment:
            </label>
            <textarea
              required
              rows={4}
              placeholder="Explain what was wrong with the product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white p-4 text-xs font-semibold text-black transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black/10"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedOrderId}
            className="w-full rounded-lg bg-black py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-neutral-800 transition active:scale-98 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
