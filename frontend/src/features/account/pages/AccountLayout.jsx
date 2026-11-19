import { NavLink, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { User, MapPin, Package, Heart, ShieldCheck, LogOut, ChevronRight, Tag, RotateCcw, Bell, HelpCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../auth/authSlice';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/account/profile',        label: 'My Profile',    icon: User },
  { to: '/account/addresses',      label: 'My Addresses',  icon: MapPin },
  { to: '/account/orders',         label: 'My Orders',     icon: Package },
  { to: '/account/wishlist',       label: 'My Wishlist',   icon: Heart },
  { to: '/account/coupons',        label: 'My Coupons',    icon: Tag },
  { to: '/account/returns',        label: 'Returns',       icon: RotateCcw },
  { to: '/account/notifications',  label: 'Notifications', icon: Bell },
];

export default function AccountLayout() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen bg-neutral-50/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-8">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400 block mb-1">
            Account Settings
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
            MY ACCOUNT
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="rounded-xl border border-neutral-200/60 bg-white p-4 shadow-sm sticky top-24">

              {/* User Avatar & Info */}
              <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-black shadow-md shrink-0" style={{color:'#ffffff', letterSpacing:'0.08em'}}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-black">{user?.name}</p>
                  <p className="truncate text-[11px] text-neutral-500 font-medium">{user?.email}</p>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/60 rounded-lg px-3 py-2 mb-4">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold text-emerald-800">Verified Account</span>
              </div>

              {/* Navigation */}
              <nav className="space-y-0.5">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition-all duration-150 group ${
                        isActive
                          ? 'bg-black text-white shadow-sm'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                        <span className={`flex-1 text-[13px] font-bold ${isActive ? 'text-white' : 'text-neutral-800'}`}>
                          {label}
                        </span>
                        <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-neutral-300' : 'text-neutral-300 opacity-0 group-hover:opacity-100'} transition`} />
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* Logout */}
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full rounded-lg px-3.5 py-2.5 text-[13px] font-bold text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="md:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
