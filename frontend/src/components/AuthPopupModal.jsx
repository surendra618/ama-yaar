import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { setCredentials } from '../features/auth/authSlice';

export default function AuthPopupModal({ isOpen, onClose }) {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['1', '2', '3', '4']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
      setSuccess(false);
      setOtp(['1', '2', '3', '4']);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setStep(2);
    // Dummy OTP auto-filled automatically
    setOtp(['1', '2', '3', '4']);
  };

  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    setError('');

    setTimeout(() => {
      const enteredOtp = otp.join('');
      if (enteredOtp.length < 4) {
        setError('Please enter a valid 4-digit OTP');
        setIsVerifying(false);
        return;
      }

      // Successful dummy authentication
      const userObj = {
        _id: 'user_' + Date.now(),
        name: name.trim() || 'Yaar ' + phone.slice(-4),
        phone: phone.trim(),
        email: `${phone.trim()}@amayaar.in`,
        role: 'user',
      };

      dispatch(
        setCredentials({
          user: userObj,
          accessToken: 'ay_token_' + Date.now(),
        })
      );

      setSuccess(true);
      setIsVerifying(false);

      setTimeout(() => {
        onClose();
      }, 1000);
    }, 400);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`auth-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      {/* Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] overflow-hidden bg-white shadow-2xl rounded-none border border-neutral-300"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(0,0,0,0.03) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(0,0,0,0.03) 0%, transparent 40%),
            linear-gradient(135deg, #ffffff 0%, #f7f7f7 100%)
          `,
        }}
      >
        {/* Subtle streetwear graffiti texture watermark */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06] select-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='60' font-family='sans-serif' font-weight='900' font-size='22' fill='%23000' transform='rotate(-25 60 60)'%3EAMA YAAR%3C/text%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Close Button on Top Right */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-20 flex h-7 w-7 items-center justify-center text-neutral-800 hover:text-black hover:bg-black/5 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5 stroke-[2.5]" />
        </button>

        <div className="relative z-10 px-6 sm:px-8 pt-7 pb-6">
          {/* Top Brand Logo */}
          <div className="flex flex-col items-center justify-center">
            <img
              src="/logo.png"
              alt="AMA YAAR"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
            />
          </div>

          {step === 1 ? (
            /* STEP 1: Details Entry */
            <div className="mt-4">
              <h3 className="text-center text-xs sm:text-[13px] font-black uppercase tracking-[0.18em] text-neutral-900 mb-5">
                ENTER YOUR DETAILS
              </h3>

              {error && (
                <div className="mb-3.5 rounded-none bg-rose-50 border border-rose-200 px-3 py-2 text-[11px] font-bold text-rose-700 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-3.5">
                {/* Name Input */}
                <div>
                  <input
                    type="text"
                    placeholder="Enter Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-xs sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:outline-hidden transition"
                  />
                </div>

                {/* Mobile Number Input with Country Code */}
                <div className="flex">
                  <div className="flex items-center gap-1.5 border border-r-0 border-neutral-300 bg-neutral-100 px-3 py-3 text-xs sm:text-[13px] font-bold text-neutral-800 shrink-0 select-none">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter Your Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-xs sm:text-[13px] font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:outline-hidden transition"
                  />
                </div>

                {/* SIGN UP Button */}
                <button
                  type="submit"
                  className="w-full mt-2 bg-black hover:bg-neutral-900 text-white py-3.5 text-xs sm:text-sm font-black uppercase tracking-[0.2em] transition duration-200 cursor-pointer shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  SIGN UP
                </button>
              </form>

              {/* Tagline & Slogan */}
              <p className="mt-5 text-center text-[10.5px] sm:text-[11px] font-black uppercase tracking-wider text-neutral-800 leading-snug px-1">
                GET EXCLUSIVE ACCESS TO SPECIAL OFFERS, LAUNCHES &amp; MORE.
              </p>

              {/* Legal Disclaimer */}
              <p className="mt-3.5 text-center text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">
                OFFER VALID FOR A LIMITED TIME, T&amp;C APPLIED*
              </p>
            </div>
          ) : (
            /* STEP 2: Dummy OTP Verification */
            <div className="mt-4">
              <h3 className="text-center text-xs sm:text-[13px] font-black uppercase tracking-[0.18em] text-neutral-900 mb-1">
                VERIFY PHONE NUMBER
              </h3>
              <p className="text-center text-[11px] text-neutral-500 font-medium mb-4">
                OTP sent to <span className="font-bold text-neutral-800">+91 {phone}</span>
              </p>

              {/* Auto-filled Dummy OTP Banner */}
              <div className="mb-4 flex items-center justify-center gap-1.5 rounded-none bg-emerald-50 border border-emerald-200 py-1.5 px-3 text-[11px] font-bold text-emerald-800 text-center animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Dummy OTP Auto-filled: 1234</span>
              </div>

              {error && (
                <div className="mb-3.5 rounded-none bg-rose-50 border border-rose-200 px-3 py-2 text-[11px] font-bold text-rose-700 text-center">
                  {error}
                </div>
              )}

              {success ? (
                <div className="py-6 flex flex-col items-center justify-center text-emerald-600 animate-in zoom-in-95">
                  <CheckCircle className="h-10 w-10 mb-2 stroke-[2.2]" />
                  <p className="text-sm font-black uppercase tracking-wider">Login Successful!</p>
                  <p className="text-xs text-neutral-500 mt-1">Welcome to AMA YAAR</p>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {/* 4-Digit OTP Boxes */}
                  <div className="flex justify-center items-center gap-3 py-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`auth-otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="h-12 w-12 text-center text-lg font-black border-2 border-neutral-900 bg-white text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-black transition shadow-xs"
                      />
                    ))}
                  </div>

                  {/* Verify & Proceed Button */}
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full bg-black hover:bg-neutral-900 text-white py-3.5 text-xs sm:text-sm font-black uppercase tracking-[0.2em] transition duration-200 cursor-pointer shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {isVerifying ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="font-semibold text-neutral-600 hover:text-black underline cursor-pointer"
                    >
                      Change Number
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtp(['1', '2', '3', '4']);
                      }}
                      className="font-bold text-neutral-800 hover:text-black underline cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
