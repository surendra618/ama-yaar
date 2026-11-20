import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Ban, CheckCircle2, Shield, User } from 'lucide-react';
import { fetchUsers, updateUserStatus, updateUserRole } from '../usersSlice';
import DataTable from '../../../components/DataTable';
import Pagination from '../../../components/Pagination';
import StatusBadge from '../../../components/StatusBadge';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function CustomersListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, pagination, status } = useSelector((state) => state.users);
  const { user: currentAdmin } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toToggle, setToToggle] = useState(null);
  const [promoteUser, setPromoteUser] = useState(null);

  const isMainAdmin = Boolean(
    currentAdmin?.isSuperAdmin ||
    (currentAdmin?.email && currentAdmin?.email.toLowerCase() === 'pritamkumars5398@gmail.com')
  );

  useEffect(() => {
    dispatch(fetchUsers({ search, page, limit: 10, role: 'customer' }));
  }, [dispatch, search, page]);

  const handleToggleStatus = async () => {
    const newStatus = toToggle.status === 'blocked' ? 'active' : 'blocked';
    await dispatch(updateUserStatus({ id: toToggle._id, status: newStatus }));
    setToToggle(null);
  };

  const handlePromoteAdmin = async () => {
    if (!promoteUser) return;
    await dispatch(updateUserRole({ id: promoteUser._id, role: 'admin' }));
    setPromoteUser(null);
    dispatch(fetchUsers({ search, page, limit: 10, role: 'customer' }));
  };

  const columns = [
    {
      key: 'user',
      header: 'Customer',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 border border-indigo-200/60">
            {u.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{u.name}</p>
            <p className="text-xs font-medium text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (u) => <span className="text-sm font-medium text-slate-600">{u.phone || '—'}</span>,
    },
    {
      key: 'orders',
      header: 'Orders',
      render: (u) => (
        <span className="inline-flex items-center justify-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
          {u.totalOrders ?? 0}
        </span>
      ),
    },
    {
      key: 'spent',
      header: 'Total Spent',
      render: (u) => <span className="font-bold text-slate-900">₹{(u.totalSpent || 0).toLocaleString('en-IN')}</span>,
    },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {isMainAdmin && (
            <button
              type="button"
              onClick={() => setPromoteUser(u)}
              className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition hover:scale-105 active:scale-95"
              title="Promote this customer to Admin"
            >
              <Shield className="h-3.5 w-3.5" />
              Make Admin
            </button>
          )}

          <button
            type="button"
            onClick={() => setToToggle(u)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-bold transition hover:scale-105 active:scale-95 ${
              u.status === 'blocked'
                ? 'border-emerald-200/70 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100'
                : 'border-rose-200/70 bg-rose-50/80 text-rose-700 hover:bg-rose-100'
            }`}
          >
            {u.status === 'blocked' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
            {u.status === 'blocked' ? 'Unblock' : 'Block'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <User className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Customers</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage registered buyers, order records, and user accounts</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-3.5 bg-slate-50/40 flex items-center justify-between">
          <div className="relative max-w-xs w-full">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer name, email, phone…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-200 py-1.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Customers: {pagination.total || items.length}
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={items}
          loading={status === 'loading'}
          emptyLabel="No customers found"
          onRowClick={(u) => navigate(`/users/${u._id}`)}
        />
        <Pagination {...pagination} onPageChange={setPage} />
      </div>

      {/* Promote to Admin Dialog */}
      <ConfirmDialog
        open={!!promoteUser}
        title={`Promote ${promoteUser?.name} to Admin?`}
        message="This user will be granted full administrative dashboard access to manage orders, products, and categories."
        confirmLabel="Promote to Admin"
        onConfirm={handlePromoteAdmin}
        onCancel={() => setPromoteUser(null)}
      />

      {/* Block/Unblock Dialog */}
      <ConfirmDialog
        open={!!toToggle}
        danger={toToggle?.status !== 'blocked'}
        title={toToggle?.status === 'blocked' ? `Unblock ${toToggle?.name}?` : `Block ${toToggle?.name}?`}
        message={
          toToggle?.status === 'blocked'
            ? 'This customer will regain access to their account.'
            : 'This customer will be immediately signed out and unable to log back in.'
        }
        confirmLabel={toToggle?.status === 'blocked' ? 'Unblock' : 'Block'}
        onConfirm={handleToggleStatus}
        onCancel={() => setToToggle(null)}
      />
    </div>
  );
}

