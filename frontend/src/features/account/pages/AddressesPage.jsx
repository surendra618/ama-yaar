import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, Star, X, MapPin, Home, Briefcase, Check } from 'lucide-react';
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from '../accountSlice';

const emptyForm = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

const FIELD_CONFIG = [
  { name: 'fullName', label: 'Full Name',              placeholder: 'Enter full name',        required: true,  colSpan: 2 },
  { name: 'phone',    label: 'Phone Number',           placeholder: '+91 98765 43210',        required: true,  colSpan: 2 },
  { name: 'line1',    label: 'Address Line 1',         placeholder: 'House no, Street name',  required: true,  colSpan: 2 },
  { name: 'line2',    label: 'Address Line 2',         placeholder: 'Landmark (optional)',    required: false, colSpan: 2 },
  { name: 'city',     label: 'City',                   placeholder: 'City',                   required: true,  colSpan: 1 },
  { name: 'state',    label: 'State',                  placeholder: 'State',                  required: true,  colSpan: 1 },
  { name: 'pincode',  label: 'Pincode',                placeholder: '110001',                 required: true,  colSpan: 1 },
  { name: 'country',  label: 'Country',                placeholder: 'Country',                required: true,  colSpan: 1 },
];

export default function AddressesPage() {
  const dispatch = useDispatch();
  const { addresses, loading } = useSelector((state) => state.account);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingId(addr._id);
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || 'India',
    });
    setModalOpen(true);
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      await dispatch(updateAddress({ id: editingId, data: form }));
    } else {
      await dispatch(addAddress(form));
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await dispatch(deleteAddress(id));
    setDeletingId(null);
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-xl border border-neutral-200/60 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-black uppercase tracking-wide">My Addresses</h2>
              <p className="text-[12px] text-neutral-500 font-medium">Manage your saved delivery addresses</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm hover:bg-neutral-800 transition-all duration-150"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        </div>
      </div>

      {/* Address Cards / Empty State */}
      {loading && addresses.length === 0 ? (
        <div className="rounded-xl border border-neutral-200/60 bg-white shadow-sm p-16 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-8 w-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-neutral-400 font-medium">Loading addresses…</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-16 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <MapPin className="h-7 w-7 text-neutral-400" />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-700">No addresses saved yet</p>
          <p className="text-xs text-neutral-400 font-medium mt-1">Add a delivery address to make checkout faster</p>
          <button
            onClick={openAddModal}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-neutral-800 transition"
          >
            <Plus className="h-4 w-4" />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`relative rounded-xl border bg-white p-5 transition-all duration-150 ${
                addr.isDefault
                  ? 'border-black shadow-md'
                  : 'border-neutral-200/60 shadow-sm hover:border-neutral-300'
              }`}
            >
              {/* Default Badge */}
              {addr.isDefault && (
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  <Check className="h-2.5 w-2.5" /> Default
                </span>
              )}

              {/* Address Icon */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${addr.isDefault ? 'bg-black' : 'bg-neutral-100'}`}>
                  <Home className={`h-4 w-4 ${addr.isDefault ? 'text-white' : 'text-neutral-500'}`} />
                </div>
                <div className="min-w-0 flex-1 pr-16">
                  <p className="text-sm font-extrabold text-black truncate">{addr.fullName}</p>
                  <p className="text-[12px] text-neutral-500 font-medium mt-0.5">{addr.phone}</p>
                </div>
              </div>

              {/* Address Text */}
              <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-4 py-3 mb-4">
                <p className="text-[12px] leading-relaxed text-neutral-700 font-medium">
                  {addr.line1}
                  {addr.line2 && `, ${addr.line2}`}
                </p>
                <p className="text-[12px] text-neutral-600 font-medium mt-0.5">
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>
                <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{addr.country}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(addr)}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-[11px] font-bold text-neutral-700 hover:bg-neutral-50 transition"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => dispatch(setDefaultAddress(addr._id))}
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-[11px] font-bold text-neutral-700 hover:bg-neutral-50 transition"
                  >
                    <Star className="h-3 w-3" /> Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr._id)}
                  disabled={deletingId === addr._id}
                  className="ml-auto flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  {deletingId === addr._id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-black text-black uppercase tracking-wider">
                  {editingId ? 'Edit Address' : 'Add New Address'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                {FIELD_CONFIG.map(({ name, label, placeholder, required, colSpan }) => (
                  <div key={name} className={colSpan === 2 ? 'col-span-2' : 'col-span-1'}>
                    <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                      {label} {required && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      name={name}
                      required={required}
                      placeholder={placeholder}
                      value={form[name]}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm font-semibold text-black placeholder:text-neutral-400 placeholder:font-normal transition focus:border-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-neutral-200 px-5 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-neutral-800 transition disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      {editingId ? 'Save Changes' : 'Add Address'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
