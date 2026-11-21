import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import api from '../../../lib/axios';

export default function CreatorApplicationPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    ageConfirmed: true,
    primaryPlatform: 'Instagram',
    instagram: '',
    youtube: '',
    otherSocial: '',
    followerCount: '',
    contentNiche: 'Streetwear & Fashion',
    audienceLocation: 'India',
    portfolioUrl: '',
    bio: '',
    agreeTerms: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAuthenticated) {
      navigate('/creator/login', { state: { from: '/pages/creator-application' } });
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMsg('Please enter your full name, email, and phone number.');
      return;
    }

    if (!formData.instagram && !formData.youtube && !formData.otherSocial) {
      setErrorMsg('Please provide at least one social media handle or link.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/creators/apply', formData);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Application failed to submit.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-neutral-950 text-white">
        <div className="max-w-md w-full rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 text-center shadow-2xl">
          <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-5 border border-emerald-500/30">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider text-white">Application Received!</h2>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            Thank you for applying to the Amayaar Creator Program. Our editorial team will review your profile and reach out within 24–48 hours.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/creator/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black px-6 py-3.5 text-xs font-black uppercase tracking-wider hover:bg-neutral-200 transition"
            >
              Go to Creator Studio
            </Link>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Link
            to="/pages/creators"
            className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition mb-3 inline-block"
          >
            &larr; Back to Program Overview
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Creator Application
          </h1>
          <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto">
            Fill in your creator profile below to generate your affiliate tracking links and custom discount code.
          </p>
          <div className="mt-3">
            <Link
              to="/creator/login"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition inline-flex items-center gap-1"
            >
              Already registered as a creator? Sign In to Creator Studio &rarr;
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 sm:p-10 space-y-6">
          {errorMsg && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-bold text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              {errorMsg}
            </div>
          )}

          {/* Section: Basic Info */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-4 border-b border-neutral-800 pb-2">
              1. Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Aman Verma"
                  className="w-full rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs font-semibold text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="creator@example.com"
                  className="w-full rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs font-semibold text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs font-semibold text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Audience Location</label>
                <input
                  type="text"
                  name="audienceLocation"
                  value={formData.audienceLocation}
                  onChange={handleChange}
                  placeholder="India, Delhi, Mumbai, etc."
                  className="w-full rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs font-semibold text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Social Media & Audience */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-4 border-b border-neutral-800 pb-2">
              2. Social Channels &amp; Content
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Primary Platform</label>
                  <select
                    name="primaryPlatform"
                    value={formData.primaryPlatform}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs font-semibold text-white focus:border-white focus:outline-none"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok / Reels</option>
                    <option value="Other">Other Community</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Followers / Subscribers</label>
                  <input
                    type="number"
                    name="followerCount"
                    value={formData.followerCount}
                    onChange={handleChange}
                    placeholder="e.g. 15000"
                    className="w-full rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs font-semibold text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Instagram Handle / URL</label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="@yourhandle or profile link"
                    className="w-full rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs font-semibold text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">YouTube Channel URL</label>
                  <input
                    type="text"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleChange}
                    placeholder="https://youtube.com/@..."
                    className="w-full rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs font-semibold text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Portfolio or Sample Reels Link (Optional)</label>
                <input
                  type="text"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  placeholder="Google Drive, Linktree, or portfolio link"
                  className="w-full rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs font-semibold text-white placeholder-neutral-600 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Short Bio / Creator Style</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us a little about your aesthetic, styling niche, and why you want to rep Amayaar..."
                  className="w-full rounded-xl border border-neutral-800 bg-black/60 p-4 text-xs font-semibold text-white placeholder-neutral-600 focus:border-white focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="ageConfirmed"
                checked={formData.ageConfirmed}
                onChange={handleChange}
                className="mt-0.5 rounded border-neutral-700 bg-black text-white accent-white"
              />
              <span className="text-[11px] text-neutral-400 font-medium">
                I confirm that I am at least 18 years of age and eligible to participate in affiliate advertising.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="agreeTerms"
                required
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-0.5 rounded border-neutral-700 bg-black text-white accent-white"
              />
              <span className="text-[11px] text-neutral-400 font-medium">
                I agree to the Amayaar Creator Terms &amp; Conditions, Affiliate Disclosure Rules, and Privacy Policy.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white text-black py-4 text-xs font-black uppercase tracking-wider hover:bg-neutral-200 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {loading ? 'Submitting Application...' : 'Submit Application &rarr;'}
          </button>
        </form>
      </div>
    </div>
  );
}
