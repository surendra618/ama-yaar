import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, UserPlus, Shield, ShieldCheck, Mail, Phone, Calendar, Ban, CheckCircle2, X } from 'lucide-react';
import { fetchUsers, updateUserStatus, createAdminUser, updateUserRole } from '../usersSlice';
import DataTable from '../../../components/DataTable';
import Pagination from '../../../components/Pagination';
import StatusBadge from '../../../components/StatusBadge';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function TeamAdminsPage() {
  const dispatch = useDispatch();
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

  // Demote confirmation modal
  const [demoteUser, setDemoteUser] = useState(null);

  const isMainAdmin = Boolean(
    currentAdmin?.isSuperAdmin ||
    (currentAdmin?.email && currentAdmin?.email.toLowerCase() === 'pritamkumars5398@gmail.com')
  );

  useEffect(() => {
    dispatch(fetchUsers({ search, page, limit: 10, role: 'admin' }));
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
        dispatch(fetchUsers({ search, page, limit: 10, role: 'admin' }));
      } else {
        setAdminFormError(resultAction.payload || 'Failed to create admin');
      }
    } catch (err) {
      setAdminFormError(err.message || 'Error creating admin');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const handleDemoteAdmin = async () => {
    if (!demoteUser) return;
    await dispatch(updateUserRole({ id: demoteUser._id, role: 'customer' }));
    setDemoteUser(null);
    dispatch(fetchUsers({ search, page, limit: 10, role: 'admin' }));
  };

  const columns = [
    {
      key: 'user',
      header: 'Admin Member',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-sm font-bold text-purple-700 border border-purple-200">
            {u.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900">{u.name}</p>
              {u.isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                  <ShieldCheck className="h-3.5 w-3.5" /> Primary Owner
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200">
                  <Shield className="h-3 w-3" /> Sub-Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-400" /> {u.email}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (u) => (
        <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-slate-400" /> {u.phone || '—'}
        </span>
      ),
    },
    {
      key: 'joined',
      header: 'Joined On',
      render: (u) => (
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (u) => {
        const isMain = u.isSuperAdmin || (u.email && u.email.toLowerCase() === 'pritamkumars5398@gmail.com');
        if (isMain) {
          return (
            <span className="text-xs font-semibold text-slate-400 italic">Protected</span>
          );
        }

        return (
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            {isMainAdmin && (
              <button
                type="button"
                onClick={() => setDemoteUser(u)}
                className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition hover:scale-105 active:scale-95"
                title="Remove admin privileges and make customer"
              >
                <Shield className="h-3.5 w-3.5" />
                Demote
              </button>
            )}

            <button
              type="button"
              onClick={() => setToToggle(u)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-bold transition hover:scale-105 active:scale-95 ${
                u.status === 'blocked'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              {u.status === 'blocked' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
              {u.status === 'blocked' ? 'Activate' : 'Suspend'}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Team & Admins</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage administrative staff, permissions, and co-admins with dashboard access
          </p>
        </div>

        {isMainAdmin && (
          <button
            type="button"
            onClick={() => setShowAddAdminModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition active:scale-95 self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            Add New Admin
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-3.5 bg-slate-50/50 flex items-center justify-between">
          <div className="relative max-w-xs w-full">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search admin name, email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-200 py-1.5 pl-9 pr-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Admins: {pagination.total || items.length}
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={items}
          loading={status === 'loading'}
          emptyLabel="No admin members found"
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
                  <h3 className="text-base font-bold text-slate-900">Add Team Admin</h3>
                  <p className="text-xs text-slate-500">Assign full administrative dashboard access</p>
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
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@ama-yaar.com"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
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
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
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
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50 transition shadow-sm"
                >
                  {isSubmittingAdmin ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Demote Modal */}
      <ConfirmDialog
        open={!!demoteUser}
        danger
        title={`Demote ${demoteUser?.name} to Customer?`}
        message="This user will immediately lose all administrative dashboard access and be treated as a standard customer."
        confirmLabel="Demote to Customer"
        onConfirm={handleDemoteAdmin}
        onCancel={() => setDemoteUser(null)}
      />

      {/* Suspend / Activate Dialog */}
      <ConfirmDialog
        open={!!toToggle}
        danger={toToggle?.status !== 'blocked'}
        title={toToggle?.status === 'blocked' ? `Activate ${toToggle?.name}?` : `Suspend ${toToggle?.name}?`}
        message={
          toToggle?.status === 'blocked'
            ? 'This admin will regain dashboard access.'
            : 'This admin will be immediately signed out and blocked from dashboard access.'
        }
        confirmLabel={toToggle?.status === 'blocked' ? 'Activate' : 'Suspend'}
        onConfirm={handleToggleStatus}
        onCancel={() => setToToggle(null)}
      />
    </div>
  );
}

