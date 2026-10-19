import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Save,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Edit3,
  Lock,
  Eye,
  EyeOff,
  X,
  Package,
  MapPin,
  Heart,
  Tag,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { updateProfile } from '../../auth/authSlice';
import api from '../../../lib/axios';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  // Edit profile state
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Change password modal state
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  // Quick stats state
  const [orderCount, setOrderCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);
  const { items: wishlistItems = [] } = useSelector((state) => state.wishlist || {});

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  useEffect(() => {
    // Fetch quick stats
    api
      .get('/orders/my-orders')
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setOrderCount(Array.isArray(list) ? list.length : 0);
      })
      .catch(() => {});

    api
      .get('/addresses')
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setAddressCount(Array.isArray(list) ? list.length : 0);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) {
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3500);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }

    setPwSubmitting(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess(true);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setPwModalOpen(false);
        setPwSuccess(false);
      }, 2000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password. Please verify current password.');
    } finally {
      setPwSubmitting(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="space-y-6">
      {/* Profile Header Hero Card */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs overflow-hidden">
        {/* Banner Strip */}
        <div className="h-32 bg-gradient-to-r from-neutral-950 via-neutral-900 to-black relative flex items-start justify-between p-6">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M0 20L20 0h20v20L20 40H0z\'/%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
          <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400">
            MEMBER PROFILE
          </span>
          <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10.5px] font-bold text-white backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified Member
          </span>
        </div>

        {/* User Info Bar with Overlapping Avatar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12">
            {/* Avatar & User Details */}
            <div className="flex items-end gap-4">
              <div
                className="relative z-20 flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-black text-black shadow-xl border-4 border-white ring-1 ring-neutral-200/80 shrink-0"
                style={{ letterSpacing: '0.04em' }}
              >
                {initials}
              </div>
              <div className="pb-1">
                <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
                  {user?.name || 'Customer'}
                </h2>
                <p className="text-xs text-neutral-500 font-medium">{user?.email}</p>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-black uppercase tracking-wider transition ${
                isEditing
                  ? 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                  : 'bg-black text-white hover:bg-neutral-800 shadow-sm'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/account/orders"
          className="group rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs hover:border-black transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 group-hover:text-black transition">
              My Orders
            </span>
            <Package className="h-4 w-4 text-neutral-400 group-hover:text-black transition" />
          </div>
          <p className="text-xl font-black text-black mt-2">{orderCount}</p>
        </Link>

        <Link
          to="/account/addresses"
          className="group rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs hover:border-black transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 group-hover:text-black transition">
              Addresses
            </span>
            <MapPin className="h-4 w-4 text-neutral-400 group-hover:text-black transition" />
          </div>
          <p className="text-xl font-black text-black mt-2">{addressCount}</p>
        </Link>

        <Link
          to="/account/wishlist"
          className="group rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs hover:border-black transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 group-hover:text-black transition">
              Wishlist
            </span>
            <Heart className="h-4 w-4 text-neutral-400 group-hover:text-black transition" />
          </div>
          <p className="text-xl font-black text-black mt-2">{wishlistItems.length}</p>
        </Link>

        <Link
          to="/account/coupons"
          className="group rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs hover:border-black transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 group-hover:text-black transition">
              Coupons
            </span>
            <Tag className="h-4 w-4 text-neutral-400 group-hover:text-black transition" />
          </div>
          <p className="text-xl font-black text-black mt-2">Active</p>
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          Profile updated successfully!
        </div>
      )}

      {/* Personal Information Card */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider">Personal Information</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
              {isEditing ? 'Modify your account details below' : 'Your registered account details and contact info'}
            </p>
          </div>
        </div>

        {isEditing ? (
          /* Edit Mode Form */
          <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
            <div>
              <label className="mb-2 block text-xs font-extrabold text-black uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 py-3 text-sm font-semibold text-black transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-extrabold text-black uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-100 pl-10 pr-4 py-3 text-sm text-neutral-500 font-medium"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-neutral-400 font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" /> Email address is locked to maintain order history security
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-extrabold text-black uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 py-3 text-sm font-semibold text-black transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {loading ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (user) setForm({ name: user.name || '', phone: user.phone || '' });
                }}
                className="rounded-lg border border-neutral-200 px-6 py-3 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition"
              >
                Discard
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {/* Full Name */}
            <div className="rounded-xl bg-neutral-50/70 border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <User className="h-4 w-4 text-neutral-400" />
                <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Full Name</span>
              </div>
              <p className="text-sm font-bold text-black">{user?.name || '—'}</p>
            </div>

            {/* Email */}
            <div className="rounded-xl bg-neutral-50/70 border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Mail className="h-4 w-4 text-neutral-400" />
                <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Email Address</span>
              </div>
              <p className="text-sm font-bold text-black">{user?.email || '—'}</p>
            </div>

            {/* Phone */}
            <div className="rounded-xl bg-neutral-50/70 border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Phone className="h-4 w-4 text-neutral-400" />
                <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Phone Number</span>
              </div>
              <p className="text-sm font-bold text-black">{user?.phone || 'Not provided yet'}</p>
            </div>

            {/* Member Since */}
            <div className="rounded-xl bg-neutral-50/70 border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Calendar className="h-4 w-4 text-neutral-400" />
                <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Member Since</span>
              </div>
              <p className="text-sm font-bold text-black">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                  : 'October 2026'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Account Security Card */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider">Account Security</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Manage your password and security credentials</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-neutral-50/70 border border-neutral-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-black uppercase tracking-wide">Account Password</p>
              <p className="text-[11px] text-neutral-500 font-medium">Keep your account safe by updating your password regularly</p>
            </div>
          </div>
          <button
            onClick={() => {
              setPwModalOpen(true);
              setPwError('');
              setPwSuccess(false);
              setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }}
            className="rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-xs font-black text-black uppercase tracking-wider hover:bg-neutral-100 transition shadow-2xs"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {pwModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-black">Update Password</h3>
                  <p className="text-[11px] text-neutral-400 font-medium">Enter your credentials below</p>
                </div>
              </div>
              <button
                onClick={() => setPwModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-black transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {pwError && (
              <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                {pwError}
              </div>
            )}

            {pwSuccess && (
              <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                Password updated successfully!
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
              {/* Current Password */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-neutral-700">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    required
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 pr-10 text-xs font-semibold text-black transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-neutral-700">New Password (min 6 chars)</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    placeholder="Enter new secure password"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 pr-10 text-xs font-semibold text-black transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-neutral-700">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 pr-10 text-xs font-semibold text-black transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={pwSubmitting}
                  className="w-full rounded-lg bg-black px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  {pwSubmitting ? 'Updating Password...' : 'Save New Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setPwModalOpen(false)}
                  className="rounded-lg border border-neutral-200 px-4 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
