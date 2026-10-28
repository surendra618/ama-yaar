import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
  PlusCircle,
  Truck,
  Package,
  MapPin,
  IndianRupee,
  RefreshCw,
  ArrowLeft,
  FileSpreadsheet,
  Download,
  UploadCloud,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreateShipmentPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [bulkStatus, setBulkStatus] = useState(null);

  // Single Form State
  const [formData, setFormData] = useState({
    orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
    pickupLocationId: '',
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    itemName: 'Heavyweight Cotton Oversized T-Shirt',
    itemSku: 'TSHIRT-BLK-L',
    itemUnits: 1,
    itemPrice: 999,
    length: 25,
    breadth: 20,
    height: 5,
    deadWeight: 0.5,
    paymentMode: 'PREPAID',
    collectableAmount: 0,
  });

  // Bulk CSV Text
  const [csvText, setCsvText] = useState(
`OrderNumber,BuyerName,Phone,Address,City,State,Pincode,PaymentMode,Amount,WeightKg
ORD-BATCH-101,Rohan Gupta,9811223344,Flat 402 Sector 18,Noida,Uttar Pradesh,201301,COD,1299,0.5
ORD-BATCH-102,Deepika Rao,9820011223,7th Main Indiranagar,Bengaluru,Karnataka,560038,PREPAID,2499,0.7
ORD-BATCH-103,Amit Mehra,9830112233,Block C Salt Lake,Kolkata,West Bengal,700064,COD,899,0.4`
  );

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pickup-locations');
      if (res.data?.success) {
        const list = res.data.locations || [];
        setWarehouses(list);
        const primary = list.find((w) => w.isPrimary) || list[0];
        if (primary) {
          setFormData((prev) => ({ ...prev, pickupLocationId: primary._id }));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  const volumetric = ((Number(formData.length) * Number(formData.breadth) * Number(formData.height)) / 5000).toFixed(2);
  const billable = Math.max(Number(formData.deadWeight || 0.5), Number(volumetric)).toFixed(2);

  const handleSubmitSingle = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        orderNumber: formData.orderNumber,
        pickupLocationId: formData.pickupLocationId,
        buyer: {
          name: formData.buyerName,
          phone: formData.buyerPhone,
          email: formData.buyerEmail,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        packageDetails: {
          length: Number(formData.length),
          breadth: Number(formData.breadth),
          height: Number(formData.height),
          deadWeight: Number(formData.deadWeight),
        },
        items: [
          {
            name: formData.itemName,
            sku: formData.itemSku,
            units: Number(formData.itemUnits),
            sellingPrice: Number(formData.itemPrice),
          },
        ],
        payment: {
          mode: formData.paymentMode,
          subtotal: Number(formData.itemPrice) * Number(formData.itemUnits),
          collectableAmount:
            formData.paymentMode === 'COD'
              ? Number(formData.collectableAmount || formData.itemPrice)
              : 0,
        },
      };

      const res = await api.post('/shipments', payload);
      if (res.data?.success) {
        navigate('/shipments');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shipment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkImport = async () => {
    setSubmitting(true);
    setBulkStatus(null);
    setError(null);
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) {
        throw new Error('Please enter at least 1 order row in CSV');
      }

      const rows = lines.slice(1);
      const orders = [];

      for (const row of rows) {
        const cols = row.split(',').map((c) => c.trim());
        if (cols.length < 7) continue;

        const [orderNum, name, phone, address, city, state, pin, mode, amount, wt] = cols;
        const isCod = mode?.toUpperCase() === 'COD';

        orders.push({
          orderNumber: orderNum || `ORD-BULK-${Date.now()}-${orders.length + 1}`,
          buyerName: name || 'Customer',
          phone: phone || '9999999999',
          address: address || 'Main Road',
          city: city || 'City',
          state: state || 'State',
          pincode: pin || '110001',
          weight: Number(wt || 0.5),
          paymentMode: isCod ? 'COD' : 'PREPAID',
          amount: Number(amount || 999),
        });
      }

      if (orders.length === 0) {
        throw new Error('No valid order rows detected in CSV text');
      }

      const res = await api.post('/shipments/bulk', {
        shipments: orders,
        pickupLocationId: formData.pickupLocationId,
      });

      if (res.data?.success) {
        setBulkStatus(res.data.message || `Successfully imported ${res.data.totalCreated} shipments!`);
        setTimeout(() => {
          navigate('/shipments');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process bulk import');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadSampleCsv = () => {
    const blob = new Blob([csvText], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logixwave_sample_orders.csv';
    a.click();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/shipments"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Create &amp; Ingest Orders</h2>
            <p className="text-xs text-slate-500">Book single order or bulk import spreadsheet for courier allocation</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Order
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bulk')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'bulk' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulk CSV Upload
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold">
          {error}
        </div>
      )}

      {bulkStatus && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{bulkStatus}</span>
        </div>
      )}

      {activeTab === 'single' ? (
        <form onSubmit={handleSubmitSingle} className="space-y-6">
          {/* Warehouse & Order ID */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" /> 1. Pickup Origin &amp; Order ID
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Pickup Warehouse</label>
                {warehouses.length === 0 ? (
                  <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    No warehouse found. <Link to="/warehouses" className="underline font-bold">Add Warehouse</Link>
                  </div>
                ) : (
                  <select
                    value={formData.pickupLocationId}
                    onChange={(e) => setFormData({ ...formData, pickupLocationId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.locationNickname} &bull; {w.city} ({w.pincode})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Order / Invoice ID</label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Truck className="h-4 w-4 text-indigo-600" /> 2. Consignee / Buyer Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={formData.buyerName}
                  onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                  placeholder="e.g. Surendra Kumar"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (10 digits)</label>
                <input
                  type="tel"
                  value={formData.buyerPhone}
                  onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                  placeholder="e.g. 917809730968"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.buyerEmail}
                  onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                  placeholder="customer@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address Line 1 (Flat, Street)</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="Flat 101, Main Road"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address Line 2 / Landmark</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="Near Big Bazaar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Bhubaneswar"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Odisha"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery PIN Code</label>
                <input
                  type="text"
                  maxLength="6"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="751001"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Package Dimensions & Payment */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-indigo-600" /> 3. Package Dimensions &amp; Payment Mode
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Length (cm)</label>
                <input
                  type="number"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Breadth (cm)</label>
                <input
                  type="number"
                  value={formData.breadth}
                  onChange={(e) => setFormData({ ...formData, breadth: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dead Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.deadWeight}
                  onChange={(e) => setFormData({ ...formData, deadWeight: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span>Volumetric Weight: <strong>{volumetric} KG</strong></span>
              <span>Billable Weight: <strong className="text-indigo-600 font-extrabold">{billable} KG</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMode: 'PREPAID', collectableAmount: 0 })}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      formData.paymentMode === 'PREPAID'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    PREPAID
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMode: 'COD' })}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      formData.paymentMode === 'COD'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    CASH ON DELIVERY (COD)
                  </button>
                </div>
              </div>

              {formData.paymentMode === 'COD' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount to Collect (₹)</label>
                  <input
                    type="number"
                    value={formData.collectableAmount}
                    onChange={(e) => setFormData({ ...formData, collectableAmount: e.target.value })}
                    placeholder="e.g. 999"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/shipments"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Saving Shipment...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" /> Save &amp; Go to Courier Allocation
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Bulk CSV Mode */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Batch CSV Import
              </h3>
              <p className="text-xs text-slate-500">Import up to 100 orders in 1 click from your spreadsheet</p>
            </div>
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Download Template
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Paste or Edit CSV Rows (Comma Separated)
            </label>
            <textarea
              rows="8"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={handleBulkImport}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Importing Consignments...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" /> Import All Orders to Ready to Ship
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
