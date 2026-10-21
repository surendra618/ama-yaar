import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Navigation,
  RefreshCw,
} from 'lucide-react';
import api from '../../../lib/axios';
import Loader from '../../../components/Loader';

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('order') || searchParams.get('awb') || searchParams.get('id') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleTrack = async (searchVal) => {
    const val = (searchVal || query || '').trim();
    if (!val) {
      setError('Please enter your Order Number (e.g. AY-...) or AWB Tracking Number');
      return;
    }

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      // Check if user passed an AWB or an Order ID
      let res;
      if (/^\d{10,}$/.test(val)) {
        // Likely an AWB number (numeric)
        res = await api.get(`/shiprocket/track/${val}`).catch(() => api.get(`/shiprocket/orders/${val}/track`));
      } else {
        // Order reference
        res = await api.get(`/shiprocket/orders/${val}/track`).catch(() => api.get(`/shiprocket/track/${val}`));
      }

      const data = res.data?.data?.tracking || res.data?.data || res.data?.tracking || res.data;
      if (data) {
        setTrackingData(data);
      } else {
        setError('No tracking information found for this reference. Please check your tracking number and try again.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to locate tracking records for this reference. Please verify your order number or AWB.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleTrack(initialQuery);
    }
  }, [initialQuery]);

  const copyAwb = (awb) => {
    if (!awb) return;
    navigator.clipboard.writeText(awb);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#facc15] shadow-xs">
            <Truck className="h-3.5 w-3.5" />
            <span>Shiprocket Live Dispatch Network</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900 font-display">
            Track Your Package
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium max-w-md mx-auto">
            Enter your AMA YAAR order reference or courier AWB tracking code to view real-time transit checkpoints.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack(query);
            }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setError('');
                }}
                placeholder="e.g. AY-1029-491028 or AWB Code 143289012"
                className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/50 pl-11 pr-4 text-xs font-semibold text-black placeholder:text-neutral-400 focus:bg-white focus:border-black focus:outline-hidden transition"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full sm:w-auto h-12 px-7 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-40 cursor-pointer shadow-xs active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#facc15]" />
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 text-[#facc15]" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
            <Loader size="md" label="Querying courier tracking network..." variant="card" />
          </div>
        )}

        {/* Tracking Result Card */}
        {trackingData && (
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-300">
            {/* Header Status Strip */}
            <div className="p-5 sm:p-6 bg-neutral-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#facc15]">
                  Current Transit Status
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  {trackingData.currentStatus || 'In Transit'}
                </h2>
                {trackingData.edd && (
                  <p className="text-xs text-neutral-300 font-medium">
                    Estimated Delivery: <strong className="text-white">{new Date(trackingData.edd).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-700">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">AWB:</span>
                  <span className="font-mono text-xs font-bold text-[#facc15]">
                    {trackingData.awbCode || query}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyAwb(trackingData.awbCode || query)}
                    className="text-neutral-400 hover:text-white transition cursor-pointer"
                    title="Copy AWB"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <span className="text-[11px] font-medium text-neutral-400">
                  Carrier: {trackingData.courierName || 'Shiprocket Delivery Partner'}
                </span>
              </div>
            </div>

            {/* Route summary */}
            {(trackingData.origin || trackingData.destination) && (
              <div className="px-6 py-3.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs text-neutral-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Origin: <strong>{trackingData.origin || 'Warehouse Facility'}</strong></span>
                </div>
                <span>&rarr;</span>
                <div>
                  <span>Destination: <strong>{trackingData.destination || 'Delivery Address'}</strong></span>
                </div>
              </div>
            )}

            {/* Checkpoints Timeline */}
            <div className="p-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-5 flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Transit Activity Timeline
              </h3>

              {trackingData.activities && trackingData.activities.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                  {trackingData.activities.map((act, i) => (
                    <div key={i} className="relative flex items-start gap-3.5 text-xs">
                      <div className="absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-black bg-white shadow-xs flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-black" />
                      </div>
                      <div className="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl p-3.5 transition hover:border-neutral-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="font-extrabold text-black text-sm">{act.status || act.activity}</span>
                          <span className="text-[11px] text-neutral-400 font-medium">
                            {act.date ? new Date(act.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                          </span>
                        </div>
                        {act.location && (
                          <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1 font-medium">
                            <MapPin className="h-3 w-3 text-neutral-400" /> {act.location}
                          </p>
                        )}
                        {act.activity && act.activity !== act.status && (
                          <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">{act.activity}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center text-xs text-neutral-500 font-medium">
                  Your shipment record has been confirmed with the courier partner and will be scanned at the dispatch facility shortly.
                </div>
              )}

              {/* Bottom Action strip */}
              <div className="mt-8 pt-5 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                {trackingData.trackUrl ? (
                  <a
                    href={trackingData.trackUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-black font-bold underline"
                  >
                    <span>View on Official Courier Portal</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span />
                )}
                <Link
                  to="/account/orders"
                  className="inline-flex items-center gap-1.5 text-black font-extrabold uppercase tracking-wider hover:underline"
                >
                  <span>View All My Orders</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
