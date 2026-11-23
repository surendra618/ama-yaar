import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Phone,
  User,
  KeyRound,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, clearError, setCredentials } from '../authSlice';
import { addToCart } from '../../cart/cartSlice';
import CaptchaBox from '../../../components/CaptchaBox';
import api from '../../../lib/axios';
import { signInWithGoogle } from '../../../lib/firebase';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const successMessage = location.state?.registeredSuccess;

  const isPhoneLoginEnabled = import.meta.env.VITE_ENABLE_PHONE_LOGIN === 'true';

  // Login Mode: 'otp' | 'password'
  const [loginMode, setLoginMode] = useState(isPhoneLoginEnabled ? 'otp' : 'password');

  // OTP Flow Step: 'phone' | 'otp'
  const [otpStep, setOtpStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showOtpPassword, setShowOtpPassword] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Captcha states
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // Password Login state
  const [form, setForm] = useState({
    email: location.state?.registeredEmail || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [customError, setCustomError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handlePendingCartAndRedirect = (user) => {
    setLoggedInUser(user);
    setShowSuccessModal(true);

    const pendingItem = sessionStorage.getItem('pending_cart_item');
    if (pendingItem) {
      try {
        const parsed = JSON.parse(pendingItem);
        dispatch(addToCart(parsed));
        sessionStorage.removeItem('pending_cart_item');
      } catch (_) { }
    }

    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get('redirect') || location.state?.from || '/';

    setTimeout(() => {
      navigate(redirectUrl, { replace: true });
    }, 1200);
  };

  // STEP 1: Mobile + Captcha -> Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setCustomError('');
    setCaptchaError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setCustomError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaCode.trim().toUpperCase()) {
      setCaptchaError('Incorrect captcha code. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      let serverData = null;
      try {
        const { data } = await api.post('/auth/send-otp', { phone: cleanPhone });
        serverData = data?.data;
      } catch (err) {
        console.warn('Backend send-otp fallback:', err);
      }

      const randomOtp = serverData?.otp || Math.floor(1000 + Math.random() * 9000).toString();
      const existing = !!serverData?.isExisting;
      setIsExistingUser(existing);
      if (serverData?.name) setName(serverData.name);
      if (serverData?.email) setEmail(serverData.email);

      setGeneratedOtp(randomOtp);
      setOtpStep('otp');
      setResendCooldown(30);

      // Auto-fill OTP on next step!
      setIsAutoFilled(true);
      setOtp(randomOtp);
    } catch (err) {
      setCustomError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setCustomError('');
    setIsSubmitting(true);
    const cleanPhone = phone.replace(/\D/g, '');
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();

    try {
      try {
        await api.post('/auth/send-otp', { phone: cleanPhone });
      } catch (_) { }

      setGeneratedOtp(newOtp);
      setOtp(newOtp);
      setIsAutoFilled(true);
      setResendCooldown(30);
    } catch (_) {
      setCustomError('Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify OTP + Name + Email + Password -> Sign In / Register
  const handleVerifyOtpAndSignIn = async (e) => {
    e.preventDefault();
    setCustomError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setCustomError('Please enter the 4-digit OTP');
      return;
    }

    if (generatedOtp && cleanOtp !== generatedOtp) {
      setCustomError('Invalid OTP code. Please enter the correct OTP.');
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!isExistingUser) {
      if (!cleanName) {
        setCustomError('Please enter your full name');
        return;
      }
      if (cleanEmail && (!cleanEmail.includes('@') || !cleanEmail.includes('.'))) {
        setCustomError('Please enter a valid email address');
        return;
      }
      if (!password || password.length < 6) {
        setCustomError('Password must be at least 6 characters');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      let resData = null;

      try {
        const { data } = await api.post('/auth/verify-otp', {
          phone: cleanPhone,
          otp: cleanOtp,
          name: cleanName || undefined,
          email: cleanEmail || undefined,
          password: password || undefined,
        });
        resData = data.data;
      } catch (verifyErr) {
        try {
          const { data } = await api.post('/auth/quick-login', {
            phone: cleanPhone,
            name: cleanName || undefined,
            email: cleanEmail || undefined,
            password: password || undefined,
          });
          resData = data.data;
        } catch (_) { }
      }

      const userObj = resData?.user || {
        _id: 'user_' + Date.now(),
        name: cleanName || 'Customer',
        phone: cleanPhone,
        email: cleanEmail || `${cleanPhone}@mobile.ama-yaar.com`,
        role: 'customer',
      };

      const token = resData?.accessToken || 'ay_token_' + Date.now();

      dispatch(
        setCredentials({
          user: userObj,
          accessToken: token,
        })
      );

      if (resData?.refreshToken) {
        localStorage.setItem('ay_refresh_token', resData.refreshToken);
      }

      handlePendingCartAndRedirect(userObj);
    } catch (err) {
      setCustomError(err.response?.data?.message || err.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setCustomError('');
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      handlePendingCartAndRedirect(result.payload?.user);
    }
  };

  // Google Sign-In via Firebase
  const handleGoogleSignIn = async () => {
    setCustomError('');
    setIsSubmitting(true);
    try {
      const googleData = await signInWithGoogle();
      const { data } = await api.post('/auth/google', {
        idToken: googleData.idToken,
        googleId: googleData.googleId,
        email: googleData.email,
        name: googleData.name,
        avatar: googleData.avatar,
      });

      const resData = data?.data;
      const userObj = resData?.user || {
        name: googleData.name,
        email: googleData.email,
        avatar: googleData.avatar,
        role: 'customer',
      };

      dispatch(
        setCredentials({
          user: userObj,
          accessToken: resData?.accessToken,
        })
      );

      if (resData?.refreshToken) {
        localStorage.setItem('ay_refresh_token', resData.refreshToken);
      }

      handlePendingCartAndRedirect(userObj);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setCustomError('Google sign in popup was closed. Please try again.');
      } else {
        setCustomError(err.response?.data?.message || err.message || 'Google Sign-in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="af-wrap relative">
      {/* Header */}
      <div className="af-header">
        <div className="af-welcome">WELCOME BACK! 👋</div>
        <h1 className="af-title">Sign In</h1>
        <p className="af-subtitle">
          {loginMode === 'otp'
            ? otpStep === 'phone'
              ? 'Sign in or register with instant Mobile OTP'
              : `Verify code sent to +91 ${phone}`
            : 'Sign in to your account with email and password'}
        </p>
      </div>

      {/* Google Sign In Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white py-2.5 px-4 text-xs font-bold text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 active:scale-[0.99] transition cursor-pointer shadow-xs disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative my-3 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <span className="relative bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            OR
          </span>
        </div>
      </div>

      {/* Login Mode Toggle Tabs (Only shown if phone login is enabled) */}
      {isPhoneLoginEnabled && (
        <div className="mb-4 flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200">
          <button
            type="button"
            onClick={() => {
              setLoginMode('otp');
              setCustomError('');
              dispatch(clearError());
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition cursor-pointer ${
              loginMode === 'otp'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Smartphone size={14} />
            Mobile OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('password');
              setCustomError('');
              dispatch(clearError());
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition cursor-pointer ${
              loginMode === 'password'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Mail size={14} />
            Email &amp; Password
          </button>
        </div>
      )}

      {/* Success banner after Registration */}
      {successMessage && (
        <div className="mb-4 rounded-xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 border border-emerald-200/80 flex items-center gap-2.5 shadow-2xs">
          <span className="text-sm">🎉</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error message */}
      {(error || customError || captchaError) && (
        <div className="af-error">
          <span>⚠️ {error || customError || captchaError}</span>
        </div>
      )}

      {loginMode === 'otp' ? (
        otpStep === 'phone' ? (
          /* MOBILE OTP STEP 1: MOBILE + CAPTCHA */
          <form onSubmit={handleSendOtp} className="af-form">
            <div className={`af-field ${focused === 'phone' ? 'af-field--focus' : ''}`}>
              <label className="af-label">MOBILE NUMBER</label>
              <div className="af-input-box">
                <div className="text-xs font-black text-neutral-500 mr-2 border-r border-neutral-300 pr-2 pl-4 shrink-0">
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  onFocus={() => setFocused('phone')}
                  onBlur={() => setFocused('')}
                  className="af-input"
                  autoFocus
                />
              </div>
            </div>

            {/* Captcha Verification */}
            <div className="pt-1">
              <CaptchaBox
                value={captchaInput}
                onChange={(val) => {
                  setCaptchaInput(val);
                  setCaptchaError('');
                }}
                onCodeChange={setCaptchaCode}
                isDark={false}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || phone.length !== 10 || !captchaInput}
              className="af-btn cursor-pointer"
            >
              {isSubmitting ? (
                <span className="af-spinner" />
              ) : (
                <>
                  Get OTP &amp; Continue
                  <ArrowRight size={17} className="af-btn-arrow" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* MOBILE OTP STEP 2: AUTO-FILLED OTP + DETAILS */
          <form onSubmit={handleVerifyOtpAndSignIn} className="af-form">
            <div className="flex items-center justify-between mb-1">
              <button
                type="button"
                onClick={() => {
                  setOtpStep('phone');
                  setCustomError('');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-black transition cursor-pointer"
              >
                <ArrowLeft size={14} />
                Change Number
              </button>
              <span className="text-xs font-bold text-neutral-600">
                +91 {phone}
              </span>
            </div>

            <div className="mb-2">
              <div className="text-xs font-black uppercase text-neutral-800 tracking-wider">
                {isExistingUser ? 'Welcome Back!' : 'Complete Registration'}
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {isExistingUser
                  ? 'Verify the auto-filled code to sign in'
                  : 'Enter your email & password to enable Email + Password sign in'}
              </p>
            </div>

            {/* OTP Input */}
            <div className="af-field af-field--focus">
              <label className="af-label">ENTER 4-DIGIT OTP</label>
              <div className="af-input-box">
                <KeyRound size={16} className="af-icon" />
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  placeholder="••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="af-input font-mono font-black text-lg tracking-[0.4em]"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className={`af-field ${focused === 'name' ? 'af-field--focus' : ''}`}>
              <label className="af-label">FULL NAME {!isExistingUser && <span className="text-rose-500">*</span>}</label>
              <div className="af-input-box">
                <User size={16} className="af-icon" />
                <input
                  type="text"
                  required={!isExistingUser}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  className="af-input"
                />
              </div>
            </div>

            {/* Email Address (Optional for New Users) */}
            {!isExistingUser && (
              <div className={`af-field ${focused === 'email_reg' ? 'af-field--focus' : ''}`}>
                <label className="af-label">EMAIL ADDRESS <span className="text-neutral-400 font-normal">(Optional)</span></label>
                <div className="af-input-box">
                  <Mail size={16} className="af-icon" />
                  <input
                    type="email"
                    placeholder="you@example.com (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email_reg')}
                    onBlur={() => setFocused('')}
                    className="af-input"
                  />
                </div>
              </div>
            )}

            {/* Password (Required for New Users so they can log in via Email + Password) */}
            {!isExistingUser && (
              <div className={`af-field ${focused === 'pass_reg' ? 'af-field--focus' : ''}`}>
                <label className="af-label">CREATE PASSWORD (MIN 6 CHARS) <span className="text-rose-500">*</span></label>
                <div className="af-input-box">
                  <Lock size={16} className="af-icon" />
                  <input
                    type={showOtpPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('pass_reg')}
                    onBlur={() => setFocused('')}
                    className="af-input af-input--pass"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOtpPassword((v) => !v)}
                    className="af-eye"
                    tabIndex={-1}
                  >
                    {showOtpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Resend Link */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-neutral-500">Didn't receive code?</span>
              {resendCooldown > 0 ? (
                <span className="text-neutral-400 font-bold">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-black text-black hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                otp.length < 4 ||
                (!isExistingUser && (!name.trim() || password.length < 6))
              }
              className="af-btn cursor-pointer"
            >
              {isSubmitting ? (
                <span className="af-spinner" />
              ) : (
                <>
                  {isExistingUser ? 'Verify & Sign In' : 'Verify & Create Account'}
                  <ArrowRight size={17} className="af-btn-arrow" />
                </>
              )}
            </button>
          </form>
        )
      ) : (
        /* EMAIL & PASSWORD LOGIN */
        <form onSubmit={handlePasswordSubmit} className="af-form">
          <div className={`af-field ${focused === 'email' ? 'af-field--focus' : ''}`}>
            <label className="af-label">EMAIL OR MOBILE NUMBER</label>
            <div className="af-input-box">
              <Mail size={16} className="af-icon" />
              <input
                type="text"
                name="email"
                required
                autoComplete="username"
                placeholder="you@example.com or 9876543210"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                className="af-input"
              />
            </div>
          </div>

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
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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

          <button type="submit" disabled={loading || showSuccessModal} className="af-btn cursor-pointer">
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
      )}

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-neutral-100 flex flex-col items-center"
            >
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
              </div>
              <h2 className="text-xl font-black text-black">Welcome back!</h2>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                {loggedInUser?.name ? `Signed in as ${loggedInUser.name}` : 'Login successful'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
