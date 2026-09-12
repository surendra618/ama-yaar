import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShoppingBag, ChevronRight } from 'lucide-react';
import StatusBadge from '../../../components/StatusBadge';

export default function RecentOrders({ orders = [] }) {
  const MOCK_ORDERS = [
    {
      _id: 'ord_101',
      orderNumber: '#AY-8924',
      user: { name: 'Vansh Singh', email: 'vansh@example.com' },
      total: 2499,
      status: 'DELIVERED',
      createdAt: '10 mins ago',
    },
    {
      _id: 'ord_102',
      orderNumber: '#AY-8923',
      user: { name: 'Arjun Yadav', email: 'arjun@example.com' },
      total: 1899,
      status: 'PROCESSING',
      createdAt: '45 mins ago',
    },
    {
      _id: 'ord_103',
      orderNumber: '#AY-8922',
      user: { name: 'Sunil Kashyap', email: 'sunil@example.com' },
      total: 3499,
      status: 'SHIPPED',
      createdAt: '2 hours ago',
    },
    {
      _id: 'ord_104',
      orderNumber: '#AY-8921',
      user: { name: 'Ved Singh', email: 'ved@example.com' },
      total: 1299,
      status: 'PENDING',
      createdAt: '5 hours ago',
    },
  ];

  const displayOrders = orders && orders.length > 0 ? orders : MOCK_ORDERS;

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
                  <span className="text-[10px] text-slate-400">• {order.createdAt || 'Recent'}</span>
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
    </div>
  );
}
