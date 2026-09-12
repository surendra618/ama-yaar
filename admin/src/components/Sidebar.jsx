import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  ShoppingBag,
  Percent,
  Image,
  CreditCard,
  RotateCcw,
  BarChart3,
  ExternalLink,
  Store,
  LogOut,
} from 'lucide-react';
import AdminLogo from './AdminLogo';
import { logout } from '../features/auth/authSlice';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/coupons', label: 'Coupons', icon: Percent },
  { to: '/banners', label: 'Banners', icon: Image },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/returns', label: 'Returns', icon: RotateCcw },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Brand Header */}
      <div className="flex h-18 items-center border-b border-slate-100 px-5 py-2">
        <AdminLogo size="md" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{label}</span>
                </div>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Footer Section: Store Link + Logout */}
      <div className="border-t border-slate-100 p-4 space-y-2.5">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 border border-slate-200/80 p-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition"
        >
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-indigo-600" />
            <span>Customer Store</span>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </a>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between gap-2 rounded-lg bg-rose-50 border border-rose-100 p-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
        >
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4 text-rose-600" />
            <span>Logout</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
