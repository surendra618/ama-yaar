import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IndianRupee, ShoppingBag, TrendingUp, Percent,
  CreditCard, Package, BarChart3, ArrowUpRight,
} from 'lucide-react';
import { fetchAllReports, setRange } from '../reportsSlice';
import ReportFilters from '../components/ReportFilters';
import Loader from '../../../components/Loader';

const STAT_CARDS = [
  {
    key: 'revenue',
    label: 'Total Revenue',
    icon: IndianRupee,
    color: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    valueColor: 'text-emerald-700',
    format: (v) => `₹${(v || 0).toLocaleString('en-IN')}`,
    getValue: (s) => s.totalRevenue,
  },
  {
    key: 'orders',
    label: 'Total Orders',
    icon: ShoppingBag,
    color: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    valueColor: 'text-indigo-700',
    format: (v) => v || 0,
    getValue: (s) => s.totalOrders,
  },
  {
    key: 'aov',
    label: 'Avg. Order Value',
    icon: TrendingUp,
    color: 'bg-amber-50 text-amber-600 border border-amber-100',
    valueColor: 'text-amber-700',
    format: (v) => `₹${Math.round(v || 0).toLocaleString('en-IN')}`,
    getValue: (s) => s.avgOrderValue,
  },
  {
    key: 'discounts',
    label: 'Discounts Given',
    icon: Percent,
    color: 'bg-rose-50 text-rose-600 border border-rose-100',
    valueColor: 'text-rose-700',
    format: (v) => `₹${(v || 0).toLocaleString('en-IN')}`,
    getValue: (s) => s.totalDiscounts,
  },
];

const PAYMENT_COLORS = {
  upi: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  card: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  cod: 'bg-amber-50 text-amber-700 border-amber-200',
  wallet: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function ReportsPage() {
  const dispatch = useDispatch();
  const { sales, revenue, products, range, status } = useSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchAllReports(range));
  }, [dispatch, range]);

  if (status === 'loading' && !sales) return <Loader label="Crunching numbers…" />;

  const summary = sales?.summary || {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Reports</h1>
          <p className="text-sm font-medium text-slate-500">Sales, revenue and product performance insights</p>
        </div>
        <ReportFilters value={range} onChange={(r) => dispatch(setRange(r))} />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, valueColor, format, getValue }) => (
          <div
            key={key}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className={`mt-3 text-2xl font-extrabold ${valueColor}`}>
              {format(getValue(summary))}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Revenue by Payment Method */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 bg-slate-50/40">
            <CreditCard className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Revenue by Payment Method</h3>
          </div>
          <div className="p-5">
            {!revenue?.byPaymentMethod?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <BarChart3 className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">No data for this range</p>
              </div>
            ) : (
              <div className="space-y-3">
                {revenue.byPaymentMethod.map((r) => {
                  const key = (r._id || 'unknown').toLowerCase();
                  const colorClass = PAYMENT_COLORS[key] || 'bg-slate-50 text-slate-700 border-slate-200';
                  const total = revenue.byPaymentMethod.reduce((sum, x) => sum + x.revenue, 0);
                  const pct = total > 0 ? Math.round((r.revenue / total) * 100) : 0;
                  return (
                    <div key={r._id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold uppercase ${colorClass}`}>
                          {r._id || 'unknown'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">{pct}%</span>
                          <span className="font-bold text-slate-900">₹{r.revenue.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 bg-slate-50/40">
            <Package className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Selling Products</h3>
          </div>
          <div className="p-5">
            {!products?.topProducts?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Package className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">No sales data yet</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {products.topProducts.map((p, idx) => {
                  const maxSold = products.topProducts[0]?.unitsSold || 1;
                  const pct = Math.round((p.unitsSold / maxSold) * 100);
                  return (
                    <div key={p._id} className="space-y-1">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                            {idx + 1}
                          </span>
                          <span className="truncate font-semibold text-slate-800" title={p.productName}>{p.productName}</span>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">
                          <ArrowUpRight className="h-3 w-3" />{p.unitsSold} sold
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
