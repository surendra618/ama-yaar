import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Warehouse, Plus, MapPin, Phone, Mail, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';

export default function WarehousesPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    locationNickname: '',
    contactPerson: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isPrimary: false,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pickup-locations');
      if (res.data?.success) {
        setLocations(res.data.locations || []);
      }
    } catch (err) {
      console.warn('Fetch locations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/pickup-locations', form);
      if (res.data?.success) {
        setModalOpen(false);
        setForm({
          locationNickname: '',
          contactPerson: '',
          phone: '',
          email: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          isPrimary: false,
        });
        fetchLocations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create warehouse');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this warehouse location?')) return;
    try {
      await api.delete(`/pickup-locations/${id}`);
      fetchLocations();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-indigo-600" /> Pickup Warehouses &amp; Hubs
          </h2>
          <p className="text-xs text-slate-500">
            Registered seller addresses where delivery agents pickup consignments
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" /> Add Pickup Warehouse
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
          <p>Loading registered warehouses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {locations.map((loc) => (
            <div
              key={loc._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-400 shadow-xs transition space-y-3 relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    {loc.locationNickname}
                    {loc.isPrimary && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Primary
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-600 font-bold mt-1">{loc.contactPerson}</p>
                </div>
                {!loc.isPrimary && (
                  <button
                    onClick={() => handleDelete(loc._id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition cursor-pointer"
                    title="Delete location"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {loc.addressLine1} {loc.addressLine2 ? ', ' + loc.addressLine2 : ''}, {loc.city}, {loc.state} -{' '}
                    <strong>{loc.pincode}</strong>
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{loc.phone}</span>
                </p>
                {loc.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{loc.email}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Add Pickup Warehouse Location</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Location Nickname</label>
                <input
                  type="text"
                  placeholder="e.g. Primary Hub, Lucknow Facility"
                  value={form.locationNickname}
                  onChange={(e) => setForm({ ...form, locationNickname: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Vivek Singh"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="8932842907"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  placeholder="E-1/818, Vinay Khand 1"
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Lucknow"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="Uttar Pradesh"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="226010"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={form.isPrimary}
                  onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                <span className="font-bold text-slate-700">Set as Primary Warehouse</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
