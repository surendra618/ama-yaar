import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Ban, CheckCircle2, UserPlus, Shield, ShieldCheck, X } from 'lucide-react';
import { fetchUsers, updateUserStatus, createAdminUser, updateUserRole } from '../usersSlice';
import DataTable from '../../../components/DataTable';
import Pagination from '../../../components/Pagination';
import StatusBadge from '../../../components/StatusBadge';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function UsersListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, pagination, status } = useSelector((state) => state.users);
  const { user: currentAdmin } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toToggle, setToToggle] = useState(null);

  // Add Admin modal state
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [adminFormError, setAdminFormError] = useState('');
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  // Promote / Demote state
  const [roleModalUser, setRoleModalUser] = useState(null);

  const isMainAdmin = Boolean(
    currentAdmin?.isSuperAdmin ||
    (currentAdmin?.email && currentAdmin?.email.toLowerCase() === 'pritamkumars5398@gmail.com')
  );

  useEffect(() => {
    dispatch(fetchUsers({ search, page, limit: 10 }));
  }, [dispatch, search, page]);

  const handleToggleStatus = async () => {
    const newStatus = toToggle.status === 'blocked' ? 'active' : 'blocked';
    await dispatch(updateUserStatus({ id: toToggle._id, status: newStatus }));
    setToToggle(null);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminFormError('');

    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      setAdminFormError('Name, email, and password are required');
      return;
    }
    if (adminForm.password.length < 6) {
      setAdminFormError('Password must be at least 6 characters');
      return;
    }

    setIsSubmittingAdmin(true);
    try {
      const resultAction = await dispatch(createAdminUser(adminForm));
      if (createAdminUser.fulfilled.match(resultAction)) {
        setShowAddAdminModal(false);
        setAdminForm({ name: '', email: '', phone: '', password: '' });
        dispatch(fetchUsers({ search, page, limit: 10 }));
      } else {
        setAdminFormError(resultAction.payload || 'Failed to create admin user');
      }
    } catch (err) {
      setAdminFormError(err.message || 'Error creating admin user');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const handleToggleRole = async () => {
    if (!roleModalUser) return;
    const newRole = roleModalUser.role === 'admin' ? 'customer' : 'admin';
    await dispatch(updateUserRole({ id: roleModalUser._id, role: newRole }));
    setRoleModalUser(null);
    dispatch(fetchUsers({ search, page, limit: 10 }));
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 border border-indigo-200/60">
            {u.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-800">{u.name}</p>
              {u.isSuperAdmin && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                  <ShieldCheck className="h-3 w-3" /> Main Admin
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => {
        const isAdmin = u.role === 'admin' || u.role === 'superadmin';
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold border ${
              isAdmin
                ? 'bg-purple-50 text-purple-700 border-purple-200/80'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            {isAdmin ? <Shield className="h-3 w-3 text-purple-600" /> : null}
            {isAdmin ? 'Admin' : 'Customer'}
          </span>
        );
      },
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
      render: (u) => {
        const targetIsMain = u.isSuperAdmin || (u.email && u.email.toLowerCase() === 'pritamkumars5398@gmail.com');

        return (
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            {isMainAdmin && !targetIsMain && (
              <button
                type="button"
                onClick={() => setRoleModalUser(u)}
                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition hover:scale-105 active:scale-95 ${
                  u.role === 'admin'
                    ? 'border-amber-200/80 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'border-purple-200/80 bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
                title={u.role === 'admin' ? 'Demote to regular customer' : 'Promote user to Admin'}
              >
                <Shield className="h-3.5 w-3.5" />
                {u.role === 'admin' ? 'Demote' : 'Make Admin'}
              </button>
            )}

            {!targetIsMain && (
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
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Users & Admins</h1>
          <p className="text-sm font-medium text-slate-500">Manage customer accounts and administrative team</p>
        </div>

        {isMainAdmin && (
          <button
            type="button"
            onClick={() => setShowAddAdminModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition active:scale-95 self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            Add New Admin
          </button>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-3.5 bg-slate-50/40">
          <div className="relative max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, email, phone…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-200 py-1.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={items}
          loading={status === 'loading'}
          emptyLabel="No users found"
          onRowClick={(u) => navigate(`/users/${u._id}`)}
        />
        <Pagination {...pagination} onPageChange={setPage} />
      </div>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Admin</h3>
                  <p className="text-xs text-slate-500">Create a sub-admin with dashboard access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAdminModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="mt-4 space-y-4">
              {adminFormError && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                  {adminFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdmin}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-sm"
                >
                  {isSubmittingAdmin ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Confirmation Dialog */}
      <ConfirmDialog
        open={!!roleModalUser}
        danger={roleModalUser?.role === 'admin'}
        title={
          roleModalUser?.role === 'admin'
            ? `Demote ${roleModalUser?.name} to Customer?`
            : `Promote ${roleModalUser?.name} to Admin?`
        }
        message={
          roleModalUser?.role === 'admin'
            ? 'This user will immediately lose access to the admin dashboard.'
            : 'This user will be granted full sub-admin access to manage orders, products, and categories.'
        }
        confirmLabel={roleModalUser?.role === 'admin' ? 'Demote to Customer' : 'Make Admin'}
        onConfirm={handleToggleRole}
        onCancel={() => setRoleModalUser(null)}
      />

      {/* User Block/Unblock Dialog */}
      <ConfirmDialog
        open={!!toToggle}
        danger={toToggle?.status !== 'blocked'}
        title={toToggle?.status === 'blocked' ? `Unblock ${toToggle?.name}?` : `Block ${toToggle?.name}?`}
        message={
          toToggle?.status === 'blocked'
            ? 'This user will regain access to their account.'
            : 'This user will be immediately signed out and unable to log back in.'
        }
        confirmLabel={toToggle?.status === 'blocked' ? 'Unblock' : 'Block'}
        onConfirm={handleToggleStatus}
        onCancel={() => setToToggle(null)}
      />
    </div>
  );
}
