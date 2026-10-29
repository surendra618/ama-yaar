import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  DollarSign,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  Building2,
  CreditCard,
  X,
  FileCheck,
} from 'lucide-react';

export default function AdminRemittancesPage() {
  const [remittances, setRemittances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settleModal, setSettleModal] = useState({
    isOpen: false,
    remittance: null,
    utrNumber: '',
    submitting: false,
  });

  useEffect(() => {
    fetchRemittances();
  }, []);

  const fetchRemittances = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/remittances');
      if (res.data?.success) {
        setRemittances(res.data.remittances || []);
      }
    } catch (err) {
      console.error('Failed to load remittances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleSubmit = async (e) => {
    e.preventDefault();
    if (!settleModal.utrNumber) return;

    setSettleModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await api.patch(`/admin/remittances/${settleModal.remittance._id}`, {
        payoutStatus: 'SETTLED',
        utrNumber: settleModal.utrNumber,
      });

      if (res.data?.success) {
        setSettleModal({ isOpen: false, remittance: null, utrNumber: '', submitting: false });
        fetchRemittances();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to settle remittance');
      setSettleModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-amber-500" /> Merchant COD Remittances &amp; Payouts
          </h2>
          <p className="text-xs text-slate-500">
            Process Cash on Delivery settlements to merchant verified bank accounts
          </p>
        </div>

        <button
          onClick={fetchRemittances}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Remittances List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-amber-500" />
            <p>Loading COD remittances ledger...</p>
          </div>
        ) : remittances.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 space-y-3">
            <DollarSign className="h-10 w-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No COD Remittances Generated Yet</p>
            <p className="text-slate-400 max-w-md mx-auto">
              When delivered COD orders are processed for payment, settlement batches will appear here for payout transfer.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Remittance # / Date</th>
                  <th className="px-5 py-3">Merchant</th>
                  <th className="px-5 py-3">Bank Details Snapshot</th>
                  <th className="px-5 py-3">COD Collected</th>
                  <th className="px-5 py-3">Net Payout</th>
                  <th className="px-5 py-3">UTR / Settlement</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {remittances.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <p className="font-mono font-bold text-slate-900">{r.remittanceNumber}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{r.merchant?.companyName || 'AMA YAAR Co.'}</p>
                      <p className="text-[10px] text-slate-400">{r.merchant?.email}</p>
                    </td>

                    <td className="px-5 py-4 text-[11px] text-slate-600 space-y-0.5">
                      <p className="font-medium text-slate-800">{r.bankDetailsSnapshot?.bankName || 'HDFC Bank'}</p>
                      <p className="font-mono text-[10px] text-slate-500">
                        A/C: {r.bankDetailsSnapshot?.accountNumber} &bull; {r.bankDetailsSnapshot?.ifsc}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      ₹{r.totalCodCollected?.toLocaleString('en-IN')}
                    </td>

                    <td className="px-5 py-4 font-black text-emerald-700 text-sm">
                      ₹{r.netPayableAmount?.toLocaleString('en-IN')}
                    </td>

                    <td className="px-5 py-4">
                      {r.utrNumber ? (
                        <div>
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[10px]">
                            {r.utrNumber}
                          </span>
                          {r.settlementDate && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(r.settlementDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                          Awaiting Transfer
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.payoutStatus === 'SETTLED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.payoutStatus === 'PROCESSING'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {r.payoutStatus === 'SETTLED' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {r.payoutStatus}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {r.payoutStatus !== 'SETTLED' && (
                        <button
                          onClick={() =>
                            setSettleModal({
                              isOpen: true,
                              remittance: r,
                              utrNumber: '',
                              submitting: false,
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <FileCheck className="h-3.5 w-3.5" /> Mark Settled
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settle Remittance Modal */}
      {settleModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Mark COD Remittance Settled</h3>
                <p className="text-xs text-slate-500">{settleModal.remittance?.remittanceNumber}</p>
              </div>
              <button
                onClick={() => setSettleModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Merchant:</span>
                  <span className="text-slate-900">{settleModal.remittance?.merchant?.companyName}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Amount to Transfer:</span>
                  <span className="text-emerald-700 font-bold">
                    ₹{settleModal.remittance?.netPayableAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bank UTR / Transaction Reference Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-HDFC-9821034"
                  value={settleModal.utrNumber}
                  onChange={(e) => setSettleModal((prev) => ({ ...prev, utrNumber: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSettleModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settleModal.submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {settleModal.submitting ? 'Confirming...' : 'Confirm Remittance Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
