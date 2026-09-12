import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye } from 'lucide-react';
import { fetchReturns } from '../returnsSlice';
import DataTable from '../../../components/DataTable';
import Pagination from '../../../components/Pagination';
import StatusBadge from '../../../components/StatusBadge';

const TABS = [
  { value: '', label: 'All' },
  { value: 'requested', label: 'Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ReturnsListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, pagination, status } = useSelector((state) => state.returns);
  const [tab, setTab] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchReturns({ status: tab, page, limit: 10 }));
  }, [dispatch, tab, page]);

  const columns = [
    {
      key: 'order',
      header: 'Order',
      render: (r) => <span className="font-bold text-slate-900">{r.order?.orderNumber || '—'}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => (
        <div>
          <p className="text-sm font-semibold text-slate-800">{r.user?.name}</p>
          <p className="text-xs font-medium text-slate-400">{r.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (r) => (
        <span className="inline-flex items-center rounded-md border border-slate-200/60 bg-slate-50 px-2 py-0.5 text-xs font-bold capitalize text-slate-600">
          {r.reason?.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'refund',
      header: 'Refund Amount',
      render: (r) => <span className="font-bold text-slate-900">₹{(r.refundAmount || 0).toLocaleString('en-IN')}</span>,
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'date',
      header: 'Requested',
      render: (r) => <span className="text-xs font-medium text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <Link
          to={`/returns/${r._id}`}
          className="inline-flex items-center justify-center rounded-md border border-indigo-200/70 bg-indigo-50/80 p-1.5 text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-700 hover:scale-105 active:scale-95"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Returns &amp; Refunds</h1>
        <p className="text-sm font-medium text-slate-500">Review and process customer return requests</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-3.5 bg-slate-50/40">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((t) => (
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
        </div>
        <DataTable
          columns={columns}
          rows={items}
          loading={status === 'loading'}
          emptyLabel="No return requests found"
          onRowClick={(r) => navigate(`/returns/${r._id}`)}
        />
        <Pagination {...pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}
