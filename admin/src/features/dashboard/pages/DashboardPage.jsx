import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  RotateCcw,
  Star,
  Plus,
  Sparkles,
  Image as BannerIcon,
  PieChart as PieIcon,
  AlertTriangle,
  ArrowUpRight,
  Percent,
  CreditCard,
  FolderTree,
  Activity,
  Zap,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  Server,
  UserPlus,
  Tag,
  QrCode,
  Smartphone,
  Globe,
} from 'lucide-react';
import { fetchDashboardStats } from '../dashboardSlice';
import StatCard from '../components/StatCard';
import SalesChart from '../components/SalesChart';
import RecentOrders from '../components/RecentOrders';
import Loader from '../../../components/Loader';
import getMediaUrl from '../../../utils/mediaUrl';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { kpis, chartData, recentOrders, topProducts, lowStockProducts, paymentMethodAgg, status, error } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (status === 'loading' && !kpis) return <Loader label="Loading dashboard metrics…" />;

  if (status === 'failed' && !kpis) {
    return (
      <div className="rounded-lg border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700">
        Failed to load dashboard: {error}
      </div>
    );
  }

  const productsList = topProducts || [];
  const lowStock = lowStockProducts || [];
  const totalOrdersCount = kpis?.totalOrders || 0;
  const totalRev = kpis?.totalRevenue || 0;
  const avgOrderVal = kpis?.avgOrderValue || (totalOrdersCount > 0 ? Math.round(totalRev / totalOrdersCount) : 0);

  const quickShortcuts = [
    { name: 'Products', count: `${kpis?.totalProducts ?? 0} Listed`, link: '/products', icon: Package, color: 'text-indigo-600 bg-indigo-50' },
    { name: 'Categories', count: `${kpis?.totalCategories ?? 11} Active`, link: '/categories', icon: FolderTree, color: 'text-amber-600 bg-amber-50' },
    { name: 'Orders', count: `${totalOrdersCount} Total`, link: '/orders', icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Coupons', count: `${kpis?.totalCoupons ?? 4} Promo`, link: '/coupons', icon: Percent, color: 'text-purple-600 bg-purple-50' },
    { name: 'Banners', count: `${kpis?.totalBanners ?? 4} Slides`, link: '/banners', icon: BannerIcon, color: 'text-rose-600 bg-rose-50' },
    { name: 'Payments', count: 'UPI & COD', link: '/payments', icon: CreditCard, color: 'text-cyan-600 bg-cyan-50' },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-lg bg-slate-900 text-white shadow-sm">
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />

        <div className="relative z-10 flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30 mb-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Production Store Active
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Welcome Back! 👋
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Here&apos;s your AMA-YAAR store overview — manage products, orders & analytics.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Performance Indicators (5 Stat Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={IndianRupee}
          tone="emerald"
          label="Total Revenue"
          value={`₹${totalRev.toLocaleString('en-IN')}`}
          trend={totalRev > 0 ? '+100%' : '₹0'}
          subtext="Updated live today"
        />
        <StatCard
          icon={ShoppingBag}
          tone="indigo"
          label="Total Orders"
          value={totalOrdersCount}
          trend={totalOrdersCount > 0 ? `${totalOrdersCount} Placed` : '0 Orders'}
          subtext="Orders processed"
        />
        <StatCard
          icon={Package}
          tone="amber"
          label="Total Products"
          value={kpis?.totalProducts ?? 0}
          trend="In Stock"
          subtext="Active listings"
        />
        <StatCard
          icon={Users}
          tone="purple"
          label="Total Customers"
          value={kpis?.totalUsers ?? 0}
          trend={kpis?.totalUsers > 0 ? `${kpis.totalUsers} Active` : '0 Users'}
          subtext="Registered users"
        />
        <StatCard
          icon={RotateCcw}
          tone="rose"
          label="Pending Returns"
          value={kpis?.pendingReturns ?? 0}
          trend={`${kpis?.pendingReturns ?? 0} Pending`}
          subtext="Returns & disputes"
        />
      </div>

      {/* 3. Conversion & Store Performance Insights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-md bg-white p-4 text-center shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Avg. Order Value</span>
          <p className="mt-1 text-lg font-black text-slate-900">₹{avgOrderVal.toLocaleString('en-IN')}</p>
          <span className="text-[10px] font-bold text-slate-400">{totalOrdersCount > 0 ? 'Live average' : 'Awaiting first order'}</span>
        </div>
        <div className="rounded-md bg-white p-4 text-center shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Active Listings</span>
          <p className="mt-1 text-lg font-black text-slate-900">{kpis?.totalProducts ?? 0}</p>
          <span className="text-[10px] font-bold text-emerald-600">Ready to sell</span>
        </div>
        <div className="rounded-md bg-white p-4 text-center shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Categories</span>
          <p className="mt-1 text-lg font-black text-slate-900">{kpis?.totalCategories ?? 11}</p>
          <span className="text-[10px] font-bold text-indigo-600">Active Collections</span>
        </div>
        <div className="rounded-md bg-white p-4 text-center shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Store Status</span>
          <p className="mt-1 text-lg font-black text-emerald-600">Online</p>
          <span className="text-[10px] font-bold text-emerald-600">Production Ready</span>
        </div>
      </div>

      {/* 4. Sales Analytics Chart & Top Rated Products Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left 2 Columns: Revenue Chart */}
        <div className="lg:col-span-2">
          <SalesChart data={chartData} />
        </div>

        {/* Right Column: Top Rated Products */}
        <div className="rounded-md bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Rated Products</h3>
            </div>
            <Link to="/products" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {productsList.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No products available</p>
            ) : (
              productsList.slice(0, 4).map((p) => (
                <div key={p._id || p.name} className="group flex items-center gap-3 p-1 rounded-md transition hover:bg-slate-50">
                  <img
                    src={getMediaUrl(p.image || p.images?.[0]) || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&q=80'}
                    alt={p.name}
                    className="h-10 w-10 rounded-md object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900">{p.name}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-0.5 font-bold text-amber-500">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {p.rating ? p.rating.toFixed(1) : '5.0'}
                      </span>
                      <span>• {p.numReviews || 0} reviews</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-xs font-bold text-slate-900">
                      ₹{p.price?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      Stock: {p.stock ?? 0}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Low Stock Alert & Shortcuts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Low Stock Widget */}
        <div className="rounded-md border border-amber-200/60 bg-amber-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Low Stock Warning</h3>
            </div>
            <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              {lowStock.length} Items Need Restock
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {lowStock.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">All products have sufficient inventory (&gt; 5 units)</p>
            ) : (
              lowStock.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-3 rounded-md bg-white p-2.5 border border-amber-200/60 shadow-xs">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900">{item.name}</p>
                    <p className="text-[11px] font-medium text-amber-600">Remaining Stock: {item.stock} units</p>
                  </div>
                  <Link
                    to="/products"
                    className="rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-600 transition shrink-0"
                  >
                    Restock
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Store Status & Architecture */}
        <div className="rounded-md bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Store Infrastructure Status</h3>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5">
              <p className="text-xs font-bold text-slate-700">Connected Database</p>
              <p className="text-sm font-mono font-bold text-indigo-600 mt-1">ama-yaar-prod</p>
              <p className="text-[11px] text-slate-400 mt-0.5">MongoDB Atlas Isolated Production Cluster</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5">
              <p className="text-xs font-bold text-slate-700">Payment Gateway</p>
              <p className="text-sm font-mono font-bold text-emerald-600 mt-1">Razorpay Live + COD</p>
              <p className="text-[11px] text-slate-400 mt-0.5">UPI, QR Code, Cards, NetBanking, COD</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5">
              <p className="text-xs font-bold text-slate-700">Logistics & Shipping</p>
              <p className="text-sm font-mono font-bold text-slate-800 mt-1">Shiprocket Integration</p>
              <p className="text-[11px] text-slate-400 mt-0.5">AWB Tracking & Doorstep Pickup</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5">
              <p className="text-xs font-bold text-slate-700">Media CDN</p>
              <p className="text-sm font-mono font-bold text-slate-800 mt-1">Cloudinary Pro</p>
              <p className="text-[11px] text-slate-400 mt-0.5">High-res 3D Looks, Reels & Product Assets</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Quick Management Shortcuts */}
      <div className="rounded-md bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Zap className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Management Shortcuts</h3>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {quickShortcuts.map((sc) => {
            const IconComp = sc.icon;
            return (
              <Link
                key={sc.name}
                to={sc.link}
                className="group flex flex-col items-center text-center p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 transition"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${sc.color} transition-transform group-hover:scale-110`}>
                  <IconComp className="h-5 w-5" />
                </div>
                <span className="mt-2 text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">{sc.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">{sc.count}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 7. Recent Store Orders Table */}
      <RecentOrders orders={recentOrders} />
    </div>
  );
}
