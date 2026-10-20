import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  User,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  FileText,
  Image as ImageIcon,
  Check,
  Copy,
  Calendar,
  Box,
  ExternalLink,
  Printer,
  Download,
  AlertCircle,
  RefreshCw,
  Navigation,
  X,
  Zap,
} from 'lucide-react';
import api from '../../../lib/axios';
import { fetchOrderById, updateOrderStatus, clearCurrentOrder } from '../ordersSlice';
import StatusBadge from '../../../components/StatusBadge';
import { Select, Textarea } from '../../../components/FormField';
import Loader from '../../../components/Loader';

const STATUS_OPTIONS = [
  'placed',
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
  'refunded',
];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { current: order, updating } = useSelector((state) => state.orders);
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  // Shiprocket states
  const [srLoading, setSrLoading] = useState(null); // 'create' | 'awb' | 'pickup' | 'label' | 'invoice' | 'manifest' | 'cancel'
  const [srError, setSrError] = useState(null);
  const [srSuccess, setSrSuccess] = useState(null);
  const [trackingModal, setTrackingModal] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [awbCopied, setAwbCopied] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => dispatch(clearCurrentOrder());
  }, [dispatch, id]);

  useEffect(() => {
    if (order) setNextStatus(order.status);
  }, [order]);

  if (!order) return <Loader label="Loading order details…" />;

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    await dispatch(updateOrderStatus({ id, status: nextStatus, note }));
    setNote('');
  };

  const copyAddress = () => {
    const addr = `${order.shippingAddress?.fullName || ''}, ${order.shippingAddress?.line1 || ''}, ${
      order.shippingAddress?.line2 ? order.shippingAddress.line2 + ', ' : ''
    }${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${
      order.shippingAddress?.pincode || ''
    }`;
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAwb = () => {
    if (order.shiprocket?.awbCode || order.trackingNumber) {
      navigator.clipboard.writeText(order.shiprocket?.awbCode || order.trackingNumber);
      setAwbCopied(true);
      setTimeout(() => setAwbCopied(false), 2000);
    }
  };

  const handleCreateShiprocketOrder = async () => {
    setSrLoading('create');
    setSrError(null);
    setSrSuccess(null);
    try {
      const res = await api.post(`/shiprocket/orders/${id}/create`, { autoAssignAwb: true });
      setSrSuccess(res.data?.message || 'Order pushed to Shiprocket successfully');
      dispatch(fetchOrderById(id));
      setTimeout(() => setSrSuccess(null), 4000);
    } catch (err) {
      setSrError(err.response?.data?.message || 'Failed to push order to Shiprocket');
    } finally {
      setSrLoading(null);
    }
  };

  const handleAssignAwb = async () => {
    setSrLoading('awb');
    setSrError(null);
    setSrSuccess(null);
    try {
      const res = await api.post(`/shiprocket/orders/${id}/assign-awb`);
      setSrSuccess(res.data?.message || 'AWB generated successfully');
      dispatch(fetchOrderById(id));
      setTimeout(() => setSrSuccess(null), 4000);
    } catch (err) {
      setSrError(err.response?.data?.message || 'Failed to generate AWB');
    } finally {
      setSrLoading(null);
    }
  };

  const handleRequestPickup = async () => {
    setSrLoading('pickup');
    setSrError(null);
    setSrSuccess(null);
    try {
      const res = await api.post(`/shiprocket/orders/${id}/pickup`);
      setSrSuccess(res.data?.message || 'Courier pickup scheduled successfully');
      dispatch(fetchOrderById(id));
      setTimeout(() => setSrSuccess(null), 4000);
    } catch (err) {
      setSrError(err.response?.data?.message || 'Failed to schedule pickup');
    } finally {
      setSrLoading(null);
    }
  };

  const handleDownloadLabel = async () => {
    setSrLoading('label');
    setSrError(null);
    try {
      const res = await api.get(`/shiprocket/orders/${id}/label`);
      const url = res.data?.data?.labelUrl || res.data?.labelUrl || order.shiprocket?.labelUrl;
      if (url) {
        window.open(url, '_blank');
      } else {
        setSrError('No label URL returned by Shiprocket');
      }
    } catch (err) {
      setSrError(err.response?.data?.message || 'Failed to retrieve shipping label');
    } finally {
      setSrLoading(null);
    }
  };

  const handleDownloadInvoice = async () => {
    setSrLoading('invoice');
    setSrError(null);
    try {
      const res = await api.get(`/shiprocket/orders/${id}/invoice`);
      const url = res.data?.data?.invoiceUrl || res.data?.invoiceUrl || order.shiprocket?.invoiceUrl;
      if (url) {
        window.open(url, '_blank');
      } else {
        setSrError('No invoice URL returned by Shiprocket');
      }
    } catch (err) {
      setSrError(err.response?.data?.message || 'Failed to retrieve tax invoice');
    } finally {
      setSrLoading(null);
    }
  };

  const handleDownloadManifest = async () => {
    setSrLoading('manifest');
    setSrError(null);
    try {
      const res = await api.get(`/shiprocket/orders/${id}/manifest`);
      const url = res.data?.data?.manifestUrl || res.data?.manifestUrl || order.shiprocket?.manifestUrl;
      if (url) {
        window.open(url, '_blank');
      } else {
        setSrError('No manifest URL returned by Shiprocket');
      }
    } catch (err) {
      setSrError(err.response?.data?.message || 'Failed to retrieve manifest');
    } finally {
      setSrLoading(null);
    }
  };

  const handleOpenTracking = async () => {
    setTrackingModal(true);
    setLoadingTracking(true);
    try {
      const res = await api.get(`/shiprocket/orders/${id}/track`);
      setTrackingData(res.data?.data?.tracking || res.data?.tracking);
    } catch (err) {
      console.warn('Tracking fetch error:', err);
    } finally {
      setLoadingTracking(false);
    }
  };

  const handleCancelShiprocket = async () => {
    if (!window.confirm('Are you sure you want to cancel this order on Shiprocket?')) return;
    setSrLoading('cancel');
    setSrError(null);
    try {
      const res = await api.post(`/shiprocket/orders/${id}/cancel`);
      setSrSuccess(res.data?.message || 'Shiprocket order cancelled');
      dispatch(fetchOrderById(id));
      setTimeout(() => setSrSuccess(null), 4000);
    } catch (err) {
      setSrError(err.response?.data?.message || 'Failed to cancel Shiprocket order');
    } finally {
      setSrLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors w-fit group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm group-hover:bg-slate-100 group-hover:border-slate-300 transition-all">
            <ArrowLeft className="h-4 w-4 text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span>Back to Orders</span>
        </button>

        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Main Order Header Banner */}
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {order.orderNumber || `#${order._id.slice(-6)}`}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              <Calendar className="h-3 w-3 text-slate-400" />
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            Placed at {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        {order.paymentInfo && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-md p-3 px-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-400 text-slate-900 font-bold shadow-sm">
              <CreditCard className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payment Summary</p>
              <p className="text-sm font-extrabold text-slate-900">
                ₹{order.total?.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-bold uppercase text-emerald-600 ml-1">
                  ({order.paymentInfo?.status || 'Paid'})
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3 Information Cards: Customer, Shipping, Payment */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Customer Card */}
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white font-bold">
                <User className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Customer</h3>
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <p className="text-sm font-bold text-slate-900">
              {order.user?.name || order.shippingAddress?.fullName || 'Guest Customer'}
            </p>
            <p className="font-medium text-slate-600 truncate">{order.user?.email || order.shippingAddress?.email || 'No email'}</p>
            <p className="font-medium text-slate-500">{order.user?.phone || order.shippingAddress?.phone || 'No phone'}</p>
          </div>
        </div>

        {/* Shipping Address Card */}
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white font-bold">
                <MapPin className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Shipping Address</h3>
            </div>
            <button
              onClick={copyAddress}
              className="text-slate-400 hover:text-slate-700 transition"
              title="Copy Address"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
            <p className="leading-relaxed text-slate-600 font-medium">
              {order.shippingAddress?.line1}
              {order.shippingAddress?.line2 && `, ${order.shippingAddress.line2}`}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - <span className="font-semibold text-slate-800">{order.shippingAddress?.pincode}</span>
            </p>
            {order.shippingAddress?.phone && (
              <p className="pt-1 text-slate-500">Phone: <span className="font-semibold text-slate-700">{order.shippingAddress.phone}</span></p>
            )}
          </div>
        </div>

        {/* Payment Details Card */}
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white font-bold">
                <CreditCard className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Payment Details</h3>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Method</span>
              <span className="font-bold text-slate-900 uppercase bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                {order.paymentInfo?.method || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Status</span>
              <span
                className={`font-bold capitalize px-2 py-0.5 rounded-md border ${
                  order.paymentInfo?.status === 'paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {order.paymentInfo?.status || 'Pending'}
              </span>
            </div>
            {order.paymentInfo?.transactionId && (
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 font-medium">Txn ID</span>
                <span className="font-mono text-[11px] text-slate-700 truncate max-w-[120px]">
                  {order.paymentInfo.transactionId}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shiprocket Logistics Fulfillment Section */}
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {/* Alerts */}
        {srSuccess && (
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{srSuccess}</span>
          </div>
        )}
        {srError && (
          <div className="flex items-center gap-2 rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{srError}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-white font-bold shadow-xs">
              <Box className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                Shiprocket Logistics & Fulfillment
              </h3>
              <p className="text-xs text-slate-500">Automated courier assignment, AWB generation & live tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order.shiprocket?.orderId ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                {order.shiprocket.status || 'Active Shipment'}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                Not Shipped via Shiprocket
              </span>
            )}
          </div>
        </div>

        {/* Content based on whether order is already pushed to Shiprocket */}
        {!order.shiprocket?.orderId ? (
          <div className="rounded-md bg-slate-50 border border-slate-200/80 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-indigo-600" /> Ready for Automated Courier Booking
              </p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Push this order directly to Shiprocket to auto-calculate cheapest & fastest courier options (Delhivery, Blue Dart, DTDC), generate AWB label, and schedule warehouse pickup.
              </p>
              {order.shiprocket?.errorMessage && (
                <p className="text-[11px] text-rose-600 font-medium pt-1">
                  Last attempt note: {order.shiprocket.errorMessage}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleCreateShiprocketOrder}
              disabled={srLoading === 'create'}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-xs font-extrabold text-amber-400 hover:bg-slate-800 transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {srLoading === 'create' ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Pushing to Shiprocket...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 text-amber-400" /> Ship with Shiprocket
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Shipment Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-md border border-slate-200">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shiprocket Order ID</p>
                <p className="text-xs font-black text-slate-900 mt-0.5">#{order.shiprocket.orderId}</p>
                {order.shiprocket.shipmentId && (
                  <p className="text-[10px] text-slate-500">Shipment #{order.shiprocket.shipmentId}</p>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Courier Partner</p>
                <p className="text-xs font-black text-slate-900 mt-0.5">
                  {order.shiprocket.courierName || 'Pending Assignment'}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AWB Tracking Code</p>
                {order.shiprocket.awbCode ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-sm border border-indigo-200">
                      {order.shiprocket.awbCode}
                    </span>
                    <button
                      type="button"
                      onClick={copyAwb}
                      className="text-slate-400 hover:text-slate-700 transition"
                      title="Copy AWB Code"
                    >
                      {awbCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 font-semibold mt-0.5">Not Assigned</p>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pickup Status</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {order.shiprocket.pickupScheduledDate
                    ? `Scheduled: ${new Date(order.shiprocket.pickupScheduledDate).toLocaleDateString()}`
                    : 'Not Scheduled'}
                </p>
                {order.shiprocket.pickupTokenNumber && (
                  <p className="text-[10px] text-slate-500">Token: {order.shiprocket.pickupTokenNumber}</p>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {!order.shiprocket.awbCode && (
                <button
                  type="button"
                  onClick={handleAssignAwb}
                  disabled={srLoading === 'awb'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {srLoading === 'awb' ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                  <span>Generate AWB</span>
                </button>
              )}

              {order.shiprocket.awbCode && !order.shiprocket.pickupScheduledDate && (
                <button
                  type="button"
                  onClick={handleRequestPickup}
                  disabled={srLoading === 'pickup'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 text-amber-400 text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {srLoading === 'pickup' ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Calendar className="h-3.5 w-3.5" />
                  )}
                  <span>Schedule Pickup</span>
                </button>
              )}

              {order.shiprocket.awbCode && (
                <button
                  type="button"
                  onClick={handleDownloadLabel}
                  disabled={srLoading === 'label'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-600" />
                  <span>{srLoading === 'label' ? 'Opening...' : 'Shipping Label'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={srLoading === 'invoice'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer shadow-xs"
              >
                <FileText className="h-3.5 w-3.5 text-slate-600" />
                <span>{srLoading === 'invoice' ? 'Opening...' : 'Invoice'}</span>
              </button>

              {order.shiprocket.shipmentId && (
                <button
                  type="button"
                  onClick={handleDownloadManifest}
                  disabled={srLoading === 'manifest'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-slate-600" />
                  <span>Manifest</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenTracking}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition cursor-pointer"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Live Track</span>
              </button>

              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={handleCancelShiprocket}
                  disabled={srLoading === 'cancel'}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 transition ml-auto"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel Shipment</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ordered Items & Summary Section */}
      <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4.5 w-4.5 text-slate-700" />
            <h3 className="text-sm font-extrabold text-slate-900">Ordered Items ({order.items?.length || 0})</h3>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100 border border-slate-200">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-slate-900">{item.name}</p>
                <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-slate-500 font-medium">
                  {item.variant?.size && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 border border-slate-200">
                      Size: {item.variant.size}
                    </span>
                  )}
                  {item.variant?.color && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 border border-slate-200">
                      Color: {item.variant.color}
                    </span>
                  )}
                  <span className="rounded-md bg-amber-100 text-amber-900 font-bold px-2 py-0.5 border border-amber-200">
                    Qty: {item.quantity}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-base font-black text-slate-900">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  ₹{item.price?.toLocaleString('en-IN')} each
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Breakdown Summary */}
        <div className="bg-slate-50/80 p-5 border-t border-slate-200 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">₹{order.subtotal?.toLocaleString('en-IN')}</span>
          </div>

          {order.productDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Product Discount</span>
              <span>-₹{order.productDiscount?.toLocaleString('en-IN')}</span>
            </div>
          )}

          {order.couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Coupon Discount {order.couponCode && `(${order.couponCode})`}</span>
              <span>-₹{order.couponDiscount?.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600 font-medium">
            <span>Delivery Charge</span>
            {order.deliveryCharge > 0 ? (
              <span className="font-semibold text-slate-800">₹{order.deliveryCharge}</span>
            ) : (
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-200">
                FREE
              </span>
            )}
          </div>

          <div className="flex justify-between text-slate-600 font-medium">
            <span>Tax (GST)</span>
            <span className="font-semibold text-slate-800">₹{order.tax?.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-black text-slate-900">
            <span>Total Payable</span>
            <span className="text-xl font-black text-slate-900 bg-amber-400/30 px-3 py-0.5 rounded-md border border-amber-300">
              ₹{order.total?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Status Update & History Timeline Card */}
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Truck className="h-5 w-5 text-amber-500" /> Update Order Status
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Change fulfillment stage or record operational notes</p>
        </div>

        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="sm:w-72">
              <Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} className="font-semibold rounded-md">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </Select>
            </div>
            <button
              type="submit"
              disabled={updating || nextStatus === order.status}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-5 py-2 text-sm font-bold text-amber-400 shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
            >
              {updating ? (
                'Updating status…'
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-amber-400" /> Update Order
                </>
              )}
            </button>
          </div>

          <Textarea
            rows={2}
            placeholder="Add an optional note or tracking ID for the customer…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="text-xs rounded-md"
          />
        </form>

        {/* Order History Timeline */}
        {order.statusHistory?.length > 0 && (
          <div className="border-t border-slate-200 pt-5">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Order Status History
            </h4>
            <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {order.statusHistory
                .slice()
                .reverse()
                .map((h, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 text-xs">
                    <div className="absolute -left-6 top-1 h-4 w-4 rounded-md border-2 border-amber-400 bg-slate-900 shadow-sm flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-sm bg-amber-400" />
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-3 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-slate-900 capitalize">
                          {h.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(h.at).toLocaleString()}
                        </span>
                      </div>
                      {h.note && <p className="mt-1 text-slate-600 font-medium text-xs">{h.note}</p>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Shiprocket Live Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 px-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white font-bold">
                  <Navigation className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Shipment Live Tracking</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    AWB: {trackingData?.awbCode || order.shiprocket?.awbCode || order.trackingNumber || 'Pending'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTrackingModal(false)}
                className="h-8 w-8 rounded-md border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {loadingTracking ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                  <span className="text-xs font-semibold">Connecting to Shiprocket Tracking Network...</span>
                </div>
              ) : (
                <>
                  {/* Courier & Status Summary */}
                  <div className="p-4 rounded-lg bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Courier Partner</p>
                      <p className="text-sm font-extrabold text-slate-900">
                        {trackingData?.courierName || order.shiprocket?.courierName || 'Courier Partner'}
                      </p>
                      {trackingData?.origin && trackingData?.destination && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          {trackingData.origin} &rarr; {trackingData.destination}
                        </p>
                      )}
                    </div>

                    <div className="sm:text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black bg-indigo-600 text-white uppercase tracking-wide">
                        {trackingData?.currentStatus || order.shiprocket?.status || 'In Transit'}
                      </span>
                      {trackingData?.edd && (
                        <p className="text-[11px] font-medium text-slate-500 mt-1">
                          Estimated: {new Date(trackingData.edd).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Activity Checkpoints */}
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Checkpoint Timeline
                    </h4>

                    {trackingData?.activities && trackingData.activities.length > 0 ? (
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200">
                        {trackingData.activities.map((act, i) => (
                          <div key={i} className="relative flex items-start gap-3 text-xs">
                            <div className="absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-indigo-600 bg-white shadow-xs flex items-center justify-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                            </div>
                            <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-900">{act.status || act.activity}</span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {act.date ? new Date(act.date).toLocaleString() : ''}
                                </span>
                              </div>
                              {act.location && (
                                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-slate-400" /> {act.location}
                                </p>
                              )}
                              {act.activity && act.activity !== act.status && (
                                <p className="text-[11px] text-slate-600 mt-1">{act.activity}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                        No transit activity checkpoints recorded yet. Package is awaiting courier pickup scan.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {trackingData?.trackUrl ? (
                <a
                  href={trackingData.trackUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <span>Open Public Shiprocket Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setTrackingModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
