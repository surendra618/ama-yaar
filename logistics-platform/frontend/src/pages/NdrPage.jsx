import { useState, useEffect } from 'react';
import api from '../lib/api';
import { AlertTriangle, RefreshCw, RotateCcw, MapPin, CheckCircle2, Phone, X } from 'lucide-react';

export default function NdrPage() {
  const [ndrList, setNdrList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeShipment, setActiveShipment] = useState(null);
  const [actionType, setActionType] = useState('RE_ATTEMPT'); // 'RE_ATTEMPT' | 'UPDATE_ADDRESS' | 'RTO'
  const [notes, setNotes] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNdr();
  }, []);

  const fetchNdr = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shipments?status=NDR_FAILED');
      if (res.data?.success) {
        setNdrList(res.data.shipments || []);
      }
    } catch (err) {
      console.warn('NDR fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post(`/shipments/${activeShipment._id}/ndr-action`, {
        action: actionType,
        notes,
        newAddress,
        newPincode,
      });
      if (res.data?.success) {
        alert(res.data.message);
        setActiveShipment(null);
        fetchNdr();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'NDR action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600" /> Non-Delivery Reports (NDR) &amp; RTO Protection
        </h2>
        <p className="text-xs text-slate-500">
          Take immediate action on undelivered consignments to prevent Return to Origin (RTO) freight losses
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
          <p>Scanning for failed delivery attempts...</p>
        </div>
      ) : ndrList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-3 shadow-xs">
          <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500" />
          <p className="font-extrabold text-sm text-slate-800">All Shipments Delivering Smoothly!</p>
          <p className="text-slate-500 max-w-md mx-auto">
            There are zero pending NDR exceptions. When a courier rider reports customer unavailable or incorrect address, consignments will appear here for 1-click re-attempt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ndrList.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-2xl p-5 border border-rose-200 hover:border-rose-400 shadow-xs transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Order #{s.orderNumber}</h3>
                  <p className="font-mono text-xs text-indigo-600 font-bold">AWB: {s.courier?.awbNumber}</p>
                </div>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Attempt #{s.ndrDetails?.attemptsCount || 1} Failed
                </span>
              </div>

              {/* Courier Reported Reason */}
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Courier Exception Reason</p>
                <p className="font-bold">{s.ndrDetails?.lastNdrReason || 'Consignee phone not reachable'}</p>
              </div>

              {/* Customer Info */}
              <div className="text-xs text-slate-600 space-y-1">
                <p><strong>Customer:</strong> {s.buyer.name} &bull; <Phone className="h-3 w-3 inline text-slate-400" /> {s.buyer.phone}</p>
                <p><strong>Address:</strong> {s.buyer.addressLine1}, {s.buyer.city} ({s.buyer.pincode})</p>
                <p><strong>Payment:</strong> {s.payment.mode === 'COD' ? `COD ₹${s.payment.collectableAmount}` : 'Prepaid'}</p>
              </div>

              <button
                onClick={() => {
                  setActiveShipment(s);
                  setNewAddress(s.buyer.addressLine1);
                  setNewPincode(s.buyer.pincode);
                }}
                className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                Take Immediate NDR Action &rarr;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {activeShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                Resolve NDR &bull; Order #{activeShipment.orderNumber}
              </h3>
              <button onClick={() => setActiveShipment(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleResolve} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Select Action</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'RE_ATTEMPT', label: 'Re-attempt Next Day' },
                    { id: 'UPDATE_ADDRESS', label: 'Update Address' },
                    { id: 'RTO', label: 'Return to Origin' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setActionType(act.id)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer ${
                        actionType === act.id
                          ? 'bg-slate-900 text-amber-400 border-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {actionType === 'UPDATE_ADDRESS' && (
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Delivery Address</label>
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instruction Note for Courier Rider</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Customer will be available after 3 PM. Call 917809730968 upon arrival."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveShipment(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  {submitting ? 'Transmitting to Carrier...' : 'Transmit Resolution to Carrier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
