import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Eye } from 'lucide-react';
import { fetchOrders } from '../ordersSlice';
import DataTable from '../../../components/DataTable';
import Pagination from '../../../components/Pagination';
import StatusBadge from '../../../components/StatusBadge';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

export default function OrdersListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, pagination, status } = useSelector((state) => state.orders);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchOrders({ search, status: tab, page, limit: 10 }));
  }, [dispatch, search, tab, page]);

  const columns = [
    {
      key: 'order',
      header: 'Order',
      render: (o) => (
        <div>
          <p className="text-sm font-bold text-slate-900">{o.orderNumber || `#${o._id.slice(-6)}`}</p>
          <p className="text-xs font-medium text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => (
        <div>
          <p className="text-sm font-semibold text-slate-800">{o.user?.name || o.shippingAddress?.fullName || 'Guest'}</p>
          <p className="text-xs font-medium text-slate-400">{o.user?.email || o.shippingAddress?.email || '—'}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (o) => (
        <span className="inline-flex items-center justify-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
          {o.items?.length || 0} item(s)
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (o) => (
        <span className="font-bold text-slate-900">₹{o.total?.toLocaleString('en-IN')}</span>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (o) => (
        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600">
          {o.paymentInfo?.provider?.toUpperCase() || 'COD'} · <span className="text-emerald-600">{o.paymentInfo?.status || 'paid'}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (o) => (
        <div className="flex justify-end">
          <Link
            to={`/orders/${o._id}`}
            className="inline-flex items-center justify-center rounded-md border border-indigo-200/70 bg-indigo-50/80 p-1.5 text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-700 hover:scale-105 active:scale-95"
            title="View Order Details"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Orders</h1>
        <p className="text-sm font-medium text-slate-500">Track and manage customer orders</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-3.5 bg-slate-50/40 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setTab(t.value);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                  tab === t.value
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search order # or customer…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-64 rounded-md border border-slate-200 py-1.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={items}
          loading={status === 'loading'}
          emptyLabel="No orders found"
          onRowClick={(o) => navigate(`/orders/${o._id}`)}
        />
        <Pagination {...pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}
