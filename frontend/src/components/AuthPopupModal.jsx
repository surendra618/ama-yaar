import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  X,
  CheckCircle2,
  Phone,
  User,
  KeyRound,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { setCredentials } from '../features/auth/authSlice';
import CaptchaBox from './CaptchaBox';
import api from '../lib/axios';
import { signInWithGoogle, isConfigured as isFirebaseConfigured, sendFirebasePhoneOtp } from '../lib/firebase';

export default function AuthPopupModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();

  // Environment-driven toggle for Phone Login (Default: false because SMS OTP service is pending)
  const isPhoneLoginEnabled = import.meta.env.VITE_ENABLE_PHONE_LOGIN === 'true';

  // Mode: 'email' | 'phone'
  const [authMode, setAuthMode] = useState(isPhoneLoginEnabled ? 'phone' : 'email');

  // Step state: 'input' (email or phone + captcha) | 'otp' (verify OTP + name + pwd)
  const [step, setStep] = useState('input');

  // Form states
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [otp, setOtp] = useState('');

  // Captcha states
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // Status states
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [pendingPhoneUser, setPendingPhoneUser] = useState(null);
  const [pendingPhonePromptUser, setPendingPhonePromptUser] = useState(null);
  const [phonePromptSource, setPhonePromptSource] = useState('email');
  const [pendingAuthUser, setPendingAuthUser] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const confirmationResultRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      confirmationResultRef.current = null;
      setAuthMode(isPhoneLoginEnabled ? 'phone' : 'email');
      setStep('input');
      setPhone('');
      setEmail('');
      setName('');
      setPassword('');
      setShowPassword(false);
      setIsExistingUser(false);
      setOtp('');
      setCaptchaInput('');
      setCaptchaError('');
      setError('');
      setSuccess(false);
      setIsSubmitting(false);
      setIsGoogleSubmitting(false);
      setResendCooldown(0);
      setVerifiedUser(null);
      setPendingGoogleUser(null);
      setPendingPhoneUser(null);
      setPendingPhonePromptUser(null);
      setPhonePromptSource('email');
      setPendingAuthUser(null);
    }
  }, [isOpen, isPhoneLoginEnabled]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Handle Step 1: Send OTP to Email or Phone (Firebase Phone Auth)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setCaptchaError('');

    if (authMode === 'phone') {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit Indian mobile number');
        return;
      }

      if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaCode.trim().toUpperCase()) {
        setCaptchaError('Incorrect captcha code. Please try again.');
        return;
      }

      setIsSubmitting(true);
      try {
        const confirmationResult = await sendFirebasePhoneOtp(cleanPhone, 'auth-recaptcha-container');
        confirmationResultRef.current = confirmationResult;
        setOtp('');
        setStep('otp');
        setResendCooldown(30);
      } catch (fbErr) {
        console.error('[Firebase Phone Auth] Error:', fbErr);
        let msg = fbErr.message || 'Failed to send SMS OTP via Firebase.';
        if (fbErr.code === 'auth/billing-not-enabled') {
          msg = 'Real SMS requires Firebase Blaze plan enabled in Firebase Console (10,000 verifications/month are free). Please upgrade to Blaze in Firebase Console, or sign in using Email OTP / Google.';
        } else if (fbErr.code === 'auth/operation-not-allowed') {
          msg = 'Phone SMS is not enabled for India (+91) in Firebase. Please enable "Phone" in Sign-in method and allow India (+91) in Authentication > Settings > SMS region policy (or add as test number).';
        } else if (fbErr.message && fbErr.message.includes('already been rendered')) {
          msg = 'Security verifier reset. Please click GET OTP again.';
        } else if (fbErr.code === 'auth/invalid-phone-number') {
          msg = 'Invalid phone number format (+91 XXXXXXXXXX).';
        } else if (fbErr.code === 'auth/too-many-requests') {
          msg = 'Too many requests. Please wait a few moments before trying again.';
        } else if (fbErr.code === 'auth/quota-exceeded') {
          msg = 'Firebase SMS quota exceeded. Check Firebase console billing or test numbers.';
        } else if (fbErr.code === 'auth/captcha-check-failed') {
          msg = 'reCAPTCHA check failed. Please try again.';
        } else if (fbErr.code === 'auth/invalid-app-credential') {
          msg = 'Firebase app credential invalid. Check authorized domains in Firebase Console.';
        }
        setError(msg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Email OTP flow
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaCode.trim().toUpperCase()) {
      setCaptchaError('Incorrect captcha code. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = { email: cleanEmail };
      const { data } = await api.post('/auth/send-otp', payload);
      const serverData = data?.data;

      const existing = !!serverData?.isExisting;
      setIsExistingUser(existing);
      if (serverData?.name) setName(serverData.name);
      if (serverData?.email && !email) setEmail(serverData.email);

      setOtp('');
      setStep('otp');
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setIsSubmitting(true);

    try {
      if (authMode === 'phone') {
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        const confirmationResult = await sendFirebasePhoneOtp(cleanPhone, 'auth-recaptcha-container');
        confirmationResultRef.current = confirmationResult;
        setOtp('');
        setResendCooldown(30);
      } else {
        const payload = { email: email.trim().toLowerCase() };
        await api.post('/auth/send-otp', payload);
        setOtp('');
        setResendCooldown(30);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step 2: Verify OTP & Sign In (Passwordless)
  const handleVerifyAndSignIn = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsSubmitting(true);

    try {
      let userObj = null;
      let token = null;
      let refreshToken = null;
      let resData = null;

      if (authMode === 'phone') {
        if (!confirmationResultRef.current) {
          setError('Verification session expired. Please click Back and request a new OTP.');
          setIsSubmitting(false);
          return;
        }

        // 1. Confirm code with Firebase Phone Auth
        const userCredential = await confirmationResultRef.current.confirm(cleanOtp);
        const fbUser = userCredential.user;
        const idToken = await fbUser.getIdToken();
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);

        // 2. Authenticate or register with backend (passwordless)
        const { data } = await api.post('/auth/phone-login', {
          phone: cleanPhone,
          firebaseUid: fbUser.uid,
          idToken: idToken,
        });

        resData = data?.data;
        userObj = resData?.user || {
          _id: 'user_' + Date.now(),
          name: 'Customer',
          email: `${cleanPhone}@mobile.ama-yaar.com`,
          phone: cleanPhone,
          role: 'customer',
        };
        token = resData?.accessToken || 'ay_token_' + Date.now();
        refreshToken = resData?.refreshToken;
      } else {
        // Email OTP verification with backend (passwordless)
        const cleanEmail = email.trim().toLowerCase();
        const payload = {
          otp: cleanOtp,
          email: cleanEmail,
        };

        const { data } = await api.post('/auth/verify-otp', payload);
        resData = data?.data;

        userObj = resData?.user || {
          _id: 'user_' + Date.now(),
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          phone: '',
          role: 'customer',
        };
        token = resData?.accessToken || 'ay_token_' + Date.now();
        refreshToken = resData?.refreshToken;
      }

      // Persist access token in localStorage immediately
      if (token) {
        localStorage.setItem('ay_access_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('ay_refresh_token', refreshToken);
      }

      const isDummyEmail = (em) => {
        if (!em) return true;
        const l = em.trim().toLowerCase();
        return (
          l.includes('@guest.') ||
          l.includes('@mobile.') ||
          l.endsWith('@guest.ama-yaar.com') ||
          l.endsWith('@mobile.ama-yaar.com') ||
          !l.includes('@') ||
          !l.includes('.')
        );
      };

      if (authMode === 'phone' && (resData?.needsEmail || isDummyEmail(userObj.email))) {
        setPendingPhoneUser(userObj);
        setEmail('');
        setStep('phone-email');
        setIsSubmitting(false);
        return;
      }

      // Check if user is missing their 10-digit mobile number (after Email OTP)
      const cleanPhone = (userObj?.phone || '').replace(/\D/g, '').slice(-10);
      const hasValidPhone = cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone) && userObj?.phone !== 'Google Sign-In';

      if (authMode === 'email' && (!hasValidPhone || resData?.needsPhone)) {
        setPendingPhonePromptUser(userObj);
        setPhonePromptSource('email');
        setPhone('');
        setStep('phone-prompt');
        setIsSubmitting(false);
        return;
      }

      // If already complete, sign in immediately
      dispatch(
        setCredentials({
          user: userObj,
          accessToken: token,
        })
      );

      sessionStorage.setItem('auth_popup_shown', 'true');
      setVerifiedUser(userObj);
      setSuccess(true);
      setIsSubmitting(false);

      setTimeout(() => {
        if (onSuccess) onSuccess(userObj);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Verification error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP code. Please check your SMS and enter the correct 6-digit code.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP code has expired. Please click "Resend OTP".');
      } else {
        setError(err.response?.data?.message || err.message || 'Verification failed. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  // Handle Step 3: Save Mandatory Full Name & Mobile Number after OTP Verification
  const handleSaveProfileDetails = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setError('Please enter your full name (at least 2 characters)');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeToken = pendingAuthUser?.accessToken || localStorage.getItem('ay_access_token');
      const config = activeToken ? { headers: { Authorization: `Bearer ${activeToken}` } } : {};

      const res = await api.put(
        '/users/profile',
        {
          name: cleanName,
          phone: cleanPhone,
        },
        config
      );

      const serverUserData = res.data?.data;
      const updatedUser = {
        ...(pendingAuthUser?.user || {}),
        name: cleanName,
        phone: cleanPhone,
        ...(serverUserData || {}),
      };

      dispatch(
        setCredentials({
          user: updatedUser,
          accessToken: activeToken,
        })
      );

      if (pendingAuthUser?.refreshToken) {
        localStorage.setItem('ay_refresh_token', pendingAuthUser.refreshToken);
      }

      sessionStorage.setItem('auth_popup_shown', 'true');
      setVerifiedUser(updatedUser);
      setSuccess(true);

      setTimeout(() => {
        if (onSuccess) onSuccess(updatedUser);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Failed to update profile details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save profile details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step: Save Mandatory Email after Phone OTP
  const handleSavePhoneEmail = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@gmail.com)');
      return;
    }

    if (
      cleanEmail.includes('@guest.') ||
      cleanEmail.includes('@mobile.') ||
      cleanEmail.endsWith('@guest.ama-yaar.com') ||
      cleanEmail.endsWith('@mobile.ama-yaar.com')
    ) {
      setError('Please enter your actual personal or business email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.put('/users/profile', { email: cleanEmail });
      const updatedUser = {
        ...(pendingPhoneUser || {}),
        email: cleanEmail,
        ...(res.data?.data || {}),
      };

      dispatch(setCredentials({ user: updatedUser }));
      sessionStorage.setItem('auth_popup_shown', 'true');
      setVerifiedUser(updatedUser);
      setSuccess(true);

      setTimeout(() => {
        if (onSuccess) onSuccess(updatedUser);
        onClose();
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save email address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Mandatory Mobile Number after Google or Email OTP Sign-In
  const handleSaveMobileNumber = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeToken = localStorage.getItem('ay_access_token');
      const config = activeToken ? { headers: { Authorization: `Bearer ${activeToken}` } } : {};
      const res = await api.put('/users/profile', { phone: cleanPhone }, config);

      const targetUser = pendingPhonePromptUser || pendingGoogleUser || {};
      const updatedUser = {
        ...targetUser,
        phone: cleanPhone,
        ...(res.data?.data || {}),
      };

      dispatch(setCredentials({ user: updatedUser, accessToken: activeToken }));
      localStorage.setItem('ay_user', JSON.stringify(updatedUser));
      sessionStorage.setItem('auth_popup_shown', 'true');
      setVerifiedUser(updatedUser);
      setSuccess(true);

      setTimeout(() => {
        if (onSuccess) onSuccess(updatedUser);
        onClose();
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save mobile number. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSaveGooglePhone = handleSaveMobileNumber;

  // Handle Google Login via Firebase
  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleSubmitting(true);

    try {
      const googleData = await signInWithGoogle();

      // Exchange with backend
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

      const cleanPhone = (userObj.phone || '').replace(/\D/g, '').slice(-10);
      const hasValidPhone = cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone) && userObj.phone !== 'Google Sign-In';

      if (!hasValidPhone || resData?.needsPhone) {
        setPendingPhonePromptUser(userObj);
        setPhonePromptSource('google');
        setPhone('');
        setStep('phone-prompt');
        return;
      }

      sessionStorage.setItem('auth_popup_shown', 'true');
      setVerifiedUser(userObj);
      setSuccess(true);

      setTimeout(() => {
        if (onSuccess) onSuccess(userObj);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in popup was closed. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // user clicked again, no error needed
      } else {
        setError(err.response?.data?.message || err.message || 'Google Sign-in failed. Please try again.');
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[840px] overflow-hidden rounded-[26px] bg-black text-white p-6 sm:p-10 border border-neutral-800 shadow-2xl"
      >
        {/* Close Button on Top Right */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 sm:right-6 sm:top-6 z-20 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* LEFT COLUMN: AMAYAAR + KwikPass branding & Welcome message */}
          <div className="flex flex-col justify-between py-2 sm:py-4">
            {/* Brand Header with Divider & KwikPass */}
            <div className="flex items-center gap-3">
              <div>
                <span className="font-sans text-2xl sm:text-3xl font-black uppercase tracking-tight text-white block leading-none">
                  AMAYAAR
                </span>
                <span className="text-[10px] sm:text-[11px] font-black tracking-[0.25em] uppercase text-neutral-400 block mt-1">
                  STYLE KA LAFDA
                </span>
              </div>
              <div className="h-8 w-[1.5px] bg-neutral-700 mx-1.5" />
              <div className="flex items-center gap-1.5 text-white font-bold text-sm tracking-wide">
                <span className="text-white font-black text-sm sm:text-base">Kwik</span>
                <span className="text-[#facc15] text-base leading-none font-black">⚡</span>
                <span className="text-white font-black text-sm sm:text-base">Pass</span>
              </div>
            </div>

            {/* Welcome Tagline */}
            <div className="mt-8 sm:mt-14">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.28em] text-neutral-400 block mb-2">
                FAST &amp; SECURE SIGN IN
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight text-white leading-[1.18]">
                Unlock instant access to exclusive fits!
              </h2>
              <p className="mt-3 text-xs text-neutral-400 leading-relaxed font-normal hidden sm:block">
                Sign in with Email OTP or Google to manage your orders, wishlist, and exclusive streetwear drops.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: White Card Container */}
          <div className="rounded-[22px] bg-white p-6 sm:p-8 text-neutral-900 shadow-xl flex flex-col justify-center min-h-[380px]">
            {success ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                  <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                  Welcome to AMA YAAR!
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-1">
                  {verifiedUser?.name ? `Signed in as ${verifiedUser.name}` : 'You are now signed in'}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-full">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Exclusive member deals activated
                </div>
              </div>
            ) : step === 'phone-email' ? (
              /* MANDATORY EMAIL ADDRESS STEP AFTER PHONE OTP */
              <div className="animate-in fade-in duration-200">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Phone Verified (+91 {phone.replace(/\D/g, '').slice(-10)})
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight mt-2">
                    Enter Email Address <span className="text-rose-500">*</span>
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                    Email address is mandatory for order confirmations, digital invoices, and courier tracking updates.
                  </p>
                </div>

                {error && (
                  <div className="mb-3 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSavePhoneEmail} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-700 block mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center rounded-xl border border-neutral-300 focus-within:border-black transition overflow-hidden bg-white">
                      <div className="bg-neutral-100 px-3 py-2.5 text-xs font-black text-neutral-500 border-r border-neutral-200 shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 shadow-none"
                        required
                        autoFocus
                      />
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
                      We'll send your tax invoices and order receipts to this email
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !email.includes('@')}
                    className="w-full rounded-xl bg-black py-3 text-center text-xs sm:text-sm font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving Email Address...' : 'COMPLETE SIGN IN →'}
                  </button>
                </form>
              </div>
            ) : step === 'phone-prompt' || step === 'google-phone' ? (
              /* MANDATORY MOBILE NUMBER STEP AFTER EMAIL OTP OR GOOGLE SIGN-IN */
              <div className="animate-in fade-in duration-200">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {phonePromptSource === 'google'
                      ? 'Google Account Verified'
                      : `Email Verified (${pendingPhonePromptUser?.email || email})`}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight mt-2">
                    Enter Mobile Number <span className="text-rose-500">*</span>
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                    Mobile number is mandatory for courier delivery, SMS dispatch updates, and order confirmations.
                  </p>
                </div>

                {error && (
                  <div className="mb-3 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSaveMobileNumber} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-700 block mb-1">
                      10-Digit Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center rounded-xl border border-neutral-300 focus-within:border-black transition overflow-hidden bg-white">
                      <div className="bg-neutral-100 px-3 py-2.5 text-xs font-black text-neutral-700 border-r border-neutral-200 shrink-0">
                        IN +91
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, ''));
                          setError('');
                        }}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 shadow-none"
                        required
                        autoFocus
                      />
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
                      Required for live courier delivery tracking and shipping calls
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || phone.replace(/\D/g, '').length !== 10}
                    className="w-full rounded-xl bg-black py-3 text-center text-xs sm:text-sm font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving Mobile Number...' : 'SAVE & CONTINUE →'}
                  </button>
                </form>
              </div>
            ) : step === 'input' ? (
              /* STEP 1: EMAIL / PHONE INPUT + GOOGLE LOGIN */
              <div>
                {/* Optional Tabs if Phone Login is enabled via env */}
                {isPhoneLoginEnabled && (
                  <div className="flex rounded-xl bg-neutral-100 p-1 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('email');
                        setError('');
                      }}
                      className={`flex-1 py-1.5 text-xs font-black rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        authMode === 'email'
                          ? 'bg-white text-black shadow-xs'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('phone');
                        setError('');
                      }}
                      className={`flex-1 py-1.5 text-xs font-black rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        authMode === 'phone'
                          ? 'bg-white text-black shadow-xs'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Mobile
                    </button>
                  </div>
                )}

                <h3 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                  {authMode === 'email' ? 'Enter Email Address' : 'Enter Mobile Number'}
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Sign in or create account with instant verification OTP
                </p>

                {error && (
                  <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">
                    {error}
                  </div>
                )}

                {/* Google Sign In Button */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleSubmitting || isSubmitting}
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
                    {isGoogleSubmitting ? 'Connecting to Google...' : 'Continue with Google'}
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

                <form onSubmit={handleSendOtp} className="space-y-3">
                  {authMode === 'email' ? (
                    /* Email Input */
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-600 block mb-1">
                        Email Address
                      </label>
                      <div className="relative flex items-center rounded-xl border border-neutral-300 focus-within:border-black transition overflow-hidden bg-white">
                        <div className="bg-neutral-100 px-3 py-2.5 text-xs text-neutral-600 border-r border-neutral-200 shrink-0">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 shadow-none"
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                  ) : (
                    /* Phone Input */
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-600 block mb-1">
                        Mobile Number
                      </label>
                      <div className="relative flex items-center rounded-xl border border-neutral-300 focus-within:border-black transition overflow-hidden bg-white">
                        <div className="bg-neutral-100 px-3 py-2.5 text-xs font-black text-neutral-700 border-r border-neutral-200 shrink-0">
                          IN +91
                        </div>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 shadow-none"
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                  )}

                  {/* Captcha Verification */}
                  <CaptchaBox
                    value={captchaInput}
                    onChange={(val) => {
                      setCaptchaInput(val);
                      setCaptchaError('');
                    }}
                    onCodeChange={setCaptchaCode}
                    onCodeGenerated={setCaptchaCode}
                    error={captchaError}
                  />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      (authMode === 'phone' ? phone.length !== 10 : !email.includes('@')) ||
                      captchaInput.length < 5
                    }
                    className="w-full rounded-xl bg-black py-3 text-center text-xs sm:text-sm font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending OTP...' : 'GET OTP →'}
                  </button>
                </form>
              </div>
            ) : (
              /* STEP 2: VERIFY OTP + FULL NAME + PASSWORD */
              <div>
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('input');
                      setError('');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-black transition cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                  <span className="text-[11px] font-bold text-neutral-500 truncate max-w-[200px]">
                    {authMode === 'email' ? email : `+91 ${phone}`}
                  </span>
                </div>

                <div className="mb-3">
                  <h3 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                    Verify &amp; Sign In
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    {authMode === 'email'
                      ? 'We sent a 6-digit verification code to your email'
                      : 'We sent a 6-digit SMS verification code to your phone via Firebase'}
                  </p>
                </div>

                {error && (
                  <div className="mb-3 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyAndSignIn} className="space-y-4">
                  {/* OTP Input */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-600 block mb-1">
                      {authMode === 'email' ? 'Enter 6-Digit Email Code' : 'Enter 6-Digit SMS OTP'}
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full rounded-xl border border-neutral-300 pl-10 pr-4 py-2 text-base font-black tracking-[0.3em] text-neutral-900 placeholder:text-neutral-300 focus:border-black focus:outline-none focus:ring-0 transition"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Resend Link */}
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || otp.length < 6}
                    className="w-full rounded-xl bg-black py-3 text-center text-xs sm:text-sm font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processing...' : 'VERIFY & SIGN IN'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Invisible Firebase reCAPTCHA container */}
        <div id="auth-recaptcha-container" />
      </div>
    </div>
  );
}
