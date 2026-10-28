import { useState, useEffect } from 'react';
import api from '../lib/api';
import {
  Package,
  Search,
  Filter,
  Truck,
  Printer,
  Calendar,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  FileText,
  X,
  MapPin,
  Clock,
  Eye,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AssignCourierModal from '../components/AssignCourierModal';
import SimulateModal from '../components/SimulateModal';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [simulateShipment, setSimulateShipment] = useState(null);
  const [drawerShipment, setDrawerShipment] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // id
  const [selectedIds, setSelectedIds] = useState([]);
  const [manifesting, setManifesting] = useState(false);

  const token = localStorage.getItem('lxw_token');

  useEffect(() => {
    fetchShipments();
    setSelectedIds([]);
  }, [statusFilter, search]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shipments', {
        params: {
          status: statusFilter,
          search: search || undefined,
        },
      });
      if (res.data?.success) {
        setShipments(res.data.shipments || []);
      }
    } catch (err) {
      console.warn('Shipment fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePickup = async (shipmentId) => {
    setActionLoading(shipmentId);
    try {
      const res = await api.post(`/shipments/${shipmentId}/pickup`, {});
      if (res.data?.success) {
        alert(res.data.message);
        fetchShipments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule pickup');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrintLabel = (shipmentId) => {
    const url = `http://localhost:5050/api/v1/shipments/${shipmentId}/label?token=${token}`;
    window.open(url, '_blank');
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === shipments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(shipments.map((s) => s._id));
    }
  };

  const handleCreateManifest = async () => {
    if (selectedIds.length === 0) return;
    setManifesting(true);
    try {
      const res = await api.post('/shipments/manifest', {
        shipmentIds: selectedIds,
      });
      if (res.data?.success) {
        const manifestId = res.data.manifest._id;
        const printUrl = `http://localhost:5050/api/v1/shipments/manifest/${manifestId}/print?token=${token}`;
        window.open(printUrl, '_blank');
        fetchShipments();
        setSelectedIds([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate manifest');
    } finally {
      setManifesting(false);
    }
  };

  const filters = [
    { key: 'ALL', label: 'All Shipments' },
    { key: 'READY_TO_SHIP', label: 'Ready to Ship' },
    { key: 'AWB_ASSIGNED', label: 'AWB Assigned' },
    { key: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
    { key: 'IN_TRANSIT', label: 'In Transit' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'NDR_FAILED', label: 'NDR Exceptions' },
    { key: 'RTO_INITIATED', label: 'RTO' },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Shipments &amp; Consignments</h2>
          <p className="text-xs text-slate-500">Manage orders, auto-assign couriers, print 4x6 thermal labels &amp; track</p>
        </div>
        <Link
          to="/create-order"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create New Shipment
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                statusFilter === f.key
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shipments by order number, AWB tracking code, buyer name, or mobile number..."
            className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Floating Batch Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-20 flex items-center justify-between p-3.5 bg-slate-900 text-white rounded-xl shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="bg-indigo-600 px-2.5 py-0.5 rounded-full font-mono">{selectedIds.length}</span>
            <span>Shipments Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={manifesting}
              onClick={handleCreateManifest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{manifesting ? 'Generating...' : 'Generate Handover Manifest'}</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Shipments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
            <p>Loading shipments from logistics network...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-3">
            <Package className="h-10 w-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No shipments found matching filter criteria</p>
            <Link
              to="/create-order"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Book First Shipment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === shipments.length && shipments.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3">Order # / Date</th>
                  <th className="px-4 py-3">Buyer Address</th>
                  <th className="px-4 py-3">Package / Items</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Carrier / AWB</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(s._id)}
                        onChange={() => toggleSelect(s._id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => setDrawerShipment(s)}
                        className="font-extrabold text-slate-900 hover:text-indigo-600 text-left transition"
                      >
                        #{s.orderNumber}
                      </button>
                      <p className="text-[11px] text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</p>
                    </td>

                    <td className="px-4 py-4 max-w-xs">
                      <p className="font-bold text-slate-900">{s.buyer.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{s.buyer.addressLine1}</p>
                      <p className="text-[11px] text-slate-600 font-semibold">
                        {s.buyer.city}, {s.buyer.state} - <strong>{s.buyer.pincode}</strong>
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-800">{s.items?.[0]?.name || 'Apparel Item'}</p>
                      <p className="text-[11px] text-slate-500">
                        Qty: {s.items?.[0]?.units || 1} &bull; Weight: {s.packageDetails?.billableWeight || 0.5} KG
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          s.payment.mode === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {s.payment.mode === 'COD' ? `COD ₹${s.payment.collectableAmount}` : 'Prepaid'}
                      </span>
                      {s.payment.totalShippingCost > 0 && (
                        <p className="text-[10px] text-slate-400 mt-0.5">Freight: ₹{s.payment.totalShippingCost}</p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {s.courier?.awbNumber ? (
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-xs">
                            {s.courier.awbNumber}
                          </span>
                          <p className="text-[11px] font-semibold text-slate-700">{s.courier.carrier}</p>
                          {s.courier.pickupToken && (
                            <p className="text-[10px] text-slate-400">Token: {s.courier.pickupToken}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Ready for Courier
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          s.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.status === 'NDR_FAILED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : s.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : s.status === 'IN_TRANSIT'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : s.status === 'PICKUP_SCHEDULED'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : s.status === 'AWB_ASSIGNED'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDrawerShipment(s)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="View Details & Live Timeline"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {s.status === 'READY_TO_SHIP' && (
                          <button
                            onClick={() => setSelectedShipment(s)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                          >
                            Assign Courier
                          </button>
                        )}

                        {s.status === 'AWB_ASSIGNED' && (
                          <button
                            disabled={actionLoading === s._id}
                            onClick={() => handleSchedulePickup(s._id)}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                          >
                            Schedule Pickup
                          </button>
                        )}

                        {s.courier?.awbNumber && (
                          <button
                            onClick={() => handlePrintLabel(s._id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Print 4x6 Thermal Shipping Label"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setSimulateShipment(s)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                          title="Simulate Next Status in Sandbox"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shipment Details Slide-over Drawer */}
      {drawerShipment && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right">
            {/* Drawer Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-sm">Shipment #{drawerShipment.orderNumber}</h3>
                <p className="text-[11px] text-slate-400">
                  AWB: {drawerShipment.courier?.awbNumber || 'Not assigned'} &bull; Carrier: {drawerShipment.courier?.carrier || 'Pending'}
                </p>
              </div>
              <button
                onClick={() => setDrawerShipment(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Status Banner */}
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-indigo-500">Current Lifecycle Status</p>
                  <p className="font-black text-indigo-950 text-sm mt-0.5">{drawerShipment.status}</p>
                </div>
                {drawerShipment.courier?.awbNumber && (
                  <button
                    onClick={() => handlePrintLabel(drawerShipment._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print Label
                  </button>
                )}
              </div>

              {/* Delivery Address */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-500 uppercase text-[10px]">Recipient Consignee</p>
                <p className="font-black text-slate-900 text-sm">{drawerShipment.buyer.name}</p>
                <p className="text-slate-600">{drawerShipment.buyer.addressLine1} {drawerShipment.buyer.addressLine2 ? ', ' + drawerShipment.buyer.addressLine2 : ''}</p>
                <p className="text-slate-700 font-semibold">{drawerShipment.buyer.city}, {drawerShipment.buyer.state} - {drawerShipment.buyer.pincode}</p>
                <p className="text-slate-600">Phone: {drawerShipment.buyer.phone}</p>
              </div>

              {/* Package Specs */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Package Weight</p>
                  <p className="font-extrabold text-slate-800">{drawerShipment.packageDetails?.billableWeight || 0.5} KG</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Dimensions (LxBxH)</p>
                  <p className="font-extrabold text-slate-800">
                    {drawerShipment.packageDetails?.length || 20}x{drawerShipment.packageDetails?.breadth || 15}x{drawerShipment.packageDetails?.height || 5} CM
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Payment Mode</p>
                  <p className="font-extrabold text-slate-800">{drawerShipment.payment.mode}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Collectable Amount</p>
                  <p className="font-extrabold text-slate-800">₹{drawerShipment.payment.collectableAmount || 0}</p>
                </div>
              </div>

              {/* Live Timeline */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider">
                  Live Consignment Journey Timeline
                </h4>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                  {drawerShipment.trackingTimeline?.slice().reverse().map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-600 shadow-xs"></div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900">{step.activity}</p>
                        <p className="text-[10px] text-slate-400">
                          {step.location ? `${step.location} • ` : ''}
                          {new Date(step.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedShipment && (
        <AssignCourierModal
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
          onSuccess={() => fetchShipments()}
        />
      )}

      {simulateShipment && (
        <SimulateModal
          shipment={simulateShipment}
          onClose={() => setSimulateShipment(null)}
          onSuccess={() => fetchShipments()}
        />
      )}
    </div>
  );
}
