import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../../../lib/axios';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="af-wrap text-center py-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="af-title">Check your email</h1>
        <p className="af-subtitle mt-2">
          If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
        </p>
        <button
          onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
          className="af-btn mt-6"
        >
          Continue to Reset Password
        </button>
      </div>
    );
  }

  return (
    <div className="af-wrap">
      {/* Header */}
      <div className="af-header">
        <div className="af-welcome">ACCOUNT RECOVERY 🔒</div>
        <h1 className="af-title">Forgot Password?</h1>
        <p className="af-subtitle">Enter your email and we'll help you reset it</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="af-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="af-form">
        <div className={`af-field ${focused ? 'af-field--focus' : ''}`}>
          <label className="af-label">EMAIL ADDRESS</label>
          <div className="af-input-box">
            <Mail size={16} className="af-icon" />
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="af-input"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="af-btn">
          {loading ? (
            <span className="af-spinner" />
          ) : (
            <>
              Send Reset Link
              <ArrowRight size={17} className="af-btn-arrow" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Switch */}
      <div className="af-switch">
        Remembered your password?{' '}
        <Link to="/login" className="af-switch-link">
          Sign In
        </Link>
      </div>
    </div>
  );
}
