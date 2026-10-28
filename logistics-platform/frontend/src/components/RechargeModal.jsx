import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { X, Wallet, CheckCircle2, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export default function RechargeModal({ onClose }) {
  const { walletBalance, refreshBalance } = useAuth();
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const presets = [500, 1000, 2500, 5000];

  const handleRecharge = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await api.post('/wallet/recharge', {
        amount,
        paymentMethod: 'Instant Sandbox Gateway (UPI/NetBanking)',
      });
      if (res.data?.success) {
        setSuccessMsg(`Successfully added ₹${amount} to your wallet!`);
        await refreshBalance();
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Recharge failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Recharge Logistics Wallet</h3>
              <p className="text-[11px] text-slate-400">Prepaid balance for instant AWB generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleRecharge} className="p-5 space-y-4">
          {successMsg ? (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-900">{successMsg}</p>
            </div>
          ) : (
            <>
              {/* Current Balance */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Current Balance:</span>
                <span className="font-extrabold text-slate-900 font-mono text-sm">
                  ₹{Number(walletBalance || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Presets */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Select Recharge Amount
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(p)}
                      className={`py-2 rounded-lg text-xs font-black transition cursor-pointer border ${
                        amount === p
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ₹{p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Or Enter Custom Amount (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Instant Credit Note */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60">
                <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Instant balance credit without lock-in. 100% usable for all courier labels.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !amount || amount <= 0}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5" /> Pay ₹{amount} &amp; Credit Wallet
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
