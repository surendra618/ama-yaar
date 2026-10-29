import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  IndianRupee,
  Save,
  CheckCircle2,
  RefreshCw,
  Percent,
  Sliders,
  DollarSign,
  AlertTriangle,
  Radio,
} from 'lucide-react';

export default function AdminRatesPage() {
  const [markupPercentage, setMarkupPercentage] = useState(12);
  const [flatFee, setFlatFee] = useState(40);
  const [percentageFee, setPercentageFee] = useState(2.0);
  const [announcement, setAnnouncement] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings/carriers');
      if (res.data?.success) {
        const s = res.data.settings;
        setMarkupPercentage(s.markupPercentage ?? 12);
        setFlatFee(s.codPricing?.flatFee ?? 40);
        setPercentageFee(s.codPricing?.percentageFee ?? 2.0);
        setAnnouncement(s.platformAnnouncement || '');
        setMaintenanceMode(s.maintenanceMode || false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rate settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const res = await api.put('/admin/settings/carriers', {
        markupPercentage: Number(markupPercentage),
        codPricing: {
          flatFee: Number(flatFee),
          percentageFee: Number(percentageFee),
        },
        platformAnnouncement: announcement,
        maintenanceMode,
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update rate configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 space-y-2">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-amber-500" />
        <p>Loading Platform Rate Rules...</p>
      </div>
    );
  }

  // Live simulation calculation preview
  const sampleBaseCourierRate = 45;
  const sampleMarkup = (sampleBaseCourierRate * (Number(markupPercentage) / 100)).toFixed(2);
  const sampleMerchantCharged = (sampleBaseCourierRate + Number(sampleMarkup)).toFixed(2);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-emerald-600" /> Platform Margins &amp; Pricing Engine
          </h2>
          <p className="text-xs text-slate-500">
            Control platform profit margins added to base courier tariffs and configure COD handling fees
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Saving...' : 'Publish Rate Changes'}</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Platform rate margins and COD pricing updated live!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Platform Profit Margin Markup */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Percent className="h-4 w-4 text-emerald-600" /> Freight Profit Margin Markup
              </h3>
              <p className="text-xs text-slate-500">
                Percentage added on top of actual courier corporate contracted rates charged to merchants
              </p>
            </div>
            <span className="text-xs font-black bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
              +{markupPercentage}% Gross Margin
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Markup Percentage (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={markupPercentage}
                  onChange={(e) => setMarkupPercentage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base font-black text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Recommended: 10% to 15% for optimal competitive pricing</p>
            </div>

            {/* Live Calculation Preview Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">Live Pricing Simulation</span>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-500">Base Delhivery Corporate Cost:</span>
                <span className="font-mono font-semibold">₹{sampleBaseCourierRate}.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80 text-emerald-700 font-semibold">
                <span>Platform Margin (+{markupPercentage}%):</span>
                <span className="font-mono">+₹{sampleMarkup}</span>
              </div>
              <div className="flex justify-between pt-1 font-black text-slate-900 text-sm">
                <span>Final Rate Quoted to Merchant:</span>
                <span className="font-mono">₹{sampleMerchantCharged}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Cash on Delivery (COD) Rules */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-500" /> Cash on Delivery (COD) Handling Terms
            </h3>
            <p className="text-xs text-slate-500">
              Fee deducted per COD shipment to cover courier cash collection and remittance risk
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Minimum Flat Fee (₹ INR)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="0"
                  value={flatFee}
                  onChange={(e) => setFlatFee(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Default flat charge: ₹40</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Percentage of Invoice Value (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={percentageFee}
                  onChange={(e) => setPercentageFee(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Whichever is higher (e.g. ₹40 or 2.0%)</p>
            </div>
          </div>
        </div>

        {/* Card 3: Announcement & Maintenance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Radio className="h-4 w-4 text-indigo-600" /> Network Broadcast Banner
            </h3>
            <p className="text-xs text-slate-500">
              Broadcasted message shown on all merchant dashboards
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Broadcast Message</label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="e.g. LogixWave network operating normally across all hubs."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-600"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
