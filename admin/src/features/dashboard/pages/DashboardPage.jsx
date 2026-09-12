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

const MOCK_TOP_PRODUCTS = [
  {
    _id: 'prod_1',
    name: 'Oversized Printed Graphic Tee',
    price: 1299,
    rating: 4.9,
    numReviews: 128,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80',
    sales: 142,
  },
  {
    _id: 'prod_2',
    name: 'Acid Wash Denim Shirt',
    price: 1899,
    rating: 4.8,
    numReviews: 94,
    image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=200&q=80',
    sales: 98,
  },
  {
    _id: 'prod_3',
    name: 'Polo Collar Casual T-Shirt',
    price: 1499,
    rating: 4.9,
    numReviews: 210,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&q=80',
    sales: 84,
  },
  {
    _id: 'prod_4',
    name: 'Henley Collar Streetwear Shirt',
    price: 1699,
    rating: 4.7,
    numReviews: 76,
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=200&q=80',
    sales: 76,
  },
];

const CATEGORY_SHARE = [
  { name: 'Oversized Printed', percentage: 45, color: 'bg-indigo-600', sales: '₹28,400' },
  { name: 'Acid Wash Shirts', percentage: 28, color: 'bg-amber-500', sales: '₹17,800' },
  { name: 'Polo T-Shirts', percentage: 18, color: 'bg-emerald-500', sales: '₹11,200' },
  { name: 'Henley Shirts', percentage: 9, color: 'bg-purple-500', sales: '₹5,700' },
];

const LOW_STOCK_ITEMS = [
  { name: 'Oversized Printed Tee - Black (L)', stock: 3, id: '1' },
  { name: 'Acid Wash Denim Shirt - Blue (M)', stock: 2, id: '2' },
  { name: 'Polo T-Shirt - White (XL)', stock: 4, id: '3' },
];

const LIVE_ACTIVITY = [
  { id: 1, title: 'New order #AY-8924 placed by Vansh Singh', time: '5 mins ago', icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-50' },
  { id: 2, title: 'Payment of ₹2,499 verified via UPI', time: '12 mins ago', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  { id: 3, title: 'New customer account created: Rahul Sharma', time: '28 mins ago', icon: UserPlus, color: 'text-purple-600 bg-purple-50' },
  { id: 4, title: 'Coupon SUMMER50 redeemed on order #AY-8921', time: '1 hour ago', icon: Tag, color: 'text-amber-600 bg-amber-50' },
];

const QUICK_SHORTCUTS = [
  { name: 'Products', count: '8 Items', link: '/products', icon: Package, color: 'text-indigo-600 bg-indigo-50' },
  { name: 'Categories', count: '4 Active', link: '/categories', icon: FolderTree, color: 'text-amber-600 bg-amber-50' },
  { name: 'Orders', count: '2 Pending', link: '/orders', icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50' },
  { name: 'Coupons', count: '3 Promo', link: '/coupons', icon: Percent, color: 'text-purple-600 bg-purple-50' },
  { name: 'Banners', count: '2 Slides', link: '/banners', icon: BannerIcon, color: 'text-rose-600 bg-rose-50' },
  { name: 'Payments', count: 'UPI & COD', link: '/payments', icon: CreditCard, color: 'text-cyan-600 bg-cyan-50' },
];

const TOP_CITIES = [
  { city: 'Mumbai', share: 38, amount: '₹24,050' },
  { city: 'Delhi NCR', share: 26, amount: '₹16,450' },
  { city: 'Bangalore', share: 20, amount: '₹12,660' },
  { city: 'Ahmedabad & Others', share: 16, amount: '₹10,140' },
];

const PAYMENT_METHODS = [
  { method: 'UPI / QR Code', share: 64, color: 'bg-emerald-500' },
  { method: 'Credit & Debit Cards', share: 22, color: 'bg-indigo-600' },
  { method: 'Cash on Delivery (COD)', share: 14, color: 'bg-amber-500' },
];

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { kpis, chartData, recentOrders, topProducts, status, error } = useSelector((state) => state.dashboard);

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

  const productsList = topProducts && topProducts.length > 0 ? topProducts : MOCK_TOP_PRODUCTS;

  return (
    <div className="space-y-5">

      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-lg bg-slate-900 text-white shadow-sm">
        {/* Decorative glow orbs */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />

        <div className="relative z-10 flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Greeting */}
          <div>
            {/* Live badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30 mb-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live Store Active
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Welcome Back! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-400 font-medium max-w-md">
              Here's your AMA-YAAR store overview — manage products, orders & analytics.
            </p>
          </div>

          {/* Right: Add Product Button */}
          <div className="shrink-0">
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-900  transition hover:bg-amber-300 hover:scale-105 active:scale-95"
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
          value={`₹${(kpis?.totalRevenue || 48308).toLocaleString('en-IN')}`}
          trend="+18.4%"
          subtext="Updated live today"
        />
        <StatCard
          icon={ShoppingBag}
          tone="indigo"
          label="Total Orders"
          value={kpis?.totalOrders ?? 2}
          trend="+12%"
          subtext="Orders processed"
        />
        <StatCard
          icon={Package}
          tone="amber"
          label="Total Products"
          value={kpis?.totalProducts ?? 8}
          trend="In Stock"
          subtext="Active listings"
        />
        <StatCard
          icon={Users}
          tone="purple"
          label="Total Customers"
          value={kpis?.totalUsers ?? 2}
          trend="+25%"
          subtext="Registered users"
        />
        <StatCard
          icon={RotateCcw}
          tone="rose"
          label="Pending Returns"
          value={kpis?.pendingReturns ?? 0}
          trend="0 Pending"
          subtext="Returns & disputes"
        />
      </div>

      {/* 3. Conversion & Store Performance Insights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-md bg-white p-4 text-center shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Avg. Order Value</span>
          <p className="mt-1 text-lg font-black text-slate-900">₹1,840</p>
          <span className="text-[10px] font-bold text-emerald-600">+8.2% from last week</span>
        </div>
        <div className="rounded-md bg-white p-4 text-center shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Conversion Rate</span>
          <p className="mt-1 text-lg font-black text-slate-900">3.8%</p>
          <span className="text-[10px] font-bold text-emerald-600">+1.4% above avg</span>
        </div>
        <div className="rounded-md bg-white p-4 text-center shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Repeat Customer Rate</span>
          <p className="mt-1 text-lg font-black text-slate-900">42.5%</p>
          <span className="text-[10px] font-bold text-indigo-600">High Loyalty</span>
        </div>
        <div className="rounded-md bg-white p-4 text-center shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Avg Dispatch Speed</span>
          <p className="mt-1 text-lg font-black text-slate-900">1.2 Days</p>
          <span className="text-[10px] font-bold text-emerald-600">Fast Fulfillment</span>
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
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Rated Apparel</h3>
            </div>
            <Link to="/products" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {productsList.slice(0, 4).map((p) => (
              <div key={p._id || p.name} className="group flex items-center gap-3 p-1 rounded-md transition hover:bg-slate-50">
                <img
                  src={p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&q=80'}
                  alt={p.name}
                  className="h-10 w-10 rounded-md object-cover ring-1 ring-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">{p.name}</p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-0.5 font-bold text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {p.rating?.toFixed(1) ?? '4.9'}
                    </span>
                    <span>• {p.numReviews ?? 128} reviews</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-xs font-bold text-slate-900">
                    ₹{p.price?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                    {p.sales || 42} sold
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Category Share & Low Stock Warning & Live Activity Feed */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Category Share Breakup */}
        <div className="rounded-md bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Sales by Category</h3>
            </div>
            <Link to="/categories" className="text-xs font-bold text-indigo-600 hover:underline">
              Categories &rarr;
            </Link>
          </div>

          <div className="mt-4 space-y-3.5">
            {CATEGORY_SHARE.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">{cat.sales}</span>
                    <span className="text-indigo-600 font-bold">{cat.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert Widget */}
        <div className="rounded-md border border-amber-200/60 bg-amber-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Low Stock Warning</h3>
            </div>
            <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              3 Items Need Restock
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {LOW_STOCK_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-md bg-white p-2.5 border border-amber-200/60 shadow-xs">
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
            ))}
          </div>
        </div>

        {/* Live Store Activity Stream */}
        <div className="rounded-md bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Live Store Activity</h3>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="mt-3 space-y-3">
            {LIVE_ACTIVITY.map((act) => {
              const IconComp = act.icon;
              return (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${act.color}`}>
                    <IconComp className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-800 font-semibold leading-snug">{act.title}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{act.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 6. Top Sales Cities & Payment Method Breakdown */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Top Cities */}
        <div className="rounded-md bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Orders by City</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">Pan-India Delivery</span>
          </div>

          <div className="mt-4 space-y-3">
            {TOP_CITIES.map((c) => (
              <div key={c.city} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-bold text-slate-800">{c.city}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-500">{c.amount}</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{c.share}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="rounded-md bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Payment Method Share</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              99.4% Gateway Success
            </span>
          </div>

          <div className="mt-4 space-y-3.5">
            {PAYMENT_METHODS.map((pm) => (
              <div key={pm.method} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{pm.method}</span>
                  <span className="text-indigo-600">{pm.share}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${pm.color}`} style={{ width: `${pm.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Quick Module Shortcuts Grid */}
      <div className="rounded-md bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Zap className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Management Shortcuts</h3>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {QUICK_SHORTCUTS.map((sc) => {
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

      {/* 8. Recent Store Orders Table */}
      <RecentOrders orders={recentOrders} />

    </div>
  );
}
