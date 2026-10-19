import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, Trash2, Clock, CheckCheck, Package, Tag, ShieldAlert } from 'lucide-react';
import { fetchNotifications, markNotificationRead } from '../notificationsSlice';
import api from '../../../lib/axios';

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { notifications = [], unreadCount = 0, loading } = useSelector(
    (state) => state.notifications || {}
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/all/read');
    } catch (_) {
      // Fallback mark each read
      notifications.forEach((n) => {
        if (!n.isRead) dispatch(markNotificationRead(n._id));
      });
    }
    dispatch(fetchNotifications());
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      dispatch(fetchNotifications());
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getIcon = (type) => {
    if (type?.toLowerCase().includes('order')) {
      return <Package className="h-4 w-4 text-black" />;
    }
    if (type?.toLowerCase().includes('coupon') || type?.toLowerCase().includes('discount')) {
      return <Tag className="h-4 w-4 text-black" />;
    }
    return <Bell className="h-4 w-4 text-black" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black shrink-0">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-black uppercase tracking-wide">Notifications & Alerts</h2>
              <p className="text-[12px] text-neutral-500 font-medium">
                Live updates about your orders, deliveries, and VIP offers
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-50 transition shadow-2xs"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && notifications.length === 0 && (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-16 text-center shadow-xs">
          <div className="flex justify-center mb-4">
            <div className="h-8 w-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
          </div>
          <p className="text-xs text-neutral-500 font-medium">Fetching notifications…</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && notifications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-16 text-center shadow-xs">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <Bell className="h-7 w-7 text-neutral-400" />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-800">No notifications yet</p>
          <p className="text-xs text-neutral-400 font-medium mt-1">
            Order updates, tracking links, and special drops will appear here.
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`flex items-start justify-between gap-4 rounded-2xl border p-4 transition shadow-xs ${
                notif.isRead
                  ? 'border-neutral-200/60 bg-white'
                  : 'border-neutral-300 bg-neutral-50/70 ring-1 ring-black/5'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                    notif.isRead ? 'bg-neutral-100 text-neutral-600' : 'bg-black text-white'
                  }`}
                >
                  {getIcon(notif.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-tight text-black truncate">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e11d48] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 font-medium mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] font-medium text-neutral-400 mt-1.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {notif.createdAt
                      ? new Date(notif.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Just now'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                {!notif.isRead && (
                  <button
                    onClick={() => dispatch(markNotificationRead(notif._id))}
                    title="Mark as read"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif._id)}
                  title="Delete"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
