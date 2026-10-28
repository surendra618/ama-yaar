import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import {
  Users,
  Package,
  Truck,
  IndianRupee,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Sliders,
  DollarSign,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/overview');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 space-y-2">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-amber-500" />
        <p>Loading Super Admin Analytics...</p>
      </div>
    );
  }

  const merchants = data?.merchants || { total: 0, verified: 0 };
  const shipments = data?.shipments || { total: 0, delivered: 0, inTransit: 0, ndr: 0 };
  const financials = data?.financials || { totalWalletInCirculation: 0, totalDeliveredCod: 0 };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Platform Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                Super Admin Console
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" /> Network Master Hub
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white mt-1">
              LogixWave Platform Operations &amp; Merchant Hub
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Real-time monitoring across all onboarded merchants, multi-carrier SLAs (Delhivery, Blue Dart, DTDC, Shadowfax), system-wide profit margins, and COD remittance settlements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOverview}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Refresh Stats"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <Link
              to="/admin/carriers"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-sm"
            >
              Configure Master Carriers
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Merchants */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Merchants Network</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{merchants.total}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {merchants.verified} KYC Verified Merchants
            </p>
          </div>
          <Link
            to="/admin/merchants"
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            Manage Merchants &rarr;
          </Link>
        </div>

        {/* Card 2: Global Shipments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Network Shipments</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{shipments.total}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {shipments.inTransit} In Transit &bull; {shipments.delivered} Delivered
            </p>
          </div>
          <Link
            to="/admin/shipments"
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            View All Shipments &rarr;
          </Link>
        </div>

        {/* Card 3: Wallet Funds in Circulation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Wallet Circulation</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{financials.totalWalletInCirculation?.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Prepaid merchant balances held in escrow
            </p>
          </div>
          <Link
            to="/admin/rates"
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            Platform Margins &rarr;
          </Link>
        </div>

        {/* Card 4: Delivered COD Cash Pool */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivered COD Cash</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{financials.totalDeliveredCod?.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">
              Ready for merchant bank remittance
            </p>
          </div>
          <Link
            to="/admin/remittances"
            className="text-[11px] font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            Process Remittances &rarr;
          </Link>
        </div>
      </div>

      {/* Quick Admin Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/merchants"
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 transition shadow-xs hover:shadow-md space-y-2 cursor-pointer"
        >
          <div className="h-10 w-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white transition flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
            Merchant KYC &amp; Balance Top-Up
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review GSTIN/PAN proofs, approve or reject KYC documents, and manually credit or debit merchant wallets.
          </p>
        </Link>

        <Link
          to="/admin/carriers"
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition shadow-xs hover:shadow-md space-y-2 cursor-pointer"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-50 group-hover:bg-amber-600 text-amber-600 group-hover:text-white transition flex items-center justify-center font-bold">
            <Sliders className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition">
            Carrier API Master Keys
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Configure parent corporate credentials for Delhivery One, Blue Dart, DTDC, and Shadowfax.
          </p>
        </Link>

        <Link
          to="/admin/rates"
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 transition shadow-xs hover:shadow-md space-y-2 cursor-pointer"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white transition flex items-center justify-center font-bold">
            <IndianRupee className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition">
            Platform Margins &amp; COD Fees
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Adjust markup percentage added to courier base tariffs and set platform COD handling charges.
          </p>
        </Link>
      </div>

      {/* Recent Network Shipments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-black text-slate-900 tracking-tight">Recent Live Consignments</h4>
            <p className="text-xs text-slate-500">Latest shipments processed across all merchants</p>
          </div>
          <Link to="/admin/shipments" className="text-xs font-bold text-indigo-600 hover:underline">
            View All Shipments &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Order / Date</th>
                <th className="px-5 py-3">Merchant</th>
                <th className="px-5 py-3">Destination</th>
                <th className="px-5 py-3">Carrier / AWB</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentShipments?.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{s.orderNumber}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(s.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800">{s.merchant?.companyName || 'AMA YAAR Co.'}</p>
                    <p className="text-[10px] text-slate-400">{s.merchant?.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800">{s.buyer?.city}, {s.buyer?.state}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{s.buyer?.pincode}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {s.courier?.awbNumber ? (
                      <div>
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[11px]">
                          {s.courier.awbNumber}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{s.courier.carrier}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Pending Assignment
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-800">
                    ₹{s.payment?.subtotal}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      {s.payment?.mode === 'COD' ? 'COD' : 'Prepaid'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : s.status === 'NDR_FAILED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {s.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
