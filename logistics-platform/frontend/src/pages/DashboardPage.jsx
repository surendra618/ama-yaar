import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Calculator,
  Wallet,
  ArrowUpRight,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';
import AssignCourierModal from '../components/AssignCourierModal';
import SimulateModal from '../components/SimulateModal';

export default function DashboardPage() {
  const { merchant, walletBalance } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [simulateShipment, setSimulateShipment] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shipments?limit=6');
      if (res.data?.success) {
        setShipments(res.data.shipments || []);
        setStats(res.data.stats || {});
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Shipments', val: stats?.TOTAL || 0, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Ready to Ship', val: stats?.READY_TO_SHIP || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'In Transit', val: stats?.IN_TRANSIT || 0, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Out for Delivery', val: stats?.OUT_FOR_DELIVERY || 0, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Delivered', val: stats?.DELIVERED || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'NDR Exceptions', val: stats?.NDR_FAILED || 0, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight">
            Welcome back, {merchant?.companyName || 'Merchant'}!
          </h2>
          <p className="text-xs text-slate-300">
            Multi-carrier automated routing active &bull; Integrated with Delhivery, Blue Dart, DTDC, and Shadowfax
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/rate-calculator"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer backdrop-blur-xs"
          >
            <Calculator className="h-4 w-4" /> Compare Rates
          </Link>
          <Link
            to="/create-order"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-indigo-500/25"
          >
            <PlusCircle className="h-4 w-4" /> Create Shipment
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{c.label}</span>
                <div className={`h-7 w-7 rounded-lg ${c.bg} ${c.color} flex items-center justify-center`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">{c.val}</p>
            </div>
          );
        })}
      </div>

      {/* Carrier Performance & SLA Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Carrier Routing SLA &amp; Efficiency</h3>
              <p className="text-xs text-slate-500">Live delivery success rates across partner networks</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Auto-Routing Enabled
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { carrier: 'Delhivery Surface', rating: '97.4%', badge: 'Most Consistent', color: 'border-l-indigo-500' },
              { carrier: 'Blue Dart Ground', rating: '98.6%', badge: 'Fastest SLA', color: 'border-l-blue-500' },
              { carrier: 'DTDC DotZot', rating: '94.2%', badge: 'Tier-2 Coverage', color: 'border-l-amber-500' },
              { carrier: 'Shadowfax Flash', rating: '96.1%', badge: 'Best COD Surcharge', color: 'border-l-emerald-500' },
            ].map((item) => (
              <div key={item.carrier} className={`p-3.5 rounded-xl bg-slate-50 border border-slate-200 border-l-4 ${item.color} space-y-1`}>
                <p className="text-xs font-black text-slate-900">{item.carrier}</p>
                <p className="text-lg font-black text-slate-800 font-mono">{item.rating}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{item.badge}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Wallet Summary Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase tracking-wide">
              <Wallet className="h-4 w-4 text-emerald-600" />
              <span>Logistics Operating Wallet</span>
            </div>
            <p className="text-3xl font-black text-slate-900 font-mono">
              ₹{Number(walletBalance || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500">
              Covers shipping freight, COD fees, and RTO protection across all 4 carriers.
            </p>
          </div>

          <Link
            to="/wallet"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <span>Manage Balance &amp; Transactions</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Recent Shipments Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Recent Shipments</h3>
            <p className="text-xs text-slate-500">Orders pushed for automated multi-carrier delivery</p>
          </div>
          <Link
            to="/shipments"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All Shipments &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Order Details</th>
                <th className="px-5 py-3">Recipient</th>
                <th className="px-5 py-3">Carrier / AWB</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shipments.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">#{s.orderNumber}</p>
                    <p className="text-[11px] text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-800">{s.buyer.name}</p>
                    <p className="text-[11px] text-slate-500">{s.buyer.city}, {s.buyer.pincode}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {s.courier?.awbNumber ? (
                      <div>
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-[11px]">
                          {s.courier.awbNumber}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{s.courier.carrier}</p>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-semibold">Pending Allocation</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        s.payment.mode === 'COD'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {s.payment.mode === 'COD' ? `COD ₹${s.payment.collectableAmount}` : 'Prepaid'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        s.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : s.status === 'NDR_FAILED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : s.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : s.status === 'IN_TRANSIT'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : s.status === 'READY_TO_SHIP'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    {s.status === 'READY_TO_SHIP' ? (
                      <button
                        onClick={() => setSelectedShipment(s)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition cursor-pointer"
                      >
                        Assign Courier
                      </button>
                    ) : (
                      <button
                        onClick={() => setSimulateShipment(s)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                        title="Simulate Next Status"
                      >
                        Simulate &rarr;
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedShipment && (
        <AssignCourierModal
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
          onSuccess={() => fetchDashboardData()}
        />
      )}

      {simulateShipment && (
        <SimulateModal
          shipment={simulateShipment}
          onClose={() => setSimulateShipment(null)}
          onSuccess={() => fetchDashboardData()}
        />
      )}
    </div>
  );
}
