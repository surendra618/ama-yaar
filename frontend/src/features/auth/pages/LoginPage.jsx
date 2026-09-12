import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { loginUser, clearError } from '../authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      navigate(location.state?.from || '/', { replace: true });
    }
  };

  return (
    <div className="af-wrap">
      {/* Header */}
      <div className="af-header">
        <div className="af-welcome">WELCOME BACK! 👋</div>
        <h1 className="af-title">Sign In</h1>
        <p className="af-subtitle">To continue, please sign in to your account</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="af-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="af-form">
        {/* Email Field */}
        <div className={`af-field ${focused === 'email' ? 'af-field--focus' : ''}`}>
          <label className="af-label">EMAIL ADDRESS</label>
          <div className="af-input-box">
            <Mail size={16} className="af-icon" />
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              className="af-input"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className={`af-field ${focused === 'password' ? 'af-field--focus' : ''}`}>
          <div className="af-label-row">
            <label className="af-label">PASSWORD</label>
            <Link to="/forgot-password" className="af-forgot">
              Forgot password?
            </Link>
          </div>
          <div className="af-input-box">
            <Lock size={16} className="af-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              className="af-input af-input--pass"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="af-eye"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="af-btn">
          {loading ? (
            <span className="af-spinner" />
          ) : (
            <>
              Sign In
              <ArrowRight size={17} className="af-btn-arrow" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Switch Link */}
      <div className="af-switch">
        New to AMA YAAR?{' '}
        <Link to="/register" className="af-switch-link">
          Create an account
        </Link>
      </div>
    </div>
  );
}
