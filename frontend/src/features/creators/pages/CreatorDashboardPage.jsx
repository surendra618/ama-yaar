import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Sparkles,
  TrendingUp,
  Percent,
  Wallet,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Clock,
  ArrowUpRight,
  Package,
  AlertCircle,
  Building2,
  QrCode,
  DollarSign,
  ChevronRight,
  Eye,
} from 'lucide-react';
import api from '../../../lib/axios';
import Loader from '../../../components/Loader';
import { getMediaUrl } from '../../../utils/mediaUrl';

export default function CreatorDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Payout Request State
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState('');

  // Bank Form State
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/creators/dashboard');
      setData(res.data?.data);
      if (res.data?.data?.creator?.bankDetails) {
        setBankForm(res.data.data.creator.bankDetails);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/pages/creator-application');
        return;
      }
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load Creator Studio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-black text-white">
        <div className="max-w-md w-full rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 text-center space-y-5">
          <div className="h-16 w-16 rounded-full bg-neutral-800 text-white flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Amayaar Creator Studio
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mt-1">
              Creator Login Required
            </h2>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Sign in with your creator account to access your live links, coupon codes, audience analytics, and commission wallet.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              to="/creator/login"
              className="w-full inline-flex items-center justify-center rounded-xl bg-white text-black py-3.5 text-xs font-black uppercase tracking-wider hover:bg-neutral-200 transition active:scale-98 shadow-lg"
            >
              Sign In to Creator Studio
            </Link>
            <Link
              to="/pages/creator-application"
              className="w-full inline-flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900/60 py-3 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
            >
              Apply as a Creator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader size="lg" label="Loading Creator Studio..." minHeight="min-h-[70vh]" />;
  }

  const creator = data?.creator;
  const stats = data?.stats || {};
  const wallet = data?.wallet || {};
  const transactions = data?.transactions || [];
  const payouts = data?.payouts || [];
  const promoProducts = data?.promoProducts || [];

  const storeOrigin = window.location.origin;
  const primaryRefLink = `${storeOrigin}?ref=${creator?.creatorCode || ''}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    try {
      await api.put('/creators/bank-details', bankForm);
      setBankModalOpen(false);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save bank details.');
    }
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    setPayoutMsg('');
    try {
      setPayoutSubmitting(true);
      await api.post('/creators/payout-request', { amount: Number(payoutAmount) });
      setPayoutModalOpen(false);
      setPayoutAmount('');
      fetchDashboard();
    } catch (err) {
      setPayoutMsg(err.response?.data?.message || 'Failed to request payout.');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-12 selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Amayaar Creator Studio
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                creator?.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                creator?.status === 'submitted' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-neutral-800 text-neutral-400'
              }`}>
                {creator?.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
              Welcome back, {creator?.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setBankModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs font-bold text-neutral-300 hover:text-white hover:border-neutral-700 transition"
            >
              <Building2 className="h-3.5 w-3.5" /> Payout Settings
            </button>
            <button
              onClick={() => setPayoutModalOpen(true)}
              disabled={wallet.available < 500}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white text-black px-5 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              <Wallet className="h-3.5 w-3.5" /> Request Payout
            </button>
          </div>
        </div>

        {/* Notice if Under Review */}
        {creator?.status !== 'approved' && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex items-start gap-3.5">
            <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide text-amber-300">
                Application Under Review
              </h4>
              <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                Your profile is currently being reviewed by our partnerships team. You will be notified as soon as your custom discount code and commission tracking are fully active.
              </p>
            </div>
          </div>
        )}

        {/* Tracking Code & Promo Assets Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Tracking Link */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Your Unique Tracking Link (30-Day Attribution)
              </span>
              <div className="mt-2 flex items-center justify-between rounded-xl bg-black border border-neutral-800 px-3.5 py-2.5">
                <span className="text-xs font-mono text-neutral-300 truncate mr-2">
                  {primaryRefLink}
                </span>
                <button
                  onClick={() => copyToClipboard(primaryRefLink, 'link')}
                  className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-white bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1.5 rounded-lg transition shrink-0"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-neutral-500 mt-3 font-medium">
              Share in your Instagram Bio, YouTube descriptions, or Story swipe-ups.
            </p>
          </div>

          {/* Exclusive Coupon Code */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Audience Discount Code ({creator?.customerDiscountRate || 5}% Off for Buyers)
              </span>
              <div className="mt-2 flex items-center justify-between rounded-xl bg-black border border-neutral-800 px-3.5 py-2.5">
                <span className="text-xs font-mono font-black text-amber-400 tracking-wider">
                  {creator?.couponCode || 'GENERATING'}
                </span>
                <button
                  onClick={() => copyToClipboard(creator?.couponCode, 'code')}
                  className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-white bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1.5 rounded-lg transition shrink-0"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedCode ? 'Copied' : 'Copy Code'}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-neutral-500 mt-3 font-medium">
              Customers receive a discount at checkout and you earn a {creator?.commissionRate || 10}% commission.
            </p>
          </div>
        </div>

        {/* Performance Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Total Clicks</span>
            <p className="text-2xl font-black text-white mt-1">{stats.clicks?.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Attributed Orders</span>
            <p className="text-2xl font-black text-white mt-1">{stats.orders?.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Total Sales</span>
            <p className="text-2xl font-black text-white mt-1">₹{stats.sales?.toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Conversion Rate</span>
            <p className="text-2xl font-black text-white mt-1">{stats.conversionRate}</p>
          </div>
        </div>

        {/* Wallet & Commission Ledger Breakdown */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-amber-500/40 bg-neutral-900/90 p-5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Available Wallet</span>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Ready</span>
            </div>
            <p className="text-2xl font-black text-amber-400 mt-1">₹{(wallet.available || 0).toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-neutral-500 mt-1">Eligible for instant withdrawal (Min ₹500)</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Pending Clearance</span>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">Transit</span>
            </div>
            <p className="text-2xl font-black text-neutral-200 mt-1">₹{(wallet.pending || 0).toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-neutral-500 mt-1">Orders awaiting delivery validation</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Total Paid Out</span>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Completed</span>
            </div>
            <p className="text-2xl font-black text-emerald-400 mt-1">₹{(wallet.paid || 0).toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-neutral-500 mt-1">Successfully transferred to bank/UPI</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Reversed</span>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">Adjusted</span>
            </div>
            <p className="text-2xl font-black text-neutral-400 mt-1">₹{(wallet.reversed || 0).toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-neutral-500 mt-1">From cancelled orders or refunds</p>
          </div>
        </div>

        {/* Promo Drops Catalog (Quick Link Generator) */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Generate Deep Links for Drops
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Copy direct tracked links for specific streetwear fits to feature in your posts.
              </p>
            </div>
            <Link to="/products" className="text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-1">
              All Products &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            {promoProducts.map((p) => {
              const productLink = `${storeOrigin}/products/${p.slug}?ref=${creator?.creatorCode}`;
              return (
                <div key={p._id} className="rounded-xl border border-neutral-800 bg-black/60 p-2.5 flex flex-col justify-between">
                  <div className="aspect-square rounded-lg overflow-hidden bg-neutral-900 mb-2">
                    <img
                      src={getMediaUrl(p.images?.[0])}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h4 className="text-[11px] font-bold text-white truncate">{p.name}</h4>
                  <p className="text-[11px] font-black text-neutral-400 mt-0.5">₹{p.price}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(productLink);
                      alert(`Tracked product link copied! \n${productLink}`);
                    }}
                    className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-900 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
                  >
                    Copy Link
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-Column: Attributed Orders & Payout History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Attributed Orders */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Recent Attributed Commissions
            </h3>
            {transactions.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">No orders recorded yet. Share your link to start earning!</p>
            ) : (
              <div className="space-y-2.5">
                {transactions.map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-black/50 p-3.5">
                    <div>
                      <p className="text-xs font-bold text-white">Order #{tx.orderNumber || 'AMY'}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Sale: ₹{tx.eligibleOrderValue} &bull; Rate: {tx.commissionRate}%
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 block">+₹{tx.commissionAmount}</span>
                      <span className="text-[9px] font-bold uppercase text-neutral-500">{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payout History */}
          <div className="lg:col-span-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Payout Requests
            </h3>
            {payouts.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">No payout requests submitted yet.</p>
            ) : (
              <div className="space-y-2.5">
                {payouts.map((py) => (
                  <div key={py._id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-black/50 p-3.5">
                    <div>
                      <p className="text-xs font-bold text-white">₹{py.amount?.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {new Date(py.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        py.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                        py.status === 'requested' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-neutral-800 text-neutral-400'
                      }`}>
                        {py.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Payout Request Modal */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="max-w-md w-full rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
            <h3 className="text-base font-black uppercase tracking-wide text-white">Request Payout</h3>
            <p className="text-xs text-neutral-400">
              Available for withdrawal: <strong className="text-white font-black">₹{wallet.available}</strong> (Min ₹500)
            </p>

            {payoutMsg && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{payoutMsg}</p>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  min="500"
                  max={wallet.available}
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full rounded-xl border border-neutral-800 bg-black p-3 text-xs font-semibold text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="rounded-xl border border-neutral-800 px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutSubmitting}
                  className="rounded-xl bg-white text-black px-5 py-2 text-xs font-black uppercase tracking-wider hover:bg-neutral-200 transition"
                >
                  {payoutSubmitting ? 'Requesting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      {bankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="max-w-md w-full rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
            <h3 className="text-base font-black uppercase tracking-wide text-white">Bank &amp; UPI Details</h3>
            <p className="text-xs text-neutral-400">
              Your payout details are encrypted and securely stored for transfer settlements.
            </p>

            <form onSubmit={handleSaveBank} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">UPI ID (Fastest)</label>
                <input
                  type="text"
                  value={bankForm.upiId || ''}
                  onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                  placeholder="yourname@okhdfcbank"
                  className="w-full rounded-xl border border-neutral-800 bg-black p-3 text-xs font-semibold text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="text-center text-[10px] uppercase font-bold text-neutral-500 py-1">— OR BANK ACCOUNT —</div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={bankForm.accountHolderName || ''}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  placeholder="Account name"
                  className="w-full rounded-xl border border-neutral-800 bg-black p-3 text-xs font-semibold text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankForm.accountNumber || ''}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  placeholder="Bank account number"
                  className="w-full rounded-xl border border-neutral-800 bg-black p-3 text-xs font-semibold text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={bankForm.ifscCode || ''}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="HDFC000..."
                    className="w-full rounded-xl border border-neutral-800 bg-black p-3 text-xs font-semibold text-white uppercase focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankForm.bankName || ''}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    placeholder="HDFC Bank"
                    className="w-full rounded-xl border border-neutral-800 bg-black p-3 text-xs font-semibold text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setBankModalOpen(false)}
                  className="rounded-xl border border-neutral-800 px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-white text-black px-5 py-2 text-xs font-black uppercase tracking-wider hover:bg-neutral-200 transition"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
