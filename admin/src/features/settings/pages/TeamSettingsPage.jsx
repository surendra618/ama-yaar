import { useEffect, useState } from 'react';
import {
  Shield,
  UserPlus,
  Search,
  CheckCircle2,
  Ban,
  Trash2,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../../lib/axios';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function TeamSettingsPage() {
  const { user: currentUser } = useSelector((state) => state.auth || {});

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add Admin Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'admin',
  });

  // Action Dialog States
  const [toDemote, setToDemote] = useState(null);
  const [toToggle, setToToggle] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/users', {
        params: { role: 'admin', limit: 100 },
      });
      const list = res.data?.data?.users || res.data?.data || [];
      if (Array.isArray(list)) {
        setAdmins(list);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMsg('Please fill in Name, Email and Password.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await api.post('/users/admin', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        role: formData.role || 'admin',
      });

      setSuccessMsg(`Admin "${formData.name}" added successfully!`);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '', role: 'admin' });
      await fetchAdmins();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add admin user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toToggle) return;
    try {
      const newStatus = toToggle.status === 'blocked' ? 'active' : 'blocked';
      await api.patch(`/users/${toToggle._id}/status`, { status: newStatus });
      setSuccessMsg(`Status updated for ${toToggle.name}`);
      setToToggle(null);
      await fetchAdmins();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleDemoteRole = async () => {
    if (!toDemote) return;
    try {
      await api.patch(`/users/${toDemote._id}/role`, { role: 'customer' });
      setSuccessMsg(`${toDemote.name} was demoted to Customer.`);
      setToDemote(null);
      await fetchAdmins();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteAdmin = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/users/${toDelete._id}`);
      setSuccessMsg(`Account for ${toDelete.name} removed.`);
      setToDelete(null);
      await fetchAdmins();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
              <Shield className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Team & Admins Settings
            </h1>
            <span className="rounded bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Staff & Roles
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Create, manage and control dashboard access for store administrators and team members.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMsg('');
            setSuccessMsg('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Admin / Team Member</span>
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg('')}
            className="text-emerald-600 hover:text-emerald-900 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-rose-600 hover:text-rose-900 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Team</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{admins.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Admin accounts with dashboard access</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Active Admins</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {admins.filter((a) => a.status !== 'blocked').length}
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Able to log in & manage store</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-800">Super Admins</p>
          <p className="text-2xl font-black text-purple-700 mt-1">
            {admins.filter((a) => a.isSuperAdmin).length || 1}
          </p>
          <p className="text-[11px] text-purple-600 mt-0.5">Protected owner accounts</p>
        </div>
      </div>

      {/* Search & Team Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-3.5 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 py-1.5 pl-9 pr-3 text-xs focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {filteredAdmins.length} {filteredAdmins.length === 1 ? 'member' : 'members'} found
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
              <span className="text-xs font-bold text-slate-600">Loading team members...</span>
            </div>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No admin members found</p>
            <p className="text-xs text-slate-400 mt-0.5">Click "Add Admin / Team Member" to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                <tr>
                  <th className="px-4 py-3">Team Member</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredAdmins.map((admin) => {
                  const isCurrent = currentUser?._id === admin._id || currentUser?.email === admin.email;
                  return (
                    <tr key={admin._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-200">
                            {admin.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900">{admin.name}</p>
                              {isCurrent && (
                                <span className="rounded bg-slate-100 text-slate-600 px-1.5 py-0.2 text-[9px] font-extrabold border border-slate-200">
                                  YOU
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {admin.phone || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        {admin.isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-extrabold text-purple-800 border border-purple-200">
                            <ShieldCheck className="h-3 w-3 text-purple-700" />
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                            <Shield className="h-3 w-3 text-indigo-600" />
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                            admin.status === 'blocked'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {admin.status === 'blocked' ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-slate-500 font-mono">
                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {!admin.isSuperAdmin && !isCurrent ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setToToggle(admin)}
                              className={`rounded-md border p-1.5 transition ${
                                admin.status === 'blocked'
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                              title={admin.status === 'blocked' ? 'Unblock Access' : 'Block Access'}
                            >
                              {admin.status === 'blocked' ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <Ban className="h-3.5 w-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setToDemote(admin)}
                              className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
                              title="Demote to standard Customer"
                            >
                              Demote
                            </button>

                            <button
                              type="button"
                              onClick={() => setToDelete(admin)}
                              className="rounded-md border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 transition"
                              title="Delete Admin Account"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Tip Card */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-4 shadow-2xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span>Security & Privileges Notice</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Team members added here receive full access to view orders, update product catalogs, manage inventory, and configure store settings. Always use strong passwords and grant access only to authorized personnel.
        </p>
      </div>

      {/* ADD ADMIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Add Team Member / Admin</h3>
                  <p className="text-[11px] text-slate-500">Create login credentials for store dashboard</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 font-semibold text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@ama-yaar.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 font-semibold text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Login Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-10 font-semibold text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Must be at least 6 characters.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 font-semibold text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Create & Grant Admin Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={!!toDemote}
        danger
        title={`Demote ${toDemote?.name}?`}
        message="This user will lose administrative dashboard access and become a standard customer account."
        confirmLabel="Demote to Customer"
        onConfirm={handleDemoteRole}
        onCancel={() => setToDemote(null)}
      />

      <ConfirmDialog
        open={!!toToggle}
        danger={toToggle?.status !== 'blocked'}
        title={toToggle?.status === 'blocked' ? `Unblock ${toToggle?.name}?` : `Block ${toToggle?.name}?`}
        message={
          toToggle?.status === 'blocked'
            ? 'This admin will regain login access to the dashboard.'
            : 'This admin will be immediately blocked from signing in.'
        }
        confirmLabel={toToggle?.status === 'blocked' ? 'Unblock' : 'Block'}
        onConfirm={handleToggleStatus}
        onCancel={() => setToToggle(null)}
      />

      <ConfirmDialog
        open={!!toDelete}
        danger
        title={`Delete Account for ${toDelete?.name}?`}
        message="This will permanently delete this admin account. This action cannot be undone."
        confirmLabel="Delete Admin"
        onConfirm={handleDeleteAdmin}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
