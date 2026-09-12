import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments } from '../paymentsSlice';
import DataTable from '../../../components/DataTable';
import Pagination from '../../../components/Pagination';
import StatusBadge from '../../../components/StatusBadge';

const FILTER_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

export default function PaymentsListPage() {
  const dispatch = useDispatch();
  const { items, pagination, status } = useSelector((state) => state.payments);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPayments({ status: filter, page, limit: 10 }));
  }, [dispatch, filter, page]);

  const columns = [
    {
      key: 'order',
      header: 'Order',
      render: (p) => <span className="font-bold text-slate-900">{p.order?.orderNumber || '—'}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (p) => (
        <div>
          <p className="text-sm font-semibold text-slate-800">{p.user?.name || '—'}</p>
          <p className="text-xs font-medium text-slate-400">{p.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      render: (p) => (
        <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-xs font-bold uppercase text-slate-600">
          {p.provider}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      render: (p) => <span className="text-sm font-medium text-slate-600">{p.method || '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (p) => <span className="font-bold text-slate-900">₹{p.amount?.toLocaleString('en-IN')}</span>,
    },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'date',
      header: 'Date',
      render: (p) => <span className="text-xs font-medium text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Payments</h1>
        <p className="text-sm font-medium text-slate-500">View all transactions across the platform</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-3.5 bg-slate-50/40">
          <div className="flex flex-wrap gap-1.5">
            {FILTER_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setFilter(t.value);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                  filter === t.value
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <DataTable columns={columns} rows={items} loading={status === 'loading'} emptyLabel="No transactions found" />
        <Pagination {...pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}
