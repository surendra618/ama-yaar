import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Wallet,
  DollarSign,
  TrendingUp,
  Percent,
  AlertCircle,
  Building2,
  Check,
  ChevronRight,
} from 'lucide-react';
import api from '../../../lib/axios';
import DataTable from '../../../components/DataTable';
import Pagination from '../../../components/Pagination';

export default function CreatorsListPage() {
  const [creators, setCreators] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [tab, setTab] = useState('creators'); // 'creators' | 'payouts'
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });

  // Selected Creator detail modal
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionError, setActionError] = useState('');

  // Selected Payout processing modal
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [payoutStatus, setPayoutStatus] = useState('paid');
  const [paymentReference, setPaymentReference] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const res = await api.get('/creators/admin/list', {
        params: { status: statusFilter, search, page: pagination.page, limit: 15 },
      });
      setCreators(res.data?.data?.creators || []);
      setPagination(res.data?.data?.pagination || { page: 1, limit: 15, total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to load creators:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/creators/admin/payouts', {
        params: { page: pagination.page, limit: 15 },
      });
      setPayouts(res.data?.data?.payouts || []);
      setPagination(res.data?.data?.pagination || { page: 1, limit: 15, total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to load payouts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'creators') {
      fetchCreators();
    } else {
      fetchPayouts();
    }
  }, [tab, statusFilter, search, pagination.page]);

  const handleUpdateStatus = async (id, newStatus, reason = '') => {
    try {
      setStatusUpdating(true);
      setActionError('');
      await api.patch(`/creators/admin/${id}/status`, {
        status: newStatus,
        rejectionReason: reason,
        commissionRate: selectedCreator?.commissionRate,
        customerDiscountRate: selectedCreator?.customerDiscountRate,
      });
      setSelectedCreator(null);
      fetchCreators();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleProcessPayout = async (e) => {
    e.preventDefault();
    if (!selectedPayout) return;
    try {
      setStatusUpdating(true);
      await api.patch(`/creators/admin/payouts/${selectedPayout._id}`, {
        status: payoutStatus,
        paymentReference,
        adminNotes,
      });
      setSelectedPayout(null);
      setPaymentReference('');
      setAdminNotes('');
      fetchPayouts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process payout.');
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Creators &amp; Affiliates</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage creator applications, commission rules, attributed conversions, and bank payouts.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            onClick={() => { setTab('creators'); setPagination((p) => ({ ...p, page: 1 })); }}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
              tab === 'creators' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Creators &amp; Applications
          </button>
          <button
            onClick={() => { setTab('payouts'); setPagination((p) => ({ ...p, page: 1 })); }}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
              tab === 'payouts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payout Requests
          </button>
        </div>
      </div>

      {/* CREATORS TAB */}
      {tab === 'creators' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex items-center gap-2">
              {['all', 'submitted', 'approved', 'rejected', 'suspended'].map((st) => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setPagination((p) => ({ ...p, page: 1 })); }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, code, handle..."
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Creators Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10.5px] uppercase font-black text-slate-400 border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Creator</th>
                  <th className="py-3 px-3">Handle &amp; Platform</th>
                  <th className="py-3 px-3">Codes</th>
                  <th className="py-3 px-3">Commission</th>
                  <th className="py-3 px-3">Sales / Orders</th>
                  <th className="py-3 px-3">Wallet Available</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {creators.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      No creators found matching this filter.
                    </td>
                  </tr>
                ) : (
                  creators.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {c.name}
                        <span className="block text-[10px] font-normal text-slate-400">{c.email} &bull; {c.phone}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800">{c.primaryPlatform}</span>
                        <span className="block text-[10.5px] text-slate-500">{c.instagram || c.youtube || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10.5px]">
                          {c.creatorCode}
                        </span>
                        {c.couponCode && (
                          <span className="block font-mono text-[10px] text-amber-600 font-bold mt-0.5">
                            {c.couponCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold">
                        {c.commissionRate}%
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900">₹{(c.metrics?.sales || 0).toLocaleString('en-IN')}</span>
                        <span className="block text-[10px] text-slate-400">{c.metrics?.orders || 0} orders ({c.metrics?.clicks || 0} clicks)</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600">
                        ₹{(c.wallet?.available || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          c.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          c.status === 'submitted' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedCreator(c)}
                          className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1 text-[11px] font-bold uppercase transition"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
          />
        </div>
      )}

      {/* PAYOUTS TAB */}
      {tab === 'payouts' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10.5px] uppercase font-black text-slate-400 border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Requested At</th>
                  <th className="py-3 px-3">Creator</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Bank / UPI Destination</th>
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No payout requests found.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {p.creator?.name}
                        <span className="block text-[10px] text-slate-400 font-mono">{p.creator?.creatorCode}</span>
                      </td>
                      <td className="py-3 px-3 font-black text-sm text-slate-900">
                        ₹{p.amount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        {p.bankDetails?.upiId ? (
                          <span className="font-mono text-indigo-600 font-bold">UPI: {p.bankDetails.upiId}</span>
                        ) : (
                          <div>
                            <span className="font-mono text-slate-800 font-bold block">{p.bankDetails?.accountNumber}</span>
                            <span className="text-[10px] text-slate-400">{p.bankDetails?.bankName} ({p.bankDetails?.ifscCode})</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[10.5px] text-slate-500">
                        {p.paymentReference || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          p.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          p.status === 'requested' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {p.status === 'requested' && (
                          <button
                            onClick={() => setSelectedPayout(p)}
                            className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase transition"
                          >
                            Process
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creator Detail / Review Modal */}
      {selectedCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-xl w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Creator Application &amp; Settings</h3>
                <p className="text-xs text-slate-500">Review creator profile and customize commission rates.</p>
              </div>
              <button
                onClick={() => setSelectedCreator(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl">{actionError}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Name</span>
                <span className="font-bold text-slate-900">{selectedCreator.name}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Contact</span>
                <span className="font-medium text-slate-700">{selectedCreator.email} | {selectedCreator.phone}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Social Handle</span>
                <span className="font-bold text-slate-900">{selectedCreator.instagram || selectedCreator.youtube || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Followers</span>
                <span className="font-bold text-slate-900">{(selectedCreator.followerCount || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Referral Code</span>
                <span className="font-mono font-bold text-slate-900">{selectedCreator.creatorCode}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Discount Coupon</span>
                <span className="font-mono font-bold text-amber-600">{selectedCreator.couponCode}</span>
              </div>
            </div>

            {selectedCreator.bio && (
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Creator Bio / Pitch:</span>
                {selectedCreator.bio}
              </div>
            )}

            {/* Commission Settings Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  value={selectedCreator.commissionRate || 10}
                  onChange={(e) => setSelectedCreator({ ...selectedCreator, commissionRate: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Customer Discount (%)</label>
                <input
                  type="number"
                  value={selectedCreator.customerDiscountRate || 5}
                  onChange={(e) => setSelectedCreator({ ...selectedCreator, customerDiscountRate: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              {selectedCreator.status !== 'approved' && (
                <button
                  type="button"
                  disabled={statusUpdating}
                  onClick={() => handleUpdateStatus(selectedCreator._id, 'approved')}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition"
                >
                  Approve Creator &amp; Activate Coupon
                </button>
              )}
              {selectedCreator.status !== 'rejected' && (
                <button
                  type="button"
                  disabled={statusUpdating}
                  onClick={() => handleUpdateStatus(selectedCreator._id, 'rejected', 'Did not meet content criteria')}
                  className="rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 px-4 py-2 text-xs font-bold uppercase tracking-wider transition"
                >
                  Reject
                </button>
              )}
              {selectedCreator.status === 'approved' && (
                <button
                  type="button"
                  disabled={statusUpdating}
                  onClick={() => handleUpdateStatus(selectedCreator._id, 'suspended')}
                  className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wider transition"
                >
                  Suspend
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payout Processing Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Process Payout Transfer</h3>
            <p className="text-xs text-slate-500">
              Transfer <strong className="text-slate-900">₹{selectedPayout.amount}</strong> to{' '}
              <strong className="text-slate-900">{selectedPayout.creator?.name}</strong>.
            </p>

            <form onSubmit={handleProcessPayout} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={payoutStatus}
                  onChange={(e) => setPayoutStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="paid">Paid / Transferred</option>
                  <option value="rejected">Reject / Return to Balance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bank UTR / Transaction Reference *</label>
                <input
                  type="text"
                  required={payoutStatus === 'paid'}
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. UTR128490218402"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Notes (Optional)</label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes for record"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusUpdating}
                  className="rounded-xl bg-slate-900 hover:bg-black text-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
