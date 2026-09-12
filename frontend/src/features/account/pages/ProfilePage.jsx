import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Save, CheckCircle2, User, Mail, Phone, Shield, Calendar, Edit3 } from 'lucide-react';
import { updateProfile } from '../../auth/authSlice';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

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
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="space-y-6">

      {/* Profile Header Card */}
      <div className="rounded-xl border border-neutral-200/60 bg-white shadow-sm overflow-hidden">
        {/* Dark Banner Strip */}
        <div className="h-32 bg-gradient-to-r from-neutral-950 via-neutral-900 to-black relative flex items-center justify-between px-6">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M0 20L20 0h20v20L20 40H0z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
          <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
            MEMBER PROFILE
          </span>
        </div>

        {/* Avatar row - sits below banner, avatar overlaps */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between">
            {/* Big Avatar — crisp high contrast white circle with black text */}
            <div className="-mt-12 flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-black text-black shadow-xl border-4 border-white shrink-0 ring-1 ring-neutral-200" style={{ letterSpacing: '0.05em' }}>
              {initials}
            </div>

            {/* Edit Button aligned to right */}
            <div className="pb-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-black uppercase tracking-wider transition ${
                  isEditing
                    ? 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                    : 'bg-black text-white hover:bg-neutral-800 shadow-sm'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Name & Email below avatar */}
          <div className="mt-4">
            <h2 className="text-xl font-black text-black tracking-tight uppercase">{user?.name || 'User'}</h2>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-bold text-rose-700 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          Profile updated successfully!
        </div>
      )}

      {/* Profile Details / Edit Form */}
      <div className="rounded-md border border-neutral-200/60 bg-white shadow-2xs p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider">Personal Information</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
              {isEditing ? 'Make changes and save your profile' : 'Your account details and preferences'}
            </p>
          </div>
        </div>

        {isEditing ? (
          /* Edit Mode */
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
                  className="w-full rounded-md border border-neutral-200 bg-white pl-10 pr-4 py-3 text-sm font-semibold text-black transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black/10"
                  placeholder="Enter your full name"
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
                  className="w-full cursor-not-allowed rounded-md border border-neutral-200 bg-neutral-50 pl-10 pr-4 py-3 text-sm text-neutral-500 font-medium"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-neutral-400 font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" /> Email address is verified and cannot be changed
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
                  className="w-full rounded-md border border-neutral-200 bg-white pl-10 pr-4 py-3 text-sm font-semibold text-black transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black/10"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-black shadow-sm transition hover:bg-amber-400 disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {loading ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (user) setForm({ name: user.name || '', phone: user.phone || '' });
                }}
                className="rounded-md border border-neutral-200 px-6 py-3 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition"
              >
                Discard
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            {/* Full Name */}
            <div className="rounded-md bg-neutral-50/80 border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-neutral-400" />
                <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Full Name</span>
              </div>
              <p className="text-sm font-bold text-black">{user?.name || '—'}</p>
            </div>

            {/* Email */}
            <div className="rounded-md bg-neutral-50/80 border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-neutral-400" />
                <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Email Address</span>
              </div>
              <p className="text-sm font-bold text-black">{user?.email || '—'}</p>
            </div>

            {/* Phone */}
            <div className="rounded-md bg-neutral-50/80 border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-neutral-400" />
                <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Phone Number</span>
              </div>
              <p className="text-sm font-bold text-black">{user?.phone || 'Not added yet'}</p>
            </div>

            {/* Member Since */}
            <div className="rounded-md bg-neutral-50/80 border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-neutral-400" />
                <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Member Since</span>
              </div>
              <p className="text-sm font-bold text-black">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                  : 'September 2026'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Account Security Card */}
      <div className="rounded-md border border-neutral-200/60 bg-white shadow-2xs p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider">Account Security</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Manage your password and security settings</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md bg-neutral-50/80 border border-neutral-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-black">Password</p>
              <p className="text-[11px] text-neutral-500 font-medium">Last changed: Not available</p>
            </div>
          </div>
          <button className="rounded-md border border-neutral-200 bg-white px-5 py-2.5 text-xs font-black text-black uppercase tracking-wider hover:bg-neutral-100 transition">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
