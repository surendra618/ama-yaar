import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Bell,
  Package,
  MapPin,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { logout, checkAuth } from '../features/auth/authSlice';
import { fetchCart } from '../features/cart/cartSlice';
import { fetchWishlist } from '../features/wishlist/wishlistSlice';
import { fetchCategories } from '../features/products/productsSlice';
import { fetchNotifications, markNotificationRead } from '../features/notifications/notificationsSlice';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { itemCount } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    dispatch(checkAuth());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      dispatch(fetchNotifications());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setNotifMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) setNotifMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navLinks = [
    { label: 'SHOP', to: '/products' },
    { label: 'MEN', to: '/products?category=men' },
    { label: 'WOMEN', to: '/products?category=women' },
    { label: 'TRENDING', to: '/products?isTrending=true' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* Announcement strip */}
      <div className="bg-black px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white">
        Sign up and get 50% off your first order.{' '}
        <Link to="/register" className="font-bold underline underline-offset-2">
          Sign Up Now
        </Link>
      </div>

      {/* Main nav */}
      <nav className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          {/* Left: mobile toggle + nav links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-1 text-black md:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  className="text-sm font-bold tracking-wide text-black transition hover:text-black/60"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: logo */}
          <Link to="/" className="flex items-center leading-none">
            <img src="/logo.png" alt="AMA YAAR" className="h-14 w-auto object-contain" />
          </Link>

          {/* Right: secondary links + icons */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="hidden items-center gap-5 md:flex">
              <Link to="/products" className="text-sm font-bold tracking-wide text-black hover:text-black/60">
                CATEGORIES
              </Link>
              <Link to="/account/orders" className="text-sm font-bold tracking-wide text-black hover:text-black/60">
                STORIES
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen((v) => !v)} className="text-black md:hidden" aria-label="Search">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <form onSubmit={handleSearch} className="relative hidden lg:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-32 border-b border-transparent bg-transparent py-1 pl-6 text-xs text-black placeholder-black/40 focus:border-black focus:outline-none"
              />
              <Search className="pointer-events-none absolute left-0 top-1 h-4 w-4 text-black" />
            </form>

            {isAuthenticated && (
              <div className="relative" ref={notifMenuRef}>
                <button
                  onClick={() => setNotifMenuOpen((v) => !v)}
                  className="relative text-black"
                  title="Notifications"
                >
                  <Bell className="h-[20px] w-[20px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500" />
                  )}
                </button>

                {notifMenuOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-lg bg-white p-3 shadow-2xl ring-1 ring-black/10">
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <h4 className="text-sm font-bold text-black">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => dispatch(markNotificationRead('all'))}
                          className="text-xs font-semibold text-black/60 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 divide-y divide-black/5 overflow-y-auto py-1">
                      {notifications.length === 0 ? (
                        <p className="py-4 text-center text-xs text-black/40">No notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => dispatch(markNotificationRead(n._id))}
                            className={`cursor-pointer rounded-lg p-2.5 text-xs transition hover:bg-black/5 ${!n.isRead ? 'bg-amber-50/60' : ''
                              }`}
                          >
                            <p className="font-semibold text-black">{n.title}</p>
                            <p className="mt-0.5 text-black/60">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1 text-black"
                >
                  <User className="h-[20px] w-[20px]" />
                  <ChevronDown className="hidden h-3 w-3 sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-52 rounded-lg bg-white p-2 shadow-2xl ring-1 ring-black/10">
                    <div className="border-b border-black/10 p-3">
                      <p className="truncate text-xs font-bold text-black">{user?.name}</p>
                      <p className="truncate text-[11px] text-black/50">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/account/profile" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-black hover:bg-black/5">
                        <User className="h-4 w-4" /> My Profile
                      </Link>
                      <Link to="/account/orders" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-black hover:bg-black/5">
                        <Package className="h-4 w-4" /> My Orders
                      </Link>
                      <Link to="/account/addresses" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-black hover:bg-black/5">
                        <MapPin className="h-4 w-4" /> Addresses
                      </Link>
                    </div>
                    <div className="border-t border-black/10 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-black" title="Sign In">
                <User className="h-[20px] w-[20px]" />
              </Link>
            )}

            <Link to="/account/wishlist" className="relative hidden text-black sm:block" title="Wishlist">
              <svg viewBox="0 0 24 24" fill="none" className="h-[20px] w-[20px]">
                <path
                  d="M12 21s-7.5-4.6-10-9.1C.5 8.6 2 5 5.6 5c2 0 3.4 1 4.4 2.4C11 6 12.4 5 14.4 5 18 5 19.5 8.6 22 11.9 19.5 16.4 12 21 12 21z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative text-black" title="Cart">
              <ShoppingBag className="h-[20px] w-[20px]" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-black/10 bg-white p-4 md:hidden">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-black/20 py-2 pl-10 pr-4 text-xs focus:border-black focus:outline-none"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-black/40" />
            </form>
            <div className="space-y-1">
              {navLinks.map((l) => (
                <Link key={l.label} to={l.to} className="block rounded-lg px-3 py-2 text-sm font-bold text-black hover:bg-black/5">
                  {l.label}
                </Link>
              ))}
              <Link to="/products" className="block rounded-lg px-3 py-2 text-sm font-bold text-black hover:bg-black/5">
                CATEGORIES
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
