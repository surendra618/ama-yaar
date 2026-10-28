import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Calculator,
  Warehouse,
  Wallet,
  AlertTriangle,
  Code2,
  Search,
  FileText,
  Users,
  Sliders,
  Percent,
  DollarSign,
  Crown,
  ArrowLeft,
  ArrowRight,
  Lock,
} from 'lucide-react';

const merchantNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shipments', label: 'Shipments & Orders', icon: Package },
  { to: '/manifests', label: 'Handover Manifests', icon: FileText },
  { to: '/create-order', label: 'Create Order', icon: PlusCircle },
  { to: '/rate-calculator', label: 'Rate Calculator', icon: Calculator },
  { to: '/warehouses', label: 'Warehouses / Pickup', icon: Warehouse },
  { to: '/wallet', label: 'Wallet & Billing', icon: Wallet },
  { to: '/ndr', label: 'NDR & Returns', icon: AlertTriangle },
  { to: '/developers', label: 'API & Webhooks', icon: Code2 },
  { to: '/track-shipment', label: 'Public Tracking', icon: Search },
];

const adminNavItems = [
  { to: '/admin', label: 'Admin Overview', icon: Crown },
  { to: '/admin/merchants', label: 'Merchants & KYC', icon: Users },
  { to: '/admin/carriers', label: 'Master Carriers API', icon: Sliders },
  { to: '/admin/rates', label: 'Platform Margins', icon: Percent },
  { to: '/admin/shipments', label: 'Global Shipments', icon: Package },
  { to: '/admin/remittances', label: 'COD Remittances', icon: DollarSign },
];

export default function Sidebar() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { openSwitchModal } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 select-none overflow-y-auto custom-scrollbar">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80 shrink-0">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-white text-base shadow-xs ${
              isAdminRoute ? 'bg-amber-500 text-slate-950' : 'bg-indigo-600 text-white'
            }`}
          >
            {isAdminRoute ? '★' : '▲'}
          </div>
          <div>
            <h1 className="font-black text-white text-base tracking-tight leading-none flex items-center gap-1.5">
              LOGIXWAVE
              <span
                className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                  isAdminRoute ? 'bg-amber-400 text-slate-950' : 'bg-indigo-600 text-white'
                }`}
              >
                {isAdminRoute ? 'ROOT' : 'OS'}
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wider font-medium">
              {isAdminRoute ? 'Super Admin Portal' : 'Multi-Courier Aggregator'}
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Section based on Current Context */}
        <div className="p-3">
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider flex items-center justify-between">
            <span className={isAdminRoute ? 'text-amber-400' : 'text-slate-400'}>
              {isAdminRoute ? 'Super Admin Navigation' : 'Merchant Operations'}
            </span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                isAdminRoute ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isAdminRoute ? 'ADMIN' : 'MERCHANT'}
            </span>
          </div>

          <nav className="space-y-1">
            {isAdminRoute ? (
              // SUPER ADMIN MENUS ONLY
              adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'text-amber-200/80 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })
            ) : (
              // MERCHANT MENUS ONLY
              merchantNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })
            )}
          </nav>
        </div>

        {/* Portal Switch Button with ID/Password Modal Trigger */}
        <div className="px-4 py-2">
          {isAdminRoute ? (
            <button
              type="button"
              onClick={() => openSwitchModal('merchant')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
              <span>Switch to Merchant Console</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openSwitchModal('admin')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span>Switch to Super Admin</span>
              <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Integrated Carriers Footer */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-[11px] space-y-2 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Integrated Carriers</p>
        <div className="flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-300">
          <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">Delhivery</span>
          <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">Blue Dart</span>
          <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">DTDC</span>
          <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">Shadowfax</span>
        </div>
        <p className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> 4 Master Gateways Active
        </p>
      </div>
    </aside>
  );
}
