import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Package,
  Search,
  RefreshCw,
  ExternalLink,
  Printer,
  Truck,
  Building2,
  Calendar,
} from 'lucide-react';

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchShipments();
  }, [statusFilter, carrierFilter, page]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (carrierFilter) params.carrier = carrierFilter;

      const res = await api.get('/admin/shipments', { params });
      if (res.data?.success) {
        setShipments(res.data.shipments || []);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load global shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  const token = localStorage.getItem('lxw_token');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" /> Global Shipments Master
          </h2>
          <p className="text-xs text-slate-500">
            Total of {total} consignments across all merchants and carrier networks
          </p>
        </div>

        <button
          onClick={fetchShipments}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchShipments();
          }}
          className="relative flex-1 w-full"
        >
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order #, AWB number, buyer name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-600"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden focus:border-indigo-600"
          >
            <option value="">All Statuses</option>
            <option value="READY_TO_SHIP">Ready to Ship</option>
            <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="NDR_FAILED">NDR Failed</option>
            <option value="RTO_INITIATED">RTO Initiated</option>
          </select>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600" />
            <p>Loading master shipments...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 space-y-2">
            <Package className="h-10 w-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No shipments found matching filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Order / Date</th>
                  <th className="px-5 py-3">Merchant</th>
                  <th className="px-5 py-3">Buyer &amp; Destination</th>
                  <th className="px-5 py-3">Carrier / AWB</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Label</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{s.orderNumber}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(s.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{s.merchant?.companyName || 'AMA YAAR Apparel Co.'}</p>
                      <p className="text-[10px] text-slate-400">{s.merchant?.email}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">{s.buyer?.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {s.buyer?.city}, {s.buyer?.state} ({s.buyer?.pincode})
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      {s.courier?.awbNumber ? (
                        <div>
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[11px]">
                            {s.courier.awbNumber}
                          </span>
                          <p className="text-[10px] text-slate-600 font-medium mt-0.5">{s.courier.carrier}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          s.payment?.mode === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {s.payment?.mode === 'COD' ? `COD ₹${s.payment?.collectableAmount}` : 'Prepaid'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : s.status === 'NDR_FAILED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {s.status?.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {s.courier?.awbNumber && (
                        <button
                          onClick={() => {
                            window.open(
                              `http://localhost:5050/api/v1/shipments/${s._id}/label?token=${token}`,
                              '_blank'
                            );
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          title="Print 4x6 Label"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
