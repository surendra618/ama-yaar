import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Package,
  Users,
  Sparkles,
  CheckCheck,
  Trash2,
  RotateCcw,
  Search,
  ExternalLink,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../../../lib/axios';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function ActivityNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread' | 'orders' | 'users'
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications', { params: { limit: 100 } });
      const list = res.data?.data?.notifications || [];
      setNotifications(list);
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await api.patch('/notifications/all/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark notifications as read');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (_) {}
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      if (toDelete === 'all') {
        await api.delete('/notifications/all');
        setNotifications([]);
      } else {
        await api.delete(`/notifications/${toDelete._id}`);
        setNotifications((prev) => prev.filter((n) => n._id !== toDelete._id));
      }
      setToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete notification');
    } finally {
      setDeleting(false);
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Filter & search logic
  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'unread' && n.isRead) return false;
    if (filterType === 'orders') {
      const isOrder =
        n.type === 'newOrder' ||
        n.type === 'order' ||
        n.type === 'orderCancelled' ||
        n.title?.toLowerCase().includes('order');
      if (!isOrder) return false;
    }
    if (filterType === 'users') {
      const isUser =
        n.type === 'newUser' ||
        n.type === 'user' ||
        n.title?.toLowerCase().includes('user') ||
        n.title?.toLowerCase().includes('customer');
      if (!isUser) return false;
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const matchTitle = (n.title || '').toLowerCase().includes(query);
      const matchMsg = (n.message || '').toLowerCase().includes(query);
      if (!matchTitle && !matchMsg) return false;
    }

    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getItemVisuals = (n) => {
    const titleLower = (n.title || '').toLowerCase();
    const typeLower = (n.type || '').toLowerCase();

    if (typeLower.includes('order') || titleLower.includes('order')) {
      if (titleLower.includes('cancelled') || titleLower.includes('failed')) {
        return {
          icon: Package,
          bg: 'bg-rose-100 text-rose-700 border-rose-200',
          badge: 'bg-rose-50 text-rose-700',
          link: '/orders',
          label: 'Orders',
        };
      }
      return {
        icon: Package,
        bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        badge: 'bg-emerald-50 text-emerald-700',
        link: '/orders',
        label: 'New Order',
      };
    }

    if (typeLower.includes('user') || titleLower.includes('user') || titleLower.includes('login')) {
      return {
        icon: Users,
        bg: 'bg-purple-100 text-purple-700 border-purple-200',
        badge: 'bg-purple-50 text-purple-700',
        link: '/customers',
        label: 'Customer',
      };
    }

    return {
      icon: Sparkles,
      bg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      badge: 'bg-indigo-50 text-indigo-700',
      link: '/orders',
      label: 'Alert',
    };
  };

  return (
    <div className="space-y-6 pb-14">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Bell className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Activity & Notifications Log
            </h1>
            <span className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {notifications.length} Total
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Complete real-time timeline of store orders, customer sign-ups, and admin alerts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchNotifications}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => setToDelete('all')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'orders', label: 'Orders & Sales' },
            { id: 'users', label: 'New Customers' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterType === tab.id
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity by order, user..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:border-black focus:ring-1 focus:ring-black outline-none"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="h-6 w-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading all store activities...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No activity found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search.trim() || filterType !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Real-time notifications and store alerts will show up here as customers place orders and register.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((n) => {
              const visuals = getItemVisuals(n);
              const IconComponent = visuals.icon;

              return (
                <div
                  key={n._id}
                  onClick={() => handleMarkOneRead(n._id)}
                  className={`p-4 flex items-start justify-between gap-4 transition hover:bg-slate-50/80 cursor-pointer ${
                    !n.isRead ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Visual Icon Badge */}
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${visuals.bg}`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
                        )}
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${visuals.badge}`}
                        >
                          {visuals.label}
                        </span>
                      </div>

                      {n.message && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {n.message}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(n.createdAt)}</span>
                        <span>•</span>
                        <span>
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div
                    className="flex items-center gap-2 shrink-0 self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => navigate(visuals.link)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition shadow-xs cursor-pointer"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setToDelete(n)}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete activity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(toDelete)}
        title={toDelete === 'all' ? 'Clear All Activities?' : 'Delete Activity?'}
        message={
          toDelete === 'all'
            ? 'Are you sure you want to permanently delete all activity notifications? This cannot be undone.'
            : `Are you sure you want to delete "${toDelete?.title}"?`
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
