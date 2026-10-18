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
} from 'lucide-react';
import api from '../../../lib/axios';
import Loader from '../../../components/Loader';
import FormField, { Input } from '../../../components/FormField';

export default function DeliverySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    deliveryCharge: 49,
    freeDeliveryThreshold: 500,
    isFreeDeliveryEnabled: true,
    isDeliveryFeeActive: true,
    estimatedDeliveryDays: '2-4 business days',
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
        });
      }
    } catch (err) {
      console.error('Failed to load delivery settings:', err);
      setError('Failed to fetch delivery settings. Please check backend connection.');
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

  const handlePreset = (preset) => {
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
    e.preventDefault();
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
      };

      const res = await api.put('/settings/delivery', payload);
      if (res.data?.success || res.status === 200) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to update delivery settings:', err);
      setError(err.response?.data?.message || 'Failed to save delivery settings');
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
            <Truck className="h-6 w-6 text-indigo-600" /> Delivery & Shipping Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure default delivery charges, free shipping thresholds, and estimated timelines across customer checkout.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Settings
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>Delivery charge settings have been updated and are now live for all cart & checkout operations!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Presets */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Quick Configuration Presets</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handlePreset('free_all')}
            className={`p-3 rounded-lg border text-left transition ${
              !formData.isDeliveryFeeActive
                ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <p className="text-xs font-bold text-slate-900">100% Free Shipping</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Free delivery on every order with no minimum spend</p>
          </button>

          <button
            type="button"
            onClick={() => handlePreset('standard')}
            className={`p-3 rounded-lg border text-left transition ${
              formData.isDeliveryFeeActive && formData.deliveryCharge === 49 && formData.freeDeliveryThreshold === 499
                ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <p className="text-xs font-bold text-slate-900">Standard Tier (₹49 / ₹499)</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Charge ₹49 below ₹499, Free for ₹499 and above</p>
          </button>

          <button
            type="button"
            onClick={() => handlePreset('premium')}
            className={`p-3 rounded-lg border text-left transition ${
              formData.isDeliveryFeeActive && formData.deliveryCharge === 99 && formData.freeDeliveryThreshold === 999
                ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <p className="text-xs font-bold text-slate-900">High Tier (₹99 / ₹999)</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Charge ₹99 below ₹999, Free for ₹999 and above</p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Settings Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-slate-700" /> Delivery Fee Rules
            </h2>

            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
              <div className="pr-4">
                <span className="text-xs font-bold text-slate-900 block">Charge Delivery Fees</span>
                <span className="text-[11px] text-slate-500">
                  When enabled, standard delivery fees will apply. If disabled, all orders enjoy free shipping.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleChange('isDeliveryFeeActive', !formData.isDeliveryFeeActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.isDeliveryFeeActive ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    formData.isDeliveryFeeActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {formData.isDeliveryFeeActive && (
              <>
                {/* Delivery Charge Input */}
                <FormField
                  label="Standard Delivery Charge (₹)"
                  hint="Amount added to orders that do not meet the free delivery criteria."
                  required
                >
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      className="pl-7"
                      value={formData.deliveryCharge}
                      onChange={(e) => handleChange('deliveryCharge', e.target.value)}
                      placeholder="49"
                      required
                    />
                  </div>
                </FormField>

                {/* Free Delivery Threshold Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-slate-900 block">Free Delivery on Qualifying Orders</span>
                    <span className="text-[11px] text-slate-500">
                      Waive delivery fee when cart subtotal meets or exceeds a minimum order amount.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange('isFreeDeliveryEnabled', !formData.isFreeDeliveryEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.isFreeDeliveryEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        formData.isFreeDeliveryEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Free Delivery Threshold Amount */}
                {formData.isFreeDeliveryEnabled && (
                  <FormField
                    label="Minimum Order Subtotal for FREE Delivery (₹)"
                    hint="Orders with subtotal equal or greater than this will have ₹0 delivery fee."
                    required
                  >
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        className="pl-7"
                        value={formData.freeDeliveryThreshold}
                        onChange={(e) => handleChange('freeDeliveryThreshold', e.target.value)}
                        placeholder="500"
                        required
                      />
                    </div>
                  </FormField>
                )}
              </>
            )}

            {/* Estimated Delivery Days */}
            <FormField
              label="Estimated Delivery Window"
              hint="Delivery expectation shown to buyers (e.g., '2-4 business days')."
            >
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  className="pl-9"
                  value={formData.estimatedDeliveryDays}
                  onChange={(e) => handleChange('estimatedDeliveryDays', e.target.value)}
                  placeholder="2-4 business days"
                />
              </div>
            </FormField>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-black transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Delivery Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Live Customer Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-indigo-600" /> Live Customer Simulation
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Interactive
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Adjust the simulated cart value below to verify how shipping fee displays to customers.
            </p>

            {/* Slider to test values */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Test Cart Subtotal:</span>
                <span className="font-bold text-slate-900">₹{previewSubtotal}</span>
              </div>
              <input
                type="range"
                min="50"
                max="1500"
                step="25"
                value={previewSubtotal}
                onChange={(e) => setPreviewSubtotal(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹50</span>
                <span>₹500</span>
                <span>₹1,000</span>
                <span>₹1,500</span>
              </div>
            </div>

            {/* Customer Cart Banner Preview */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cart Page Banner</p>
              {isFreeInPreview ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-emerald-950">Yay! You unlocked FREE Delivery!</span>
                    <span className="text-[10.5px] font-medium text-emerald-800">
                      {formData.estimatedDeliveryDays} express delivery
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-800 font-bold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white shrink-0">
                      <Truck className="h-4 w-4" />
                    </div>
                    <span>
                      Add items worth <span className="text-black font-black">₹{Math.max(0, formData.freeDeliveryThreshold - previewSubtotal)}</span> more for <strong className="text-emerald-600 uppercase font-black">FREE Delivery!</strong>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((previewSubtotal / (formData.freeDeliveryThreshold || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Breakdown Preview */}
            <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-2 text-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Checkout Breakdown</p>
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span>₹{previewSubtotal}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Estimated Delivery ({formData.estimatedDeliveryDays})</span>
                <span>
                  {calculatedFeeInPreview === 0 ? (
                    <strong className="text-emerald-600 font-black uppercase">FREE</strong>
                  ) : (
                    `₹${calculatedFeeInPreview}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (5%)</span>
                <span>₹{Math.round(previewSubtotal * 0.05)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Payable</span>
                <span>₹{previewSubtotal + calculatedFeeInPreview + Math.round(previewSubtotal * 0.05)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-[11px] text-indigo-900 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Any changes made here apply instantly across all live shopping sessions, cart calculation APIs, Razorpay checkout orders, and Cash on Delivery order creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
