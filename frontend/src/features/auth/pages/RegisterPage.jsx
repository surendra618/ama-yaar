import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { registerUser, clearError, setCredentials } from '../authSlice';
import CaptchaBox from '../../../components/CaptchaBox';
import api from '../../../lib/axios';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // Step state: 'form' | 'otp'
  const [step, setStep] = useState('form');

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');

  // Captcha states
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // OTP states
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (error) dispatch(clearError());
  };

  // STEP 1: Validate Form + Captcha and Send OTP
  const handleSendOtpAndProceed = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setCaptchaError('');
    setOtpError('');

    if (!form.name.trim()) {
      dispatch(clearError());
      setCaptchaError('Please enter your full name');
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setCaptchaError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!form.email || !form.email.includes('@') || !form.email.includes('.')) {
      setCaptchaError('Please enter a valid email address');
      return;
    }

    if (!form.password || form.password.length < 6) {
      setCaptchaError('Password must be at least 6 characters');
      return;
    }

    // Verify Captcha
    if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaCode.trim().toUpperCase()) {
      setCaptchaError('Incorrect captcha code. Please check and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

      try {
        await api.post('/auth/send-otp', { phone: cleanPhone });
      } catch (err) {
        console.warn('Backend send-otp failed, fallback to simulator:', err);
      }

      setGeneratedOtp(randomOtp);
      setStep('otp');
      setResendCooldown(30);

      // Auto-fill OTP on next step as requested!
      setIsAutoFilled(true);
      setOtp(randomOtp);
    } catch (err) {
      setCaptchaError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpError('');
    setIsSubmitting(true);

    const cleanPhone = form.phone.replace(/\D/g, '');
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();

    try {
      try {
        await api.post('/auth/send-otp', { phone: cleanPhone });
      } catch (_) {}

      setGeneratedOtp(newOtp);
      setOtp(newOtp);
      setIsAutoFilled(true);
      setResendCooldown(30);
    } catch (_) {
      setOtpError('Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify OTP and Create Account
  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setOtpError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setOtpError('Please enter the 4-digit OTP');
      return;
    }

    if (generatedOtp && cleanOtp !== generatedOtp) {
      setOtpError('Invalid OTP code. Please enter the correct OTP.');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanPhone = form.phone.replace(/\D/g, '');
      const result = await dispatch(
        registerUser({
          ...form,
          phone: cleanPhone,
        })
      );

      if (registerUser.fulfilled.match(result)) {
        if (result.payload?.user && result.payload?.accessToken) {
          dispatch(setCredentials(result.payload));
        }
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1200);
      } else {
        setOtpError(result.payload || 'Registration failed. Email or phone may already exist.');
      }
    } catch (err) {
      setOtpError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="af-wrap relative">
      {/* Header */}
      <div className="af-header">
        <div className="af-welcome">START YOUR JOURNEY ✨</div>
        <h1 className="af-title">
          {step === 'form' ? 'Create Account' : 'Verify Mobile OTP'}
        </h1>
        <p className="af-subtitle">
          {step === 'form'
            ? 'Join AMA YAAR and start shopping your style'
            : `We sent a verification code to +91 ${form.phone.slice(0, 5)} ${form.phone.slice(5)}`}
        </p>
      </div>

      {/* Global Error message */}
      {(error || captchaError || otpError) && (
        <div className="af-error">
          <span>⚠️ {error || captchaError || otpError}</span>
        </div>
      )}

      {step === 'form' ? (
        /* STEP 1: FULL NAME, MOBILE, EMAIL, PASSWORD, CAPTCHA */
        <form onSubmit={handleSendOtpAndProceed} className="af-form">
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

          {/* Mobile Number */}
          <div className={`af-field ${focused === 'phone' ? 'af-field--focus' : ''}`}>
            <label className="af-label">MOBILE NUMBER</label>
            <div className="af-input-box">
              <Phone size={16} className="af-icon" />
              <div className="text-xs font-black text-neutral-500 mr-2 border-r border-neutral-300 pr-2 shrink-0">
                +91
              </div>
              <input
                type="tel"
                name="phone"
                maxLength={10}
                required
                placeholder="98765 43210"
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setForm((f) => ({ ...f, phone: val }));
                }}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused('')}
                className="af-input"
              />
            </div>
          </div>

          {/* Email Address */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading || !captchaInput || form.phone.length !== 10}
            className="af-btn cursor-pointer"
          >
            {isSubmitting ? (
              <span className="af-spinner" />
            ) : (
              <>
                Send OTP &amp; Continue
                <ArrowRight size={17} className="af-btn-arrow" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* STEP 2: AUTO-FILLED OTP VERIFICATION & CREATE ACCOUNT */
        <form onSubmit={handleVerifyOtpAndRegister} className="af-form">
          <div className="flex items-center justify-between mb-1">
            <button
              type="button"
              onClick={() => {
                setStep('form');
                setOtpError('');
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-black transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              Edit Details
            </button>
            <span className="text-xs font-bold text-neutral-600">
              {form.email}
            </span>
          </div>

          {/* OTP Input Field */}
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

          {/* Resend Link */}
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-neutral-500">Didn't receive OTP?</span>
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading || otp.length < 4}
            className="af-btn cursor-pointer"
          >
            {isSubmitting || loading ? (
              <span className="af-spinner" />
            ) : (
              <>
                Verify OTP &amp; Create Account
                <ArrowRight size={17} className="af-btn-arrow" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center max-w-sm w-full shadow-2xl border border-neutral-100">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-neutral-900">Account Created!</h3>
            <p className="text-xs text-neutral-500 mt-1 font-medium">
              Welcome to AMA YAAR, {form.name}! Logging you in...
            </p>
          </div>
        </div>
      )}

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
