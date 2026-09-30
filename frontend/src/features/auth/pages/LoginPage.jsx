import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, clearError } from '../authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const successMessage = location.state?.registeredSuccess;
  const [form, setForm] = useState({
    email: location.state?.registeredEmail || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const user = result.payload?.user;
      setLoggedInUser(user);
      setShowSuccessModal(true);

      setTimeout(() => {
        navigate(location.state?.from || '/', { replace: true });
      }, 1800);
    }
  };

  return (
    <div className="af-wrap relative">
      {/* Header */}
      <div className="af-header">
        <div className="af-welcome">WELCOME BACK! 👋</div>
        <h1 className="af-title">Sign In</h1>
        <p className="af-subtitle">To continue, please sign in to your account</p>
      </div>

      {/* Success banner after Registration */}
      {successMessage && (
        <div className="mb-4 rounded-xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 border border-emerald-200/80 flex items-center gap-2.5 shadow-2xs">
          <span className="text-sm">🎉</span>
          <span>{successMessage}</span>
        </div>
      )}

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
        <button type="submit" disabled={loading || showSuccessModal} className="af-btn">
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

      {/* Animated Center Circular Success Popup */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              className="relative flex h-80 w-80 flex-col items-center justify-center rounded-full bg-white p-6 text-center border-2 border-neutral-200/90 shadow-none overflow-hidden"
            >
              {/* Circular Animated Progress Ring around Checkmark */}
              <div className="relative mb-3.5 flex h-28 w-28 items-center justify-center">
                {/* SVG Circular Loading Ring */}
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 56 56">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    className="stroke-neutral-100"
                    strokeWidth="4"
                    fill="none"
                  />
                  <motion.circle
                    cx="28"
                    cy="28"
                    r="24"
                    className="stroke-[#facc15]"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="151"
                    initial={{ strokeDashoffset: 151 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 1.8, ease: 'easeInOut' }}
                  />
                </svg>

                {/* Inner Yellow Checkmark Circle */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.15 }}
                  className="flex h-18 w-18 items-center justify-center rounded-full bg-[#facc15] text-black shadow-xs"
                >
                  <CheckCircle2 className="h-10 w-10 stroke-[2.5] text-black" />
                </motion.div>
              </div>

              {/* 2 Text Lines - Larger */}
              <h2 className="px-3 text-lg font-black uppercase tracking-tight text-neutral-900 leading-snug">
                Welcome Back{loggedInUser?.name ? `, ${loggedInUser.name.split(' ')[0]}!` : '! 🎉'}
              </h2>

              <p className="mt-1.5 px-4 text-xs font-semibold text-neutral-600 leading-normal">
                You have successfully signed in.<br />Redirecting to AMA YAAR...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
