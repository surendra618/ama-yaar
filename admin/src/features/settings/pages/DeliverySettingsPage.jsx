import React, { useEffect, useState } from 'react';
import {
  Truck,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
  ShoppingBag,
  Info,
  RotateCcw,
  FileText,
  Eye,
  Check,
} from 'lucide-react';
import api from '../../../lib/axios';
import Loader from '../../../components/Loader';

export default function DeliverySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('delivery'); // 'delivery' | 'exchange' | 'details' | 'preview'
  const [previewTab, setPreviewTab] = useState('description'); // for the storefront tab preview

  const [formData, setFormData] = useState({
    // Delivery
    deliveryCharge: 49,
    freeDeliveryThreshold: 500,
    isFreeDeliveryEnabled: true,
    isDeliveryFeeActive: true,
    estimatedDeliveryDays: '2-4 business days',
    // Exchange Policy
    exchangePolicyEnabled: true,
    exchangeDays: 7,
    exchangeCharge: 0,
    isExchangeFree: true,
    exchangePolicyText:
      'Hassle-free 7-day doorstep exchange & return. Items must be in original condition, unworn, unwashed with original brand tags attached.',
    returnPolicyText:
      'Easy returns within 7 days of delivery. Refunds are credited to the original payment mode or store credit within 24-48 hours after quality check.',
    // Product Details Defaults
    defaultFabric: '100% Super Combed Terry Cotton',
    defaultGsm: '380 GSM Heavyweight Fabric',
    defaultFit: 'Oversized Streetwear Fit, Dropped Shoulder',
    defaultCare:
      'Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low.',
    defaultCountryOfOrigin: 'India',
    defaultStylingTip:
      'Complete the look with our Black Rugged Jeans or Cargo Pants and clean white sneakers for an effortless street vibe.',
    defaultWhatsOnPrint:
      'High-density puff and screen print with reinforced twin needle stitching.',
  });

  const [previewSubtotal, setPreviewSubtotal] = useState(399);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/settings/delivery');
      const data = res.data?.data || res.data;
      if (data) {
        setFormData({
          deliveryCharge: data.deliveryCharge ?? 49,
          freeDeliveryThreshold: data.freeDeliveryThreshold ?? 500,
          isFreeDeliveryEnabled: data.isFreeDeliveryEnabled ?? true,
          isDeliveryFeeActive: data.isDeliveryFeeActive ?? true,
          estimatedDeliveryDays: data.estimatedDeliveryDays || '2-4 business days',
          exchangePolicyEnabled: data.exchangePolicyEnabled ?? true,
          exchangeDays: data.exchangeDays ?? 7,
          exchangeCharge: data.exchangeCharge ?? 0,
          isExchangeFree: data.isExchangeFree ?? true,
          exchangePolicyText:
            data.exchangePolicyText ||
            'Hassle-free 7-day doorstep exchange & return. Items must be in original condition, unworn, unwashed with original brand tags attached.',
          returnPolicyText:
            data.returnPolicyText ||
            'Easy returns within 7 days of delivery. Refunds are credited to the original payment mode or store credit within 24-48 hours after quality check.',
          defaultFabric: data.defaultFabric || '100% Super Combed Terry Cotton',
          defaultGsm: data.defaultGsm || '380 GSM Heavyweight Fabric',
          defaultFit: data.defaultFit || 'Oversized Streetwear Fit, Dropped Shoulder',
          defaultCare:
            data.defaultCare ||
            'Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low.',
          defaultCountryOfOrigin: data.defaultCountryOfOrigin || 'India',
          defaultStylingTip:
            data.defaultStylingTip ||
            'Complete the look with our Black Rugged Jeans or Cargo Pants and clean white sneakers for an effortless street vibe.',
          defaultWhatsOnPrint:
            data.defaultWhatsOnPrint ||
            'High-density puff and screen print with reinforced twin needle stitching.',
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to fetch settings. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveSuccess(false);
  };

  const handleDeliveryPreset = (preset) => {
    if (preset === 'free_all') {
      setFormData((prev) => ({
        ...prev,
        isDeliveryFeeActive: false,
      }));
    } else if (preset === 'standard') {
      setFormData((prev) => ({
        ...prev,
        isDeliveryFeeActive: true,
        deliveryCharge: 49,
        freeDeliveryThreshold: 499,
        isFreeDeliveryEnabled: true,
      }));
    } else if (preset === 'premium') {
      setFormData((prev) => ({
        ...prev,
        isDeliveryFeeActive: true,
        deliveryCharge: 99,
        freeDeliveryThreshold: 999,
        isFreeDeliveryEnabled: true,
      }));
    }
    setSaveSuccess(false);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        deliveryCharge: Number(formData.deliveryCharge),
        freeDeliveryThreshold: Number(formData.freeDeliveryThreshold),
        isFreeDeliveryEnabled: Boolean(formData.isFreeDeliveryEnabled),
        isDeliveryFeeActive: Boolean(formData.isDeliveryFeeActive),
        estimatedDeliveryDays: String(formData.estimatedDeliveryDays).trim(),
        exchangePolicyEnabled: Boolean(formData.exchangePolicyEnabled),
        exchangeDays: Number(formData.exchangeDays),
        exchangeCharge: Number(formData.exchangeCharge),
        isExchangeFree: Boolean(formData.isExchangeFree),
        exchangePolicyText: String(formData.exchangePolicyText).trim(),
        returnPolicyText: String(formData.returnPolicyText).trim(),
        defaultFabric: String(formData.defaultFabric).trim(),
        defaultGsm: String(formData.defaultGsm).trim(),
        defaultFit: String(formData.defaultFit).trim(),
        defaultCare: String(formData.defaultCare).trim(),
        defaultCountryOfOrigin: String(formData.defaultCountryOfOrigin).trim(),
        defaultStylingTip: String(formData.defaultStylingTip).trim(),
        defaultWhatsOnPrint: String(formData.defaultWhatsOnPrint).trim(),
      };

      const res = await api.put('/settings/delivery', payload);
      if (res.data?.success || res.status === 200) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Preview calculations
  const isFreeInPreview =
    !formData.isDeliveryFeeActive ||
    (formData.isFreeDeliveryEnabled && previewSubtotal >= formData.freeDeliveryThreshold);
  const calculatedFeeInPreview = isFreeInPreview ? 0 : Number(formData.deliveryCharge);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="h-6 w-6 text-indigo-600" /> Delivery, Exchange & Details Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure delivery charges, exchange policies, and default product description & details shown across your storefront.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save All Settings
            </>
          )}
        </button>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            Settings successfully saved and published! Storefront delivery calculations, exchange policy, and product details are now live.
          </span>
        </div>
      )}

      {/* Error Notification Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('delivery')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'delivery'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="h-4 w-4" /> Delivery Charges
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exchange')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'exchange'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="h-4 w-4" /> Exchange Policy & Charges
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'details'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" /> Description & Details Defaults
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'preview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="h-4 w-4" /> Storefront Live Preview
        </button>
      </div>

      {/* TAB 1: DELIVERY CHARGES */}
      {activeTab === 'delivery' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Presets */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> One-Click Presets
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDeliveryPreset('free_all')}
                  className="rounded-lg border border-slate-200 p-3 text-left hover:border-indigo-500 hover:bg-indigo-50/30 transition cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-900">Free Everywhere</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">₹0 delivery on all orders</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeliveryPreset('standard')}
                  className="rounded-lg border border-slate-200 p-3 text-left hover:border-indigo-500 hover:bg-indigo-50/30 transition cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-900">Standard Tier</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">₹49 fee, Free above ₹499</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeliveryPreset('premium')}
                  className="rounded-lg border border-slate-200 p-3 text-left hover:border-indigo-500 hover:bg-indigo-50/30 transition cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-900">Express Tier</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">₹99 fee, Free above ₹999</p>
                </button>
              </div>
            </div>

            {/* Main Delivery Controls Form */}
            <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
              <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Delivery Fee & Free Shipping Rules
              </h2>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-900">Enable Delivery Charges</p>
                  <p className="text-[11px] text-slate-500">When disabled, all orders get free shipping across the store.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDeliveryFeeActive}
                    onChange={(e) => handleChange('isDeliveryFeeActive', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Standard Delivery Fee (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.deliveryCharge}
                      onChange={(e) => handleChange('deliveryCharge', e.target.value)}
                      disabled={!formData.isDeliveryFeeActive}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-1">Default fee charged on eligible orders.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Free Delivery Threshold (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.freeDeliveryThreshold}
                      onChange={(e) => handleChange('freeDeliveryThreshold', e.target.value)}
                      disabled={!formData.isFreeDeliveryEnabled || !formData.isDeliveryFeeActive}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-1">Orders at or above this subtotal ship free.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Delivery Timeline
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.estimatedDeliveryDays}
                    onChange={(e) => handleChange('estimatedDeliveryDays', e.target.value)}
                    placeholder="e.g. 2-4 business days"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
                <p className="text-[10.5px] text-slate-500 mt-1">Shown on product details and checkout.</p>
              </div>
            </form>
          </div>

          {/* Checkout Preview Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
              <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                <ShoppingBag className="h-4 w-4 text-indigo-600" /> Live Checkout Simulator
              </h3>
              <p className="text-[11px] text-slate-600 mb-3">
                Test how the configured shipping fees apply based on customer cart value.
              </p>

              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Simulated Cart Subtotal (₹)
              </label>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={previewSubtotal}
                onChange={(e) => setPreviewSubtotal(Number(e.target.value))}
                className="w-full accent-indigo-600 mb-2 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-3">
                <span>₹0</span>
                <span className="text-indigo-600 font-extrabold text-sm">₹{previewSubtotal}</span>
                <span>₹2,000+</span>
              </div>

              <div className="p-3 rounded-lg bg-white border border-indigo-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">₹{previewSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee:</span>
                  <span className={`font-bold ${isFreeInPreview ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {isFreeInPreview ? 'FREE' : `₹${calculatedFeeInPreview}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-indigo-600 font-extrabold">₹{previewSubtotal + calculatedFeeInPreview}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXCHANGE POLICY & CHARGES */}
      {activeTab === 'exchange' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
              <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-indigo-600" /> Exchange & Return Rules
              </h2>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-900">Enable Exchange Policy Tab</p>
                  <p className="text-[11px] text-slate-500">Show the Exchange Policy tab on the product details page.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.exchangePolicyEnabled}
                    onChange={(e) => handleChange('exchangePolicyEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exchange Window (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.exchangeDays}
                    onChange={(e) => handleChange('exchangeDays', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                  />
                  <p className="text-[10.5px] text-slate-500 mt-1">e.g. 7 days or 14 days after delivery.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exchange / Reverse Pickup Fee (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.exchangeCharge}
                      onChange={(e) => handleChange('exchangeCharge', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-1">Set ₹0 for completely free exchanges.</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-900">Free Exchange on Size & Fit Issues</p>
                  <p className="text-[11px] text-slate-500">Waive exchange fee if customer requests size change or defect.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isExchangeFree}
                    onChange={(e) => handleChange('isExchangeFree', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exchange Policy Details (Displayed under Exchange Policy Tab)
                </label>
                <textarea
                  rows="3"
                  value={formData.exchangePolicyText}
                  onChange={(e) => handleChange('exchangePolicyText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Return & Refund Policy Details
                </label>
                <textarea
                  rows="3"
                  value={formData.returnPolicyText}
                  onChange={(e) => handleChange('returnPolicyText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden leading-relaxed"
                />
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Policy Summary
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>{formData.exchangeDays} Days Window:</strong> Customers can initiate exchange within {formData.exchangeDays} days.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Fee:</strong> {formData.exchangeCharge > 0 ? `₹${formData.exchangeCharge} reverse pickup charge` : '100% Free doorstep exchange'}.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Doorstep Pickup:</strong> Couriers pick up returned item during exchange delivery.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DESCRIPTION & DETAILS DEFAULTS */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
              <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" /> Default Product Details Specifications
              </h2>
              <p className="text-xs text-slate-500">
                These defaults are displayed under the <strong>Details</strong> and <strong>Description</strong> tabs on the product page when custom product values are not specified.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fabric / Material
                  </label>
                  <input
                    type="text"
                    value={formData.defaultFabric}
                    onChange={(e) => handleChange('defaultFabric', e.target.value)}
                    placeholder="e.g. 100% Super Combed Terry Cotton"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fabric Weight / GSM
                  </label>
                  <input
                    type="text"
                    value={formData.defaultGsm}
                    onChange={(e) => handleChange('defaultGsm', e.target.value)}
                    placeholder="e.g. 380 GSM Heavyweight Fabric"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fit & Silhouette
                  </label>
                  <input
                    type="text"
                    value={formData.defaultFit}
                    onChange={(e) => handleChange('defaultFit', e.target.value)}
                    placeholder="e.g. Oversized Streetwear Fit, Dropped Shoulder"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country of Origin
                  </label>
                  <input
                    type="text"
                    value={formData.defaultCountryOfOrigin}
                    onChange={(e) => handleChange('defaultCountryOfOrigin', e.target.value)}
                    placeholder="e.g. India"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wash & Garment Care Instructions
                </label>
                <textarea
                  rows="2"
                  value={formData.defaultCare}
                  onChange={(e) => handleChange('defaultCare', e.target.value)}
                  placeholder="e.g. Machine wash cold inside out with similar colors..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What's on Print / Graphic Features
                </label>
                <textarea
                  rows="2"
                  value={formData.defaultWhatsOnPrint}
                  onChange={(e) => handleChange('defaultWhatsOnPrint', e.target.value)}
                  placeholder="e.g. High-density puff and screen print with reinforced stitching."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Styling Tip (Shown under Description Tab)
                </label>
                <textarea
                  rows="2"
                  value={formData.defaultStylingTip}
                  onChange={(e) => handleChange('defaultStylingTip', e.target.value)}
                  placeholder="e.g. Complete the look with our Black Rugged Jeans..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                />
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Tip: Product Overrides
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                When you create or edit individual products in the Catalog, you can provide custom descriptions. If left empty, these global defaults will automatically appear for that product.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STOREFRONT LIVE PREVIEW (Exact match to User Screenshot) */}
      {activeTab === 'preview' && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-neutral-300 bg-white p-6 shadow-md font-sans">
          <div className="border-b border-neutral-200 pb-2 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Storefront Customer View Preview
            </span>
            <h3 className="text-base font-bold text-neutral-900 mt-1">Concrete Dreams Black Zipper Hoodie</h3>
            <p className="text-xs text-neutral-500">₹ 2,199.00 <span className="line-through text-neutral-400">₹ 2,999.00</span> <span className="text-rose-600 font-bold">SAVE 26%</span></p>
          </div>

          {/* 3 Tabs Header (Exact match to user screenshot) */}
          <div className="flex border-b border-neutral-200 justify-around text-xs font-medium text-neutral-500">
            <button
              type="button"
              onClick={() => setPreviewTab('description')}
              className={`pb-2.5 px-4 transition cursor-pointer relative ${
                previewTab === 'description' ? 'text-black font-bold' : 'hover:text-black'
              }`}
            >
              Description
              {previewTab === 'description' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setPreviewTab('details')}
              className={`pb-2.5 px-4 transition cursor-pointer relative ${
                previewTab === 'details' ? 'text-black font-bold' : 'hover:text-black'
              }`}
            >
              Details
              {previewTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setPreviewTab('exchange')}
              className={`pb-2.5 px-4 transition cursor-pointer relative ${
                previewTab === 'exchange' ? 'text-black font-bold' : 'hover:text-black'
              }`}
            >
              Exchange Policy
              {previewTab === 'exchange' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="pt-4 text-xs text-neutral-700 leading-relaxed min-h-[160px]">
            {previewTab === 'description' && (
              <div className="space-y-3">
                <p>
                  The Concrete Dreams Zip Hoodie is a statement piece rooted in street culture and ambition. Crafted in deep black with bold hot-pink sleeve graphics, this hoodie represents resilience, grind, and the dreams that rise from the concrete.
                </p>
                <div>
                  <p className="font-bold text-neutral-900">Whats on Print:</p>
                  <p>{formData.defaultWhatsOnPrint}</p>
                </div>
                <div>
                  <p className="font-bold text-neutral-900">Styling Tip:</p>
                  <p>{formData.defaultStylingTip}</p>
                </div>
              </div>
            )}

            {previewTab === 'details' && (
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="font-semibold text-neutral-500">Fabric</span>
                  <span className="font-medium text-neutral-900">{formData.defaultFabric}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="font-semibold text-neutral-500">Fabric Weight</span>
                  <span className="font-medium text-neutral-900">{formData.defaultGsm}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="font-semibold text-neutral-500">Fit</span>
                  <span className="font-medium text-neutral-900">{formData.defaultFit}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="font-semibold text-neutral-500">Country of Origin</span>
                  <span className="font-medium text-neutral-900">{formData.defaultCountryOfOrigin}</span>
                </div>
                <div className="py-1">
                  <span className="font-semibold text-neutral-500 block mb-0.5">Care Instructions</span>
                  <span className="text-neutral-700 text-[11px]">{formData.defaultCare}</span>
                </div>
              </div>
            )}

            {previewTab === 'exchange' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <span className="font-bold text-neutral-900 flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-indigo-600" /> {formData.exchangeDays} Days Doorstep Exchange & Return
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {formData.exchangeCharge > 0 ? `₹${formData.exchangeCharge} Fee` : 'FREE EXCHANGE'}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-neutral-900">Delivery & Shipping Charges:</p>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    Standard delivery is ₹{formData.deliveryCharge}.00 {formData.isFreeDeliveryEnabled && `(FREE on orders above ₹${formData.freeDeliveryThreshold}.00)`}. Estimated arrival in {formData.estimatedDeliveryDays}.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-neutral-900">Exchange Guidelines:</p>
                  <p className="text-[11px] text-neutral-600 mt-0.5">{formData.exchangePolicyText}</p>
                </div>
                <div>
                  <p className="font-bold text-neutral-900">Refunds:</p>
                  <p className="text-[11px] text-neutral-600 mt-0.5">{formData.returnPolicyText}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
