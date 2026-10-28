import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Sliders,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Lock,
  Key,
} from 'lucide-react';

export default function AdminCarriersPage() {
  const [settings, setSettings] = useState(null);
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
        setSettings(res.data.settings);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load carrier settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCarrierChange = (carrierKey, field, value) => {
    setSettings((prev) => ({
      ...prev,
      carriers: {
        ...prev.carriers,
        [carrierKey]: {
          ...prev.carriers[carrierKey],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const res = await api.put('/admin/settings/carriers', {
        carriers: settings.carriers,
      });
      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update carrier settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 space-y-2">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-amber-500" />
        <p>Loading Master Carrier configurations...</p>
      </div>
    );
  }

  const carriers = settings?.carriers || {};

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="h-6 w-6 text-amber-500" /> Master Carrier API Integrations
          </h2>
          <p className="text-xs text-slate-500">
            Configure direct parent corporate accounts for courier partners (Delhivery, Blue Dart, DTDC, Shadowfax)
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Saving...' : 'Save All Carrier Keys'}</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Master carrier API settings updated and published to rate engine!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Carrier Cards */}
      <div className="space-y-6">
        {/* 1. Delhivery One */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center">
                DLV
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Delhivery One (Surface &amp; Express)
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">
                    Direct API
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Official B2B &amp; Direct D2C REST API integration</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={carriers.delhivery?.active ?? true}
                onChange={(e) => handleCarrierChange('delhivery', 'active', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">API Production / Sandbox Token</label>
              <input
                type="password"
                placeholder="e.g. 98a72bdf821739810a9bf72381290312"
                value={carriers.delhivery?.apiToken || ''}
                onChange={(e) => handleCarrierChange('delhivery', 'apiToken', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Registered Client Name</label>
              <input
                type="text"
                placeholder="e.g. AMAYAAR_LOGISTICS"
                value={carriers.delhivery?.clientName || ''}
                onChange={(e) => handleCarrierChange('delhivery', 'clientName', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Operational Mode</label>
              <select
                value={carriers.delhivery?.mode || 'sandbox'}
                onChange={(e) => handleCarrierChange('delhivery', 'mode', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white focus:outline-hidden focus:border-indigo-600"
              >
                <option value="sandbox">Sandbox / Staging (Mock AWBs)</option>
                <option value="production">Production Live Waybills</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Blue Dart Ground */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-700 text-white font-black text-xs flex items-center justify-center">
                BD
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Blue Dart Express &amp; Surface
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                    Corporate
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Premium SLA delivery across metro and tier 1 cities</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={carriers.bluedart?.active ?? true}
                onChange={(e) => handleCarrierChange('bluedart', 'active', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-700"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Customer Code</label>
              <input
                type="text"
                placeholder="e.g. BD-892102"
                value={carriers.bluedart?.customerCode || ''}
                onChange={(e) => handleCarrierChange('bluedart', 'customerCode', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Login ID</label>
              <input
                type="text"
                placeholder="e.g. AMABD_USER"
                value={carriers.bluedart?.loginId || ''}
                onChange={(e) => handleCarrierChange('bluedart', 'loginId', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">License Key</label>
              <input
                type="password"
                placeholder="e.g. bd_key_901238910"
                value={carriers.bluedart?.licenseKey || ''}
                onChange={(e) => handleCarrierChange('bluedart', 'licenseKey', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* 3. DTDC DotZot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center">
                DTDC
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  DTDC DotZot Priority
                  <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded">
                    Pan-India
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Extensive pincode reach across Tier 2, Tier 3, and remote towns</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={carriers.dtdc?.active ?? true}
                onChange={(e) => handleCarrierChange('dtdc', 'active', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Customer / GL Code</label>
              <input
                type="text"
                placeholder="e.g. GL-1002"
                value={carriers.dtdc?.customerCode || ''}
                onChange={(e) => handleCarrierChange('dtdc', 'customerCode', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">API Token</label>
              <input
                type="password"
                placeholder="e.g. dtdc_api_secret_token"
                value={carriers.dtdc?.apiToken || ''}
                onChange={(e) => handleCarrierChange('dtdc', 'apiToken', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* 4. Shadowfax Flash */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                SFX
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Shadowfax Flash &amp; Surface
                  <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded">
                    Hyperlocal &amp; Surface
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Fast intra-city dispatch and low-cost surface lines</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={carriers.shadowfax?.active ?? true}
                onChange={(e) => handleCarrierChange('shadowfax', 'active', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">API Key</label>
              <input
                type="password"
                placeholder="e.g. sfx_key_7712398410"
                value={carriers.shadowfax?.apiKey || ''}
                onChange={(e) => handleCarrierChange('shadowfax', 'apiKey', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Client Secret</label>
              <input
                type="password"
                placeholder="e.g. sfx_secret_8921"
                value={carriers.shadowfax?.clientSecret || ''}
                onChange={(e) => handleCarrierChange('shadowfax', 'clientSecret', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
