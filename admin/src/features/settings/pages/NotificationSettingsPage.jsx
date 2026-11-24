import { useEffect, useState } from 'react';
import {
  Bell,
  Mail,
  Shield,
  UserPlus,
  ShoppingBag,
  XCircle,
  RotateCcw,
  MessageSquare,
  Check,
  Save,
  AlertCircle,
  Info,
  Send,
  Radio,
  Users,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Layers,
  Lock,
  AlertTriangle,
  Flame,
  Truck,
  PackageCheck,
  SendHorizontal,
} from 'lucide-react';
import api from '../../../lib/axios';

export default function NotificationSettingsPage() {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'customer' | 'broadcast'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Settings State
  const [settings, setSettings] = useState({
    notifyNewUser: true,
    notifyNewOrder: true,
    notifyOrderCancelled: true,
    notifyNewReturn: true,
    notifyNewContact: true,
    notifyLowStock: true,
    notifyAdminEmails: '',
    customerWelcomeEmail: true,
    customerOrderConfirmationEmail: true,
    customerOrderStatusEmail: true,
  });

  // Email System Stats
  const [stats, setStats] = useState({
    totalAudience: 0,
    totalCustomers: 0,
    totalSubscribers: 0,
    smtpConfigured: false,
    smtpUser: '',
    broadcastLimit: 50,
  });

  // Test Email State
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testEmailType, setTestEmailType] = useState('system');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState('');
  const [testErrorMsg, setTestErrorMsg] = useState('');

  // Broadcast Form State
  const [broadcastForm, setBroadcastForm] = useState({
    subject: '',
    title: '',
    badge: 'COMMUNITY DROP',
    message: '',
    actionLabel: 'Shop Now',
    actionUrl: 'https://amayaar.in',
    recipientType: 'all', // 'all' | 'customers' | 'buyers' | 'subscribers' | 'custom'
    customEmails: '',
  });
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, statsRes] = await Promise.allSettled([
        api.get('/settings/delivery'),
        api.get('/settings/email-stats'),
      ]);

      if (settingsRes.status === 'fulfilled') {
        const data = settingsRes.value.data?.data || {};
        setSettings({
          notifyNewUser: data.notifyNewUser ?? true,
          notifyNewOrder: data.notifyNewOrder ?? true,
          notifyOrderCancelled: data.notifyOrderCancelled ?? true,
          notifyNewReturn: data.notifyNewReturn ?? true,
          notifyNewContact: data.notifyNewContact ?? true,
          notifyLowStock: data.notifyLowStock ?? true,
          customerWelcomeEmail: data.customerWelcomeEmail ?? true,
          customerOrderConfirmationEmail: data.customerOrderConfirmationEmail ?? true,
          customerOrderStatusEmail: data.customerOrderStatusEmail ?? true,
          notifyAdminEmails: Array.isArray(data.notifyAdminEmails)
            ? data.notifyAdminEmails.join(', ')
            : data.notifyAdminEmails || '',
        });
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data?.data || {});
      }
    } catch (err) {
      setErrorMsg('Failed to load notification settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
        notifyLowStock: settings.notifyLowStock,
        customerWelcomeEmail: settings.customerWelcomeEmail,
        customerOrderConfirmationEmail: settings.customerOrderConfirmationEmail,
        customerOrderStatusEmail: settings.customerOrderStatusEmail,
        notifyAdminEmails: emailList,
      });

      setSuccessMsg('Notification preferences updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (type = 'system') => {
    setSendingTest(true);
    setTestSuccessMsg('');
    setTestErrorMsg('');

    try {
      const target = testEmailAddress.trim() || undefined;
      const res = await api.post('/settings/test-email', {
        to: target,
        type,
      });

      setTestSuccessMsg(res.data?.message || 'Test email dispatched successfully!');
      setTimeout(() => setTestSuccessMsg(''), 5000);
    } catch (err) {
      setTestErrorMsg(err.response?.data?.message || err.message || 'Failed to dispatch test email.');
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendBroadcast = async () => {
    setShowConfirmModal(false);
    setBroadcasting(true);
    setBroadcastResult(null);
    setErrorMsg('');

    try {
      const res = await api.post('/settings/broadcast-email', broadcastForm);
      setBroadcastResult(res.data?.data || null);
      setSuccessMsg(res.data?.message || 'Broadcast campaign sent successfully!');
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to dispatch broadcast campaign.');
    } finally {
      setBroadcasting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Admin Notification Cards
  const adminCards = [
    {
      key: 'notifyNewUser',
      title: 'New Customer Sign-Up',
      desc: 'Instant email alert whenever a new customer registers an account via Email OTP, Google, or phone sign-in.',
      icon: UserPlus,
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    },
    {
      key: 'notifyNewOrder',
      title: 'New Order Received',
      desc: 'Immediate notification when a customer places an order (COD or Online) with line-items, total amount, and shipping details.',
      icon: ShoppingBag,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    {
      key: 'notifyOrderCancelled',
      title: 'Order Cancelled Alert',
      desc: 'Immediate alert when an order is cancelled by the customer or store staff.',
      icon: XCircle,
      color: 'bg-rose-100 text-rose-700 border-rose-200',
    },
    {
      key: 'notifyNewReturn',
      title: 'Return / Exchange Request',
      desc: 'Instant alert when a customer initiates a 7-day doorstep size exchange or return.',
      icon: RotateCcw,
      color: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    {
      key: 'notifyNewContact',
      title: 'Customer Contact Inquiry',
      desc: 'Notification when a shopper submits a message through the store Contact Us form.',
      icon: MessageSquare,
      color: 'bg-sky-100 text-sky-700 border-sky-200',
    },
    {
      key: 'notifyLowStock',
      title: 'Low Inventory Alert',
      desc: 'Alert admins when any product size inventory drops below safety stock threshold.',
      icon: AlertTriangle,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
    },
  ];

  // Customer Lifecycle Cards
  const customerCards = [
    {
      key: 'customerWelcomeEmail',
      title: 'Customer Welcome Email',
      desc: 'Dispatched to every newly joined customer with brand streetwear aesthetic and 10% welcome voucher code (WELCOME10).',
      icon: Flame,
      color: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    {
      key: 'customerOrderConfirmationEmail',
      title: 'Order Confirmation Email',
      desc: 'Dispatched immediately when an order is placed (COD) or payment is captured (Razorpay) with full itemized breakdown.',
      icon: PackageCheck,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    {
      key: 'customerOrderStatusEmail',
      title: 'Order Status Updates (Dispatched & Delivered)',
      desc: 'Dispatched to customer when order status updates to Shipped/In Transit (with courier AWB tracking) or Delivered.',
      icon: Truck,
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Email &amp; Notification Hub
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              Control administrative alerts, automated customer journey emails, and mass announcements.
            </p>
          </div>
        </div>

        {/* SMTP Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-full bg-slate-100 px-3.5 py-1.5 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
          <span className={`h-2.5 w-2.5 rounded-full ${stats.smtpConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span>{stats.smtpConfigured ? `SMTP Live (${stats.smtpUser || 'Active'})` : 'SMTP Disconnected'}</span>
        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 p-4 text-xs sm:text-sm font-bold text-emerald-800 border border-emerald-200 shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 p-4 text-xs sm:text-sm font-bold text-rose-800 border border-rose-200 shadow-xs">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100/80 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'admin'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Admin Alerts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('customer')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'customer'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Customer Emails</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('broadcast')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'broadcast'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <SendHorizontal className="h-4 w-4" />
          <span>Broadcast Campaign</span>
          <span className="hidden sm:inline-block rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-black text-indigo-700">
            CAP 50
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ADMIN ALERTS & RECIPIENTS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'admin' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Admin Notification Recipients Configuration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Admin Notification Recipients
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Specify who receives administrative notifications. By default, all registered Admin accounts receive alerts automatically. You can add extra email addresses below.
                </p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                Extra Recipient Emails (Comma-Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. orders@amayaar.in, manager@gmail.com, alerts@gmail.com"
                value={settings.notifyAdminEmails}
                onChange={(e) => setSettings({ ...settings, notifyAdminEmails: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-semibold focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 bg-slate-50/50"
              />
              <p className="text-[11px] font-medium text-slate-400 mt-1.5 flex items-center gap-1">
                <Info className="h-3 w-3" /> Separate multiple email addresses with commas.
              </p>
            </div>
          </div>

          {/* Admin Event Triggers */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 px-5 sm:px-6 py-4 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Admin Email Triggers
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Turn ON/OFF notifications sent to your administrative team
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                {Object.values(settings).filter((v) => v === true).length} Active Triggers
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {adminCards.map((item) => {
                const Icon = item.icon;
                const isChecked = Boolean(settings[item.key]);

                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggle(item.key)}
                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/60 cursor-pointer transition select-none"
                  >
                    <div className="flex items-start gap-3.5 pr-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{item.title}</h4>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isChecked
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isChecked ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">{item.desc}</p>
                      </div>
                    </div>

                    {/* Switch Button */}
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

          {/* Test & Save Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Send test email to..."
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold focus:border-indigo-600 focus:outline-none w-52 sm:w-64"
              />
              <button
                type="button"
                onClick={() => handleSendTestEmail('system')}
                disabled={sendingTest}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition disabled:opacity-50 cursor-pointer"
              >
                {sendingTest ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Test Alert</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition disabled:opacity-60 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving Changes...' : 'Save Notification Preferences'}
            </button>
          </div>

          {testSuccessMsg && (
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> {testSuccessMsg}
            </p>
          )}
          {testErrorMsg && (
            <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {testErrorMsg}
            </p>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CUSTOMER AUTOMATED EMAILS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'customer' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                <Flame className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Customer Lifecycle Automated Emails
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  These emails are sent directly to shoppers at vital moments in their relationship with AMA-YAAR. Each email is beautifully styled in the dark streetwear aesthetic.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Email Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 px-5 sm:px-6 py-4 bg-slate-50/60">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Automated Customer Delivery Triggers
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enable or disable automated emails sent directly to customer inboxes
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {customerCards.map((item) => {
                const Icon = item.icon;
                const isChecked = Boolean(settings[item.key]);

                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggle(item.key)}
                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/60 cursor-pointer transition select-none"
                  >
                    <div className="flex items-start gap-3.5 pr-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{item.title}</h4>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isChecked
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isChecked ? 'Active' : 'Muted'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">{item.desc}</p>
                      </div>
                    </div>

                    {/* Switch Button */}
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

          {/* Test Preview Actions */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Test Customer Email Templates</h4>
              <p className="text-xs text-slate-500 mt-0.5">Send a live sample template to your own inbox to review formatting</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSendTestEmail('welcome')}
                disabled={sendingTest}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <Flame className="h-3.5 w-3.5 text-amber-600" />
                <span>Test Welcome Email</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendTestEmail('order')}
                disabled={sendingTest}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <PackageCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Test Order Invoice</span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition disabled:opacity-60 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving Changes...' : 'Save Customer Email Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EMAIL BROADCAST & CAMPAIGNS (WITH SAFE 50/BATCH LIMIT)             */}
      {/* ========================================================================= */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Audience Metrics & Guardrails Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Reachable</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{stats.totalAudience || 0}</div>
              <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">Verified email accounts</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Registered Customers</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{stats.totalCustomers || 0}</div>
              <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">Store shoppers</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Subscribers</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{stats.totalSubscribers || 0}</div>
              <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">Newsletter opt-ins</span>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">Safe Batch Cap</span>
              <div className="text-xl sm:text-2xl font-black text-amber-900 mt-1">50 / Batch</div>
              <span className="text-[11px] font-semibold text-amber-800 mt-0.5 block">Protects Gmail quota</span>
            </div>
          </div>

          {/* Rate Limit Protection Notice */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 sm:p-5 flex items-start gap-3.5">
            <Shield className="h-5 w-5 text-indigo-700 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-relaxed font-medium">
              <strong className="font-extrabold block text-indigo-950 mb-0.5">
                🛡️ Built-in Rate Limit &amp; Deliverability Protection Active
              </strong>
              Free Gmail SMTP accounts have a daily threshold of 500 emails. To safeguard your domain reputation, prevent spam blacklisting, and ensure 100% inbox landing, broadcast campaigns are throttled at 200ms and hard-capped at <strong>maximum 50 recipients per batch</strong>.
            </div>
          </div>

          {/* Broadcast Composer Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Compose Broadcast Campaign</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Send brand drops, promotional coupons, or important updates directly to your customer base.
              </p>
            </div>

            {/* Audience Selection */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-2">
                Select Target Audience
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { id: 'all', label: 'All Contacts', desc: 'Customers + Subscribers' },
                  { id: 'customers', label: 'Customers', desc: 'Registered accounts' },
                  { id: 'buyers', label: 'Past Buyers', desc: 'Customers with 1+ orders' },
                  { id: 'subscribers', label: 'Subscribers', desc: 'Newsletter list only' },
                  { id: 'custom', label: 'Custom List', desc: 'Enter specific emails' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBroadcastForm({ ...broadcastForm, recipientType: item.id })}
                    className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                      broadcastForm.recipientType === item.id
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Emails input if selected */}
            {broadcastForm.recipientType === 'custom' && (
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                  Custom Recipient Emails (Comma or Newline separated, max 50)
                </label>
                <textarea
                  rows={3}
                  placeholder="customer1@gmail.com, customer2@gmail.com"
                  value={broadcastForm.customEmails}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, customEmails: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm font-semibold focus:border-indigo-600 focus:outline-none"
                />
              </div>
            )}

            {/* Subject Line */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                  Email Subject Line <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🔥 Fresh Streetwear Drop: Acid Wash Hoodies Live Now!"
                  value={broadcastForm.subject}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-semibold focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                  Header Badge Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. COMMUNITY DROP or NEW COLLECTION"
                  value={broadcastForm.badge}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, badge: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-semibold focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Campaign Headline */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                Campaign Headline / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The Winter 2026 Oversized Drop Has Arrived"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-semibold focus:border-indigo-600 focus:outline-none"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                Message Content <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={6}
                required
                placeholder="Write your announcement or newsletter message here. Separate paragraphs with double enter."
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-4 text-xs sm:text-sm font-medium focus:border-indigo-600 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Call To Action Button (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                  Action Button Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shop New Arrivals"
                  value={broadcastForm.actionLabel}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, actionLabel: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                  Action Button URL
                </label>
                <input
                  type="url"
                  placeholder="https://amayaar.in/shop"
                  value={broadcastForm.actionUrl}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, actionUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (!broadcastForm.subject || !broadcastForm.title || !broadcastForm.message) {
                    setErrorMsg('Please enter a subject, title, and message body before testing.');
                    return;
                  }
                  handleSendTestEmail('system');
                }}
                disabled={sendingTest || broadcasting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Send Sample to My Email First</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!broadcastForm.subject || !broadcastForm.title || !broadcastForm.message) {
                    setErrorMsg('Please fill in Campaign Subject, Title, and Message before broadcasting.');
                    return;
                  }
                  setShowConfirmModal(true);
                }}
                disabled={broadcasting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-md hover:bg-neutral-800 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                {broadcasting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Broadcasting Batch...</span>
                  </>
                ) : (
                  <>
                    <SendHorizontal className="h-4 w-4" />
                    <span>Broadcast to Audience →</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Broadcast Results Card */}
          {broadcastResult && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm sm:text-base">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Campaign Dispatched Successfully!</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-emerald-900">
                <div>Total Targeted: {broadcastResult.totalTargeted}</div>
                <div>Successfully Delivered: {broadcastResult.sentCount}</div>
                <div>Failed: {broadcastResult.failedCount}</div>
                <div>Capped at 50: {broadcastResult.isCapped ? 'YES' : 'NO'}</div>
              </div>
              {broadcastResult.recipientsPreview && (
                <div className="text-[11px] text-emerald-700">
                  <strong>Preview recipients:</strong> {broadcastResult.recipientsPreview.join(', ')}...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal before Broadcast */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Confirm Broadcast Campaign</h3>
                <p className="text-xs text-slate-500">Please review before sending real emails</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1.5 text-xs">
              <div>
                <strong className="text-slate-800">Subject:</strong> {broadcastForm.subject}
              </div>
              <div>
                <strong className="text-slate-800">Audience:</strong> {broadcastForm.recipientType.toUpperCase()}
              </div>
              <div>
                <strong className="text-slate-800">Safety Cap:</strong> Maximum 50 recipients in this batch
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                className="rounded-xl bg-black px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 shadow-md cursor-pointer"
              >
                Confirm &amp; Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

