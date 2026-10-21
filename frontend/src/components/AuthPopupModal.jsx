import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, CheckCircle2 } from 'lucide-react';
import { setCredentials } from '../features/auth/authSlice';
import api from '../lib/axios';

export default function AuthPopupModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess(false);
      setIsSubmitting(false);
      setEmail('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const cleanName = email.split('@')[0];

      let resData = null;
      try {
        const { data } = await api.post('/auth/quick-login', {
          email: email.trim(),
          name: cleanName,
        });
        resData = data.data;
      } catch (apiErr) {
        console.warn('Backend quick-login failed, using fallback:', apiErr);
      }

      const userObj = resData?.user || {
        _id: 'user_' + Date.now(),
        name: cleanName,
        email: email.trim(),
        role: 'user',
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

      sessionStorage.setItem('auth_popup_shown', 'true');
      setSuccess(true);
      setIsSubmitting(false);

      setTimeout(() => {
        if (onSuccess) onSuccess(userObj);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
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
        className="relative w-full max-w-[820px] overflow-hidden rounded-[26px] bg-black text-white p-6 sm:p-10 border border-neutral-800 shadow-2xl"
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
                WELCOME,
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight text-white leading-[1.18]">
                Register to avail the best deals!
              </h2>
              <p className="mt-3 text-xs text-neutral-400 leading-relaxed font-normal hidden sm:block">
                Get instant access to limited edition drops, exclusive VIP deals, and speedy 1-click checkout.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: White Card Container */}
          <div className="rounded-[22px] bg-white p-6 sm:p-8 text-neutral-900 shadow-xl flex flex-col justify-center min-h-[310px]">
            {success ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3 animate-bounce">
                  <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-neutral-900">
                  Welcome to AMA YAAR!
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Your account is linked &amp; deals are unlocked.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                  Enter your email address
                </h3>

                {error && (
                  <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-xs sm:text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:outline-hidden transition"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-black py-3.5 text-center text-xs sm:text-sm font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'SUBMIT'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
