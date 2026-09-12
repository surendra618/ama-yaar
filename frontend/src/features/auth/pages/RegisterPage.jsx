import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { registerUser, clearError } from '../authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="af-wrap">
      {/* Header */}
      <div className="af-header">
        <div className="af-welcome">START YOUR JOURNEY ✨</div>
        <h1 className="af-title">Create Account</h1>
        <p className="af-subtitle">Join AMA YAAR and start shopping your style</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="af-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="af-form">
        {/* Full Name */}
        <div className={`af-field ${focused === 'name' ? 'af-field--focus' : ''}`}>
          <label className="af-label">FULL NAME</label>
          <div className="af-input-box">
            <User size={16} className="af-icon" />
            <input
              type="text"
              name="name"
              required
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused('')}
              className="af-input"
            />
          </div>
        </div>

        {/* Email */}
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

        {/* Phone */}
        <div className={`af-field ${focused === 'phone' ? 'af-field--focus' : ''}`}>
          <label className="af-label">PHONE NUMBER</label>
          <div className="af-input-box">
            <Phone size={16} className="af-icon" />
            <input
              type="tel"
              name="phone"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused('')}
              className="af-input"
            />
          </div>
        </div>

        {/* Password */}
        <div className={`af-field ${focused === 'password' ? 'af-field--focus' : ''}`}>
          <label className="af-label">PASSWORD</label>
          <div className="af-input-box">
            <Lock size={16} className="af-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
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
              Create Account
              <ArrowRight size={17} className="af-btn-arrow" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Switch Link */}
      <div className="af-switch">
        Already have an account?{' '}
        <Link to="/login" className="af-switch-link">
          Sign In
        </Link>
      </div>
    </div>
  );
}
