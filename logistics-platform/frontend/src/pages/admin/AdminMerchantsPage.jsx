import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  IndianRupee,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('');

  // Adjustment Modal state
  const [adjustModal, setAdjustModal] = useState({
    isOpen: false,
    merchant: null,
    amount: '',
    type: 'CREDIT', // 'CREDIT' | 'DEBIT'
    description: '',
    submitting: false,
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchMerchants();
  }, [kycFilter]);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (kycFilter) params.kycStatus = kycFilter;

      const res = await api.get('/admin/merchants', { params });
      if (res.data?.success) {
        setMerchants(res.data.merchants || []);
      }
    } catch (err) {
      console.error('Failed to load merchants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKycStatusChange = async (merchantId, newStatus) => {
    try {
      const res = await api.patch(`/admin/merchants/${merchantId}/kyc`, { status: newStatus });
      if (res.data?.success) {
        setNotification({ type: 'success', message: `Merchant KYC updated to ${newStatus}` });
        fetchMerchants();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to update KYC' });
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustModal.amount || Number(adjustModal.amount) <= 0) return;

    setAdjustModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await api.post(`/admin/merchants/${adjustModal.merchant._id}/adjust-wallet`, {
        amount: Number(adjustModal.amount),
        type: adjustModal.type,
        description: adjustModal.description,
      });

      if (res.data?.success) {
        setNotification({ type: 'success', message: res.data.message });
        setAdjustModal({ isOpen: false, merchant: null, amount: '', type: 'CREDIT', description: '', submitting: false });
        fetchMerchants();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to adjust wallet balance' });
      setAdjustModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" /> Merchant Partner Management
          </h2>
          <p className="text-xs text-slate-500">
            Review KYC verifications, manage wallet balances, and monitor merchant dispatch volumes
          </p>
        </div>

        <button
          onClick={fetchMerchants}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchMerchants();
          }}
          className="relative flex-1 w-full"
        >
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search merchants by company name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-600"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden focus:border-indigo-600"
          >
            <option value="">All KYC Statuses</option>
            <option value="VERIFIED">KYC Verified Only</option>
            <option value="PENDING">KYC Pending Review</option>
            <option value="NOT_SUBMITTED">Not Submitted</option>
          </select>
        </div>
      </div>

      {/* Merchants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
            <p>Loading merchant directory...</p>
          </div>
        ) : merchants.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 space-y-2">
            <Users className="h-10 w-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No merchants found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Merchant Company</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">KYC Status</th>
                  <th className="px-5 py-3">Tax / Bank Info</th>
                  <th className="px-5 py-3">Wallet Balance</th>
                  <th className="px-5 py-3">Shipments</th>
                  <th className="px-5 py-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {merchants.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {m.companyName?.[0] || 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{m.companyName}</p>
                          <p className="text-[10px] text-slate-400">
                            ID: <span className="font-mono">{m.apiKeys?.clientId || m._id}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 space-y-0.5">
                      <p className="text-slate-700 font-medium flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-slate-400" /> {m.email}
                      </p>
                      <p className="text-slate-500 text-[11px] flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-slate-400" /> {m.phone}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          m.kyc?.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : m.kyc?.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {m.kyc?.status === 'VERIFIED' && <ShieldCheck className="h-3 w-3" />}
                        {m.kyc?.status || 'NOT_SUBMITTED'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-[11px] text-slate-600 space-y-0.5">
                      {m.kyc?.gstin && <p>GST: <span className="font-mono font-semibold">{m.kyc.gstin}</span></p>}
                      {m.kyc?.bankAccount?.accountNumber ? (
                        <p className="text-[10px] text-slate-500">
                          A/C: {m.kyc.bankAccount.accountNumber.slice(-4).padStart(m.kyc.bankAccount.accountNumber.length, '•')} ({m.kyc.bankAccount.ifsc})
                        </p>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No bank details</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-black text-slate-900 block">
                        ₹{m.walletBalance?.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-700">
                      {m.totalShipments || 0} Orders
                    </td>

                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* KYC toggle */}
                      {m.kyc?.status !== 'VERIFIED' ? (
                        <button
                          onClick={() => handleKycStatusChange(m._id, 'VERIFIED')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          Approve KYC
                        </button>
                      ) : (
                        <button
                          onClick={() => handleKycStatusChange(m._id, 'PENDING')}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-[11px] transition cursor-pointer"
                        >
                          Revoke KYC
                        </button>
                      )}

                      {/* Adjust Balance Button */}
                      <button
                        onClick={() =>
                          setAdjustModal({
                            isOpen: true,
                            merchant: m,
                            amount: '',
                            type: 'CREDIT',
                            description: '',
                            submitting: false,
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <IndianRupee className="h-3 w-3" /> Adjust Wallet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Wallet Balance Modal */}
      {adjustModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Adjust Merchant Wallet</h3>
                <p className="text-xs text-slate-500">{adjustModal.merchant?.companyName}</p>
              </div>
              <button
                onClick={() => setAdjustModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustModal((prev) => ({ ...prev, type: 'CREDIT' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      adjustModal.type === 'CREDIT'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <PlusCircle className="h-4 w-4 text-emerald-600" /> Credit (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustModal((prev) => ({ ...prev, type: 'DEBIT' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      adjustModal.type === 'DEBIT'
                        ? 'border-rose-600 bg-rose-50 text-rose-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MinusCircle className="h-4 w-4 text-rose-600" /> Debit (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹ INR)</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 5000"
                  value={adjustModal.amount}
                  onChange={(e) => setAdjustModal((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Promotional credits / COD adjustment"
                  value={adjustModal.description}
                  onChange={(e) => setAdjustModal((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustModal.submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {adjustModal.submitting ? 'Applying...' : 'Confirm Balance Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
