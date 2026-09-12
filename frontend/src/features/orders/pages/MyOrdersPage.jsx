import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, ArrowRight, CheckCircle2, Truck, XCircle, RotateCcw, Clock, ShoppingBag } from 'lucide-react';
import { fetchMyOrders } from '../ordersSlice';

const STATUS_CONFIG = {
  delivered:       { label: 'Delivered',   bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500',  Icon: CheckCircle2 },
  shipped:         { label: 'In Transit',  bg: 'bg-blue-100',    text: 'text-blue-800',    dot: 'bg-blue-500',     Icon: Truck },
  out_for_delivery:{ label: 'Out for Delivery', bg: 'bg-blue-100', text: 'text-blue-800',  dot: 'bg-blue-500',     Icon: Truck },
  cancelled:       { label: 'Cancelled',   bg: 'bg-rose-100',    text: 'text-rose-800',    dot: 'bg-rose-500',     Icon: XCircle },
  returned:        { label: 'Returned',    bg: 'bg-amber-100',   text: 'text-amber-800',   dot: 'bg-amber-500',    Icon: RotateCcw },
  refunded:        { label: 'Refunded',    bg: 'bg-amber-100',   text: 'text-amber-800',   dot: 'bg-amber-500',    Icon: RotateCcw },
  processing:      { label: 'Processing',  bg: 'bg-neutral-100', text: 'text-neutral-700', dot: 'bg-neutral-400',  Icon: Clock },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.processing;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function MyOrdersPage() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-xl border border-neutral-200/60 bg-white shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black shrink-0">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-black uppercase tracking-wide">My Orders</h2>
            <p className="text-[12px] text-neutral-500 font-medium">Track, view details, or return your past purchases</p>
          </div>
          {orders.length > 0 && (
            <span className="ml-auto flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-black px-2 text-xs font-black text-white">
              {orders.length}
            </span>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && orders.length === 0 && (
        <div className="rounded-xl border border-neutral-200/60 bg-white shadow-sm p-16 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-8 w-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-neutral-400 font-medium">Loading your orders…</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-16 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <ShoppingBag className="h-7 w-7 text-neutral-400" />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-700">No orders yet</p>
          <p className="text-xs text-neutral-400 font-medium mt-1">You haven't placed any orders yet</p>
          <Link
            to="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-neutral-800 transition"
          >
            <ShoppingBag className="h-4 w-4" />
            Start Shopping
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Orders List */}
      {orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-xl border border-neutral-200/60 bg-white shadow-sm overflow-hidden hover:border-neutral-300 transition-all duration-150"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-neutral-50/60 px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-5">
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Order No.</span>
                    <strong className="text-xs font-black text-black">#{order.orderNumber || order._id?.slice(-6).toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Date</span>
                    <strong className="text-xs font-bold text-neutral-700">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Total</span>
                    <strong className="text-xs font-black text-black">₹{order.total?.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <StatusBadge status={order.status} />
                  <Link
                    to={`/orders/${order._id}`}
                    className="flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white hover:bg-neutral-800 transition"
                  >
                    View Details <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-neutral-100 px-5">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-black truncate">{item.name}</p>
                      <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                        Qty: {item.quantity} &nbsp;·&nbsp; ₹{item.price?.toLocaleString('en-IN')} each
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-black">
                        ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
