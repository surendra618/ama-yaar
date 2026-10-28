import { useState } from 'react';
import api from '../lib/api';
import { Search, Package, Truck, CheckCircle2, AlertTriangle, Clock, MapPin, RefreshCw } from 'lucide-react';

export default function TrackPage() {
  const [query, setQuery] = useState('DEL14389278912'); // Pre-fill with sample AWB
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setShipment(null);
    try {
      const res = await api.get(`/track/${query.trim()}`);
      if (res.data?.success) {
        setShipment(res.data.shipment);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No shipment found for this tracking code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Search className="h-5 w-5 text-indigo-600" /> Live Consignment Tracking
        </h2>
        <p className="text-xs text-slate-500">
          Track packages across Delhivery, Blue Dart, DTDC, and Shadowfax partner networks
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleTrack} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter AWB Tracking Number or Order ID..."
            required
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Track Package'}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold">
          {error}
        </div>
      )}

      {/* Shipment Journey Card */}
      {shipment && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Carrier Partner</span>
              <h3 className="text-base font-black text-slate-900">{shipment.carrier}</h3>
              <p className="font-mono text-xs text-indigo-600 font-bold mt-0.5">AWB: {shipment.awbNumber}</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Status</span>
              <div>
                <span className="inline-block mt-0.5 px-3 py-1 rounded-md text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {shipment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Journey Checkpoints</h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
              {shipment.timeline?.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-white bg-indigo-600 shadow-xs"></div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">{step.activity}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2">
                      {step.location && (
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <MapPin className="h-3 w-3 text-slate-400" /> {step.location}
                        </span>
                      )}
                      <span>&bull;</span>
                      <span>{new Date(step.timestamp).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
