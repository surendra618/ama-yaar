import { useEffect, useState } from 'react';
import { Bell, Mail, Shield, UserPlus, ShoppingBag, XCircle, RotateCcw, MessageSquare, Check, Save, AlertCircle, Info } from 'lucide-react';
import api from '../../../lib/axios';

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [settings, setSettings] = useState({
    notifyNewUser: true,
    notifyNewOrder: true,
    notifyOrderCancelled: true,
    notifyNewReturn: true,
    notifyNewContact: true,
    notifyAdminEmails: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings/delivery');
      const data = res.data?.data || {};
      setSettings({
        notifyNewUser: data.notifyNewUser ?? true,
        notifyNewOrder: data.notifyNewOrder ?? true,
        notifyOrderCancelled: data.notifyOrderCancelled ?? true,
        notifyNewReturn: data.notifyNewReturn ?? true,
        notifyNewContact: data.notifyNewContact ?? true,
        notifyAdminEmails: Array.isArray(data.notifyAdminEmails)
          ? data.notifyAdminEmails.join(', ')
          : (data.notifyAdminEmails || ''),
      });
    } catch (err) {
      setErrorMsg('Failed to load notification settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const emailList = settings.notifyAdminEmails
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.includes('@'));

      await api.put('/settings/delivery', {
        notifyNewUser: settings.notifyNewUser,
        notifyNewOrder: settings.notifyNewOrder,
        notifyOrderCancelled: settings.notifyOrderCancelled,
        notifyNewReturn: settings.notifyNewReturn,
        notifyNewContact: settings.notifyNewContact,
        notifyAdminEmails: emailList,
      });

      setSuccessMsg('Notification preferences saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const notificationCards = [
    {
      key: 'notifyNewUser',
      title: 'New Customer Sign-Up',
      desc: 'Get an email alert when a new user registers an account or signs in via quick checkout.',
      icon: UserPlus,
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    },
    {
      key: 'notifyNewOrder',
      title: 'New Order Placed',
      desc: 'Receive immediate email notifications whenever a customer completes a purchase with order summary and customer details.',
      icon: ShoppingBag,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    {
      key: 'notifyOrderCancelled',
      title: 'Order Cancelled',
      desc: 'Get notified when an order is cancelled by the customer or customer support team.',
      icon: XCircle,
      color: 'bg-rose-100 text-rose-700 border-rose-200',
    },
    {
      key: 'notifyNewReturn',
      title: 'Return / Exchange Requests',
      desc: 'Instant alert when a customer requests a return or size exchange for an order item.',
      icon: RotateCcw,
      color: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    {
      key: 'notifyNewContact',
      title: 'Customer Inquiry / Contact Message',
      desc: 'Get notified when a customer sends a query or message through the Contact Us form.',
      icon: MessageSquare,
      color: 'bg-sky-100 text-sky-700 border-sky-200',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Notification Settings</h1>
            <p className="text-sm font-medium text-slate-500">
              Configure automated email & in-app alerts sent to the administrative team
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 border border-emerald-200 shadow-xs">
          <Check className="h-5 w-5" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 border border-rose-200 shadow-xs">
          <AlertCircle className="h-5 w-5" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Recipient Emails Config */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900">Admin Notification Recipients</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Emails to receive administrative alerts. By default, all registered Admin team members receive them. You can add extra email addresses below (comma-separated).
              </p>
            </div>
          </div>

          <div className="mt-2">
            <input
              type="text"
              placeholder="e.g. pritamkumars5398@gmail.com, orders@amayaar.in, alert@gmail.com"
              value={settings.notifyAdminEmails}
              onChange={(e) => setSettings({ ...settings, notifyAdminEmails: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50"
            />
            <p className="text-[11px] font-medium text-slate-400 mt-1.5 flex items-center gap-1">
              <Info className="h-3 w-3" /> Separate multiple email addresses with commas.
            </p>
          </div>
        </div>

        {/* Event Toggles */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">Email Notification Triggers</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Turn ON/OFF specific notification emails sent to administrators
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {notificationCards.map((item) => {
              const Icon = item.icon;
              const isChecked = Boolean(settings[item.key]);

              return (
                <div
                  key={item.key}
                  onClick={() => handleToggle(item.key)}
                  className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/60 cursor-pointer transition"
                >
                  <div className="flex items-start gap-3.5 pr-4">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${item.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>

                  {/* Switch button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(item.key);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isChecked ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isChecked ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving Changes...' : 'Save Notification Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}

