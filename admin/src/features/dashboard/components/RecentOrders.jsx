import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShoppingBag, ChevronRight } from 'lucide-react';
import StatusBadge from '../../../components/StatusBadge';

function formatOrderDate(dateVal) {
  if (!dateVal) return 'Recent';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);

    // Format: "2 Jan, 03:45 PM"
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dateVal);
  }
}

export default function RecentOrders({ orders = [] }) {
  const displayOrders = orders || [];

  return (
    <div className="rounded-md bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Store Orders</h3>
        </div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
        >
          <span>View All Orders</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {displayOrders.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">No Orders Yet</p>
          <p className="text-xs text-slate-400 mt-1">Live customer orders will appear here in real-time as they are placed.</p>
        </div>
      ) : (
        <div className="mt-3 divide-y divide-slate-100">
          {displayOrders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-2 rounded-md transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
                  {order.user?.name?.charAt(0) || 'O'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-bold text-slate-900">{order.orderNumber || `#${order._id.slice(-6)}`}</p>
                    <span className="text-[11px] font-medium text-slate-400">• {formatOrderDate(order.createdAt)}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500">{order.user?.name || 'Customer'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <span className="text-xs font-bold text-slate-900">₹{order.total?.toLocaleString('en-IN')}</span>
                <StatusBadge status={order.status} />
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
