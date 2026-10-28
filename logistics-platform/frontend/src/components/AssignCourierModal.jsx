import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { X, Truck, Zap, Clock, ShieldCheck, AlertCircle, RefreshCw, Star } from 'lucide-react';

export default function AssignCourierModal({ shipment, onClose, onSuccess }) {
  const { walletBalance, refreshBalance } = useAuth();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null); // carrierId
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRates();
  }, [shipment]);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/rates/compare', {
        pickupPin: shipment.pickupAddressSnapshot?.pincode || '226010',
        deliveryPin: shipment.buyer.pincode,
        length: shipment.packageDetails?.length || 20,
        breadth: shipment.packageDetails?.breadth || 15,
        height: shipment.packageDetails?.height || 5,
        weight: shipment.packageDetails?.billableWeight || 0.5,
        isCod: shipment.payment?.mode === 'COD',
        collectableAmount: shipment.payment?.collectableAmount || 0,
      });

      if (res.data?.success) {
        setRates(res.data.couriers || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate courier rates');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (carrierId) => {
    setAssigning(carrierId);
    setError(null);
    try {
      const res = await api.post(`/shipments/${shipment._id}/assign-awb`, { carrierId });
      if (res.data?.success) {
        await refreshBalance();
        onSuccess(res.data.shipment);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign AWB');
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Assign Courier &bull; Order #{shipment.orderNumber}</h3>
              <p className="text-[11px] text-slate-400">
                To: {shipment.buyer.city}, {shipment.buyer.state} (PIN: {shipment.buyer.pincode}) &bull;{' '}
                {shipment.payment.mode === 'COD' ? `COD ₹${shipment.payment.collectableAmount}` : 'Prepaid'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Wallet Banner */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/70 border border-indigo-200/70 text-xs">
            <span className="text-indigo-900 font-medium">Available Logistics Wallet Balance:</span>
            <span className="font-extrabold text-indigo-950 font-mono text-sm">
              ₹{Number(walletBalance || 0).toLocaleString('en-IN')}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
              <p>Auto-calculating cheapest &amp; fastest courier routes...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rates.map((c) => (
                <div
                  key={c.carrierId}
                  className="rounded-xl border border-slate-200 hover:border-indigo-400 bg-white p-4 transition shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900">{c.carrierName}</h4>
                      {c.isCheapest && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          ★ Cheapest
                        </span>
                      )}
                      {c.isFastest && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          ⚡ Fastest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-amber-600">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {c.rating}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Delivery by <strong>{c.etdDate}</strong> ({c.etdDays} days)
                      </span>
                    </div>
                    {c.codCharge > 0 && (
                      <p className="text-[11px] text-slate-400">
                        Freight: ₹{c.freightCharge} + COD Fee: ₹{c.codCharge}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-slate-900 font-mono">₹{c.totalCost}</p>
                    <button
                      type="button"
                      disabled={assigning === c.carrierId || walletBalance < c.totalCost}
                      onClick={() => handleAssign(c.carrierId)}
                      className="mt-1.5 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {assigning === c.carrierId ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" /> Booking...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3" /> Ship Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
