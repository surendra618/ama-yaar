import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import api from '../../../lib/axios';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email: form.email, newPassword: form.newPassword });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-lg font-black text-black uppercase tracking-tight">Password reset successful</h1>
        <p className="mt-1 text-xs text-neutral-500 font-medium">You can now sign in with your new password.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 w-full rounded-lg bg-black py-3 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-neutral-800"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-black text-black uppercase tracking-tight">Reset your password</h1>
      <p className="mt-1 text-xs text-neutral-500 font-medium">Choose a new password for your account</p>

      {error && <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 border border-rose-100">{error}</div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-700">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-xs text-black placeholder-neutral-400 transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black font-medium"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-700">New Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="password"
              name="newPassword"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-xs text-black placeholder-neutral-400 transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black font-medium"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-700">Confirm New Password</label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Re-enter new password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-xs text-black placeholder-neutral-400 transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black py-3 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-neutral-500 font-medium">
        <Link to="/login" className="font-bold text-black hover:underline">
          Back to Sign In
        </Link>
      </p>
    </>
  );
}
