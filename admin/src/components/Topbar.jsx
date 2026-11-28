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
import socket, { joinAdminRoom } from '../lib/socket';
import api from '../lib/axios';
import { STORE_URL } from '../utils/storeUrl';

export default function Topbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [notificationsList, setNotificationsList] = useState([]);

  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // Load real notifications from backend on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications', { skipErrorToast: true });
        const list = res.data?.data?.notifications || [];
        if (list.length > 0) {
          setNotificationsList(
            list.map((n) => ({
              id: n._id,
              title: n.title,
              message: n.message,
              time: formatRelativeTime(n.createdAt),
              icon: n.type === 'newOrder' || n.type === 'order' ? Package : Sparkles,
              unread: !n.isRead,
            }))
          );
        }
      } catch (err) {
        console.warn('Failed to fetch admin notifications:', err.message);
      }
    };

    fetchNotifications();
  }, []);

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  useEffect(() => {
    joinAdminRoom();

    const handleNewOrder = (data) => {
      setNotificationsList((prev) => [
        {
          id: Date.now(),
          title: `New Order: #${data.orderNumber} (₹${data.total})`,
          message: `${data.customerName || 'Customer'} placed an order`,
          time: 'Just now',
          icon: Package,
          unread: true,
        },
        ...prev.slice(0, 19),
      ]);
    };

    const handleAdminNotif = (data) => {
      setNotificationsList((prev) => [
        {
          id: Date.now(),
          title: data.title || 'New Admin Alert',
          message: data.message || '',
          time: 'Just now',
          icon: Sparkles,
          unread: true,
        },
        ...prev.slice(0, 19),
      ]);
    };

    socket.on('order_placed', handleNewOrder);
    socket.on('new_admin_notification', handleAdminNotif);

    return () => {
      socket.off('order_placed', handleNewOrder);
      socket.off('new_admin_notification', handleAdminNotif);
    };
  }, []);

  const unreadCount = notificationsList.filter((n) => n.unread).length;

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
          href={STORE_URL}
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
                  {unreadCount > 0 && (
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold text-indigo-600">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <button
                  onClick={async () => {
                    try {
                      await api.patch('/notifications/all/read');
                    } catch (_) {}
                    setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Mark read
                </button>
              </div>

              <div className="mt-2 space-y-1">
                {notificationsList.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400 font-medium">
                    No new notifications
                  </p>
                ) : (
                  notificationsList.slice(0, 5).map((n) => {
                    const IconComp = n.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          setNotifOpen(false);
                          const t = (n.title || '').toLowerCase();
                          if (t.includes('order')) {
                            navigate('/orders');
                          } else if (t.includes('user') || t.includes('customer') || t.includes('login')) {
                            navigate('/customers');
                          } else {
                            navigate('/activity');
                          }
                        }}
                        className={`flex items-start gap-3 rounded-lg p-2 transition hover:bg-slate-50 cursor-pointer ${
                          n.unread ? 'bg-indigo-50/40' : ''
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
                  })
                )}
              </div>

              <div className="mt-2 border-t border-slate-100 pt-2 text-center">
                <Link
                  to="/activity"
                  onClick={() => setNotifOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  <span>View all activity</span>
                  {notificationsList.length > 5 && (
                    <span className="rounded bg-indigo-50 text-indigo-700 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                      {notificationsList.length}
                    </span>
                  )}
                  <span>&rarr;</span>
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
                  href={STORE_URL}
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
