import { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  Search,
  Store,
  Sparkles,
  User,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { logout } from '../features/auth/authSlice';
import AdminLogo from './AdminLogo';

export default function Topbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const SAMPLE_NOTIFICATIONS = [
    { id: 1, title: 'New order #1049 received', time: '5m ago', icon: Package, unread: true },
    { id: 2, title: 'Product stock low: Oversized Tee', time: '1h ago', icon: Sparkles, unread: true },
    { id: 3, title: 'Payment verified for #1045', time: '3h ago', icon: CheckCircle2, unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Left side: Hamburger button + Logo (Mobile) + Search Bar */}
      <div className="flex items-center gap-4">
        {/* Toggle button for Sidebar (mobile) */}
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 transition md:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Logo View */}
        <div className="md:hidden">
          <AdminLogo size="sm" />
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, orders, users..."
            className="w-64 lg:w-80 rounded-md border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-12 text-xs font-medium text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <div className="pointer-events-none absolute right-2.5 top-2 flex items-center gap-0.5 rounded-md bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
            <span>⌘K</span>
          </div>
        </form>
      </div>

      {/* Right side: Store View Button + Notifications + User Menu */}
      <div className="flex items-center gap-3">

        {/* View Customer Store button */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50/60 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100/80 transition"
          title="Open Customer Front Store"
        >
          <Store className="h-3.5 w-3.5" />
          <span>Live Store</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className={`relative rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 ${notifOpen ? 'bg-slate-100 text-indigo-600' : ''
              }`}
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 z-50 mt-2 w-72 rounded-md bg-white p-3 shadow-lg ring-1 ring-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold text-indigo-600">
                    2 New
                  </span>
                </div>
                <button className="text-[11px] font-semibold text-indigo-600 hover:underline">Mark read</button>
              </div>

              <div className="mt-2 space-y-1">
                {SAMPLE_NOTIFICATIONS.map((n) => {
                  const IconComp = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 rounded-md p-2.5 transition hover:bg-slate-50 cursor-pointer ${n.unread ? 'bg-indigo-50/30' : ''
                        }`}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <IconComp className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-800">{n.title}</p>
                        <p className="text-[10px] font-medium text-slate-400">{n.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 border-t border-slate-100 pt-2 text-center">
                <Link to="/orders" className="text-xs font-bold text-indigo-600 hover:underline">
                  View all activity &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md border border-slate-200/60 bg-slate-50 py-1 pl-1.5 pr-2.5 text-slate-700 hover:bg-slate-100 transition shadow-xs"
          >
            {/* Avatar Circle with Badge */}
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-xs font-black text-white">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>

            <div className="hidden flex-col items-start leading-none sm:flex">
              <span className="text-xs font-bold text-slate-900">Admin</span>
              <span className="text-[9px] font-bold text-indigo-600">Super Admin</span>
            </div>

            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-md bg-white p-2 shadow-xl ring-1 ring-slate-900/10 animate-in fade-in zoom-in-95 duration-150">
              <div className="border-b border-slate-100 p-3 bg-slate-50/60 rounded-md mb-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <p className="truncate text-xs font-bold text-slate-900">Admin</p>
                </div>
                <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{user?.email || 'admin@amayaar.in'}</p>
              </div>

              <div className="space-y-0.5">
                <a
                  href="http://localhost:5173"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <Store className="h-4 w-4 text-slate-400" /> View Store Front
                </a>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
