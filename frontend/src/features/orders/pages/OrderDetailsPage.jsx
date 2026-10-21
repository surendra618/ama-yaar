import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  MapPin,
  CreditCard,
  RotateCcw,
  XCircle,
  FileText,
  Navigation,
  Copy,
  Check,
  ExternalLink,
  X,
  Box,
  RefreshCw,
} from 'lucide-react';
import api from '../../../lib/axios';
import Loader from '../../../components/Loader';
import { fetchOrderDetails, cancelOrder } from '../ordersSlice';

const ORDER_STEPS = [
  { id: 'placed', label: 'Order Placed' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'delivered', label: 'Delivered' },
];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentOrder, loading, error } = useSelector((state) => state.orders);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Shiprocket Live Tracking State
  const [trackingModal, setTrackingModal] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [awbCopied, setAwbCopied] = useState(false);

  const copyAwb = () => {
    const awb = currentOrder?.shiprocket?.awbCode || currentOrder?.trackingNumber;
    if (awb) {
      navigator.clipboard.writeText(awb);
      setAwbCopied(true);
      setTimeout(() => setAwbCopied(false), 2000);
    }
  };

  const handleOpenTracking = async () => {
    setTrackingModal(true);
    setLoadingTracking(true);
    try {
      const res = await api.get(`/shiprocket/orders/${id}/track`);
      setTrackingData(res.data?.data?.tracking || res.data?.tracking);
    } catch (err) {
      console.warn('Customer tracking fetch error:', err);
    } finally {
      setLoadingTracking(false);
    }
  };

  useEffect(() => {
    dispatch(fetchOrderDetails(id));
  }, [dispatch, id]);

  if (loading) {
    return <Loader size="lg" label="Retrieving order details..." minHeight="min-h-[70vh]" />;
  }

  if (!currentOrder) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-neutral-50/50 py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200/80 p-8 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-4">
            <Package className="h-8 w-8 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-black">Order Not Found</h2>
          <p className="text-xs text-neutral-500 font-medium mt-1.5 mb-6 leading-relaxed">
            {error || "We couldn't locate this order reference in your account records."}
          </p>
          <Link
            to="/account/orders"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition shadow-sm w-full cursor-pointer"
          >
            &larr; View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const STATUS_MAP = {
    placed: 0,
    pending: 0,
    confirmed: 1,
    processing: 2,
    packed: 2,
    shipped: 3,
    out_for_delivery: 4,
    delivered: 5,
  };
  const currentStatusIndex = STATUS_MAP[currentOrder.status] ?? ORDER_STEPS.findIndex((s) => s.id === currentOrder.status);
  const isCancelled = currentOrder.status === 'cancelled';
  const isDelivered = currentOrder.status === 'delivered';
  const canCancel = ['placed', 'pending', 'confirmed', 'processing'].includes(currentOrder.status);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    await dispatch(cancelOrder({ orderId: currentOrder._id, reason: cancelReason }));
    setCancelModal(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link to="/account/orders" className="mb-4 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-500 hover:text-black transition">
          <ArrowLeft className="h-4 w-4" /> Back to My Orders
        </Link>

        {/* Header Summary */}
        <div className="rounded-xl border border-neutral-200/60 bg-white p-6 shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Order Reference</span>
              <h1 className="text-xl font-black text-black">#{currentOrder.orderNumber}</h1>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                Placed on {new Date(currentOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at{' '}
                {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {canCancel && (
                <button
                  onClick={() => setCancelModal(true)}
                  className="rounded-lg bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                >
                  Cancel Order
                </button>
              )}
              {isDelivered && (
                <Link
                  to={`/returns/new?orderId=${currentOrder._id}`}
                  className="rounded-lg bg-black px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Request Return
                </Link>
              )}
            </div>
          </div>

          {/* Visual Order Progress Tracker */}
          {isCancelled ? (
            <div className="rounded-lg bg-rose-50 p-4 text-xs text-rose-800 font-semibold flex items-center gap-2 border border-rose-100">
              <XCircle className="h-5 w-5 text-rose-600" />
              <span>This order was cancelled ({currentOrder.cancelReason || 'Customer request'}).</span>
            </div>
          ) : (
            <div className="py-4">
              <span className="text-xs font-black uppercase tracking-wider text-black block mb-6">
                Live Shipment Progress
              </span>

              <div className="relative flex items-center justify-between">
                {/* Connecting background line from center of circle 1 (left-4) to center of circle N (right-4) */}
                <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-1 bg-neutral-200 z-0"></div>
                <div
                  className="absolute left-4 top-4 -translate-y-1/2 h-1 bg-black z-0 transition-all duration-500"
                  style={{
                    width: currentStatusIndex >= 0 
                      ? `calc((100% - 32px) * ${currentStatusIndex / (ORDER_STEPS.length - 1)})`
                      : '0%',
                  }}
                ></div>

                {ORDER_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition ${
                          isDone
                            ? 'bg-black text-white ring-4 ring-neutral-200'
                            : 'bg-white text-neutral-400 border-2 border-neutral-300'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                      </div>
                      <span
                        className={`mt-2 text-[11px] font-semibold text-center whitespace-nowrap hidden sm:block ${
                          isCurrent ? 'text-black font-black uppercase tracking-wider' : isDone ? 'text-neutral-800 font-bold' : 'text-neutral-400 font-medium'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* Mobile current status text fallback */}
              {currentStatusIndex >= 0 && (
                <div className="mt-3 text-center sm:hidden">
                  <span className="text-xs font-black text-black uppercase tracking-wider">
                    Current Status: {ORDER_STEPS[currentStatusIndex]?.label}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Live Shiprocket Tracking Banner */}
          {(currentOrder.shiprocket?.awbCode || currentOrder.trackingNumber) && (
            <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/80 p-3.5 rounded-xl border border-neutral-200/90 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-white shadow-xs">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                      Courier Partner:
                    </span>
                    <span className="text-xs font-black text-black">
                      {currentOrder.shiprocket?.courierName || 'Shiprocket Delivery Partner'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Tracking AWB:</span>
                    <span className="font-mono text-xs font-black text-black bg-white px-1.5 py-0.5 rounded-sm border border-neutral-200">
                      {currentOrder.shiprocket?.awbCode || currentOrder.trackingNumber}
                    </span>
                    <button
                      type="button"
                      onClick={copyAwb}
                      className="text-neutral-400 hover:text-black transition cursor-pointer"
                      title="Copy AWB"
                    >
                      {awbCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenTracking}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition cursor-pointer shadow-xs shrink-0"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Track Live Package</span>
              </button>
            </div>
          )}
        </div>

        {/* Items & Shipping Address Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Items */}
          <div className="md:col-span-8 rounded-xl border border-neutral-200/60 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-black mb-4">Items in this Package</h2>
            <div className="divide-y divide-neutral-100">
              {currentOrder.items?.map((item, i) => (
                <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover bg-neutral-50 border border-neutral-100"
                    />
                    <div>
                      <h4 className="text-xs font-black text-black">{item.name}</h4>
                      {(item.variant?.size || item.variant?.color) && (
                        <p className="text-[10px] text-neutral-500 font-medium mt-0.5">
                          {item.variant.size && `Size: ${item.variant.size} `}
                          {item.variant.color && `Color: ${item.variant.color}`}
                        </p>
                      )}
                      <p className="text-[11px] text-neutral-500 font-medium mt-1">
                        Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black text-black">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className="md:col-span-4 space-y-6">
            <div className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-black" /> Delivery Address
              </h3>
              <p className="text-xs font-black text-black">{currentOrder.shippingAddress?.fullName}</p>
              <p className="text-xs text-neutral-600 mt-1 font-medium leading-relaxed">
                {currentOrder.shippingAddress?.line1}, {currentOrder.shippingAddress?.city} - {currentOrder.shippingAddress?.pincode}
              </p>
              <p className="text-xs text-neutral-500 font-medium mt-2">📞 {currentOrder.shippingAddress?.phone}</p>
            </div>

            <div className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-black" /> Payment & Billing
              </h3>
              <div className="space-y-2 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-bold">Method:</span>
                  <span className="font-bold text-black">{currentOrder.paymentInfo?.method || 'Cash on Delivery'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-bold">Status:</span>
                  <span className="font-black text-emerald-600 uppercase">{currentOrder.paymentInfo?.status || 'Pending'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-100 text-sm font-black text-black">
                  <span>Total Amount:</span>
                  <span className="text-black font-black">₹{currentOrder.total?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-base font-black text-black uppercase tracking-wide mb-1">Cancel Order</h3>
            <p className="text-xs text-neutral-500 font-medium mb-4">
              Are you sure you want to cancel order #{currentOrder.orderNumber}?
            </p>
            <form onSubmit={handleCancelOrder} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-1.5">Reason for cancellation:</label>
                <select
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 p-2.5 text-xs text-black focus:border-black focus:ring-1 focus:ring-black outline-none font-medium"
                >
                  <option value="">Select a reason</option>
                  <option value="Changed mind">Changed my mind</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                  <option value="Delivery delayed">Delivery date is too late</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModal(false)}
                  className="rounded-lg px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={!cancelReason}
                  className="rounded-lg bg-black px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 disabled:opacity-50 transition"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Shiprocket Live Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-4 px-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
                  <Navigation className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-wide">Live Package Tracking</h3>
                  <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                    AWB: {trackingData?.awbCode || currentOrder.shiprocket?.awbCode || currentOrder.trackingNumber}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTrackingModal(false)}
                className="h-8 w-8 rounded-lg border border-neutral-200 text-neutral-400 hover:text-black hover:bg-neutral-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              {loadingTracking ? (
                <div className="py-12 flex flex-col items-center justify-center text-neutral-500 gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-black" />
                  <span className="text-xs font-semibold">Connecting to Shiprocket Tracking Network...</span>
                </div>
              ) : (
                <>
                  {/* Courier & Status Summary */}
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">Courier Partner</p>
                      <p className="text-xs font-black text-black">
                        {trackingData?.courierName || currentOrder.shiprocket?.courierName || 'Shiprocket Delivery Partner'}
                      </p>
                      {trackingData?.origin && trackingData?.destination && (
                        <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                          {trackingData.origin} &rarr; {trackingData.destination}
                        </p>
                      )}
                    </div>

                    <div className="sm:text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-black text-white uppercase tracking-wider">
                        {trackingData?.currentStatus || currentOrder.shiprocket?.status || 'In Transit'}
                      </span>
                      {trackingData?.edd && (
                        <p className="text-[11px] font-medium text-emerald-700 mt-1">
                          Delivery: {new Date(trackingData.edd).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Activity Checkpoints */}
                  <div className="pt-2">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Checkpoint Timeline
                    </h4>

                    {trackingData?.activities && trackingData.activities.length > 0 ? (
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                        {trackingData.activities.map((act, i) => (
                          <div key={i} className="relative flex items-start gap-3 text-xs">
                            <div className="absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-black bg-white shadow-xs flex items-center justify-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-black" />
                            </div>
                            <div className="w-full bg-neutral-50 border border-neutral-200/90 rounded-xl p-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-black">{act.status || act.activity}</span>
                                <span className="text-[10px] text-neutral-400 font-medium">
                                  {act.date ? new Date(act.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''}
                                </span>
                              </div>
                              {act.location && (
                                <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1 font-medium">
                                  <MapPin className="h-3 w-3 text-neutral-400" /> {act.location}
                                </p>
                              )}
                              {act.activity && act.activity !== act.status && (
                                <p className="text-[11px] text-neutral-600 mt-1">{act.activity}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-xs text-neutral-500 font-medium">
                        Your package has been booked and is currently being sorted for dispatch. Live tracking updates will appear here soon.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-5 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              {trackingData?.trackUrl ? (
                <a
                  href={trackingData.trackUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-black underline"
                >
                  <span>Open Full Tracking Details</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setTrackingModal(false)}
                className="px-5 py-2 rounded-lg bg-black text-white text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
