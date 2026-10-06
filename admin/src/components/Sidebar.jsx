import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  ShoppingBag,
  Percent,
  Image,
  Video,
  Shirt,
  BookOpen,
  MessageSquare,
  CreditCard,
  RotateCcw,
  BarChart3,
  ExternalLink,
  Store,
  LogOut,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import AdminLogo from './AdminLogo';
import { logout } from '../features/auth/authSlice';

const NAV_GROUPS = [
  {
    title: 'MAIN',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'CATALOG & ORDERS',
    items: [
      { to: '/products', label: 'Products', icon: Package },
      { to: '/categories', label: 'Categories', icon: FolderTree },
      { to: '/orders', label: 'Orders', icon: ShoppingBag, badge: 'LIVE', badgeColor: 'bg-emerald-100 text-emerald-700' },
      { to: '/users', label: 'Users', icon: Users },
    ],
  },
  {
    title: 'MARKETING & CONTENT',
    items: [
      { to: '/coupons', label: 'Coupons', icon: Percent },
      { to: '/banners', label: 'Banners', icon: Image },
      { to: '/reels', label: 'Reels Manager', icon: Video },
      { to: '/editorial-looks', label: '3D Editorial Looks', icon: Shirt, badge: '3D', badgeColor: 'bg-amber-100 text-amber-800' },
      { to: '/blogs', label: 'Blog & Stories', icon: BookOpen },
    ],
  },
  {
    title: 'SUPPORT & SERVICE',
    items: [
      { to: '/contact-messages', label: 'Customer Messages', icon: MessageSquare, badge: 'NEW', badgeColor: 'bg-indigo-100 text-indigo-700' },
      { to: '/returns', label: 'Returns', icon: RotateCcw },
    ],
  },
  {
    title: 'FINANCE & REPORTS',
    items: [
      { to: '/payments', label: 'Payments', icon: CreditCard },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const [navSearch, setNavSearch] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Filter items based on sidebar search input
  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.label.toLowerCase().includes(navSearch.toLowerCase())
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white shadow-xs select-none">
      {/* 1. Brand Header */}
      <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5 py-3">
        <AdminLogo size="md" />
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm border border-slate-200">
          <ShieldCheck className="h-3 w-3 text-indigo-600" /> PRO
        </span>
      </div>

      {/* 2. Quick Menu Search */}
      <div className="px-3.5 pt-3 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            placeholder="Quick search menu..."
            className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 rounded-lg font-medium"
          />
        </div>
      </div>

      {/* 3. Grouped Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
        {filteredGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h4 className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {group.title}
            </h4>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end, badge, badgeColor }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs border-l-4 border-[#facc15]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? 'text-[#facc15]' : 'text-slate-400 group-hover:text-slate-700'
                          }`}
                        />
                        <span className="truncate">{label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border border-slate-200 ${
                              isActive ? 'bg-[#facc15] text-black border-transparent' : badgeColor || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {badge}
                          </span>
                        )}
                        {isActive && <div className="h-1.5 w-1.5 rounded-full bg-[#facc15]" />}
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* 4. Bottom User Profile & Actions Footer */}
      <div className="border-t border-slate-100 p-3.5 space-y-2 bg-slate-50/50">
        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-slate-900 text-[#facc15] flex items-center justify-center font-black text-xs shrink-0 border border-slate-800">
              AY
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.name || 'AMA YAAR Admin'}
              </p>
              <p className="text-[10px] font-medium text-slate-500 truncate">
                {user?.email || 'admin@amayaar.in'}
              </p>
            </div>
          </div>
        </div>

        {/* Store Link & Logout Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-100 py-2 px-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition"
            title="Open Customer Store"
          >
            <Store className="h-3.5 w-3.5 text-indigo-600" />
            <span>Store</span>
            <ExternalLink className="h-3 w-3 text-indigo-400" />
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-50 border border-rose-100 py-2 px-2 text-[11px] font-bold text-rose-600 hover:bg-rose-100 transition"
            title="Logout from Admin"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-600" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
