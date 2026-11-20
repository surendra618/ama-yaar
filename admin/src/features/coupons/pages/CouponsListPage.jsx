import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, Tag, CheckCircle2 } from 'lucide-react';
import { fetchCoupons, updateCoupon, deleteCoupon } from '../couponsSlice';
import DataTable from '../../../components/DataTable';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function CouponsListPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.coupons);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  const handleToggleActive = async (c) => {
    setTogglingId(c._id);
    await dispatch(updateCoupon({ id: c._id, payload: { isActive: !c.isActive } }));
    setTogglingId(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteCoupon(toDelete._id));
    setDeleting(false);
    setToDelete(null);
  };

  const isExpired = (c) => new Date(c.expiryDate) < new Date();

  const columns = [
    {
      key: 'code',
      header: 'Coupon',
      render: (c) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Tag className="h-4 w-4" />
          </div>
          <span className="font-mono text-sm font-bold tracking-wide text-slate-800">{c.code}</span>
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (c) => (
        <span className="inline-flex items-center rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
          {c.discountType === 'percentage'
            ? `${c.discountValue}% off`
            : c.discountType === 'fixed'
            ? `₹${c.discountValue} off`
            : 'Free Delivery'}
        </span>
      ),
    },
    {
      key: 'minOrder',
      header: 'Min. Order',
      render: (c) => (
        <span className="font-medium text-slate-600">{c.minOrderValue ? `₹${c.minOrderValue}` : '—'}</span>
      ),
    },
    {
      key: 'usage',
      header: 'Usage',
      render: (c) => (
        <span className="inline-flex items-center justify-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
          {c.usedCount || 0} / {c.usageLimit || '∞'}
        </span>
      ),
    },
    {
      key: 'expiry',
      header: 'Expires',
      render: (c) => (
        <span className={`text-xs font-medium ${isExpired(c) ? 'text-rose-600' : 'text-slate-500'}`}>
          {new Date(c.expiryDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status & Toggle',
      render: (c) => {
        const active = c.isActive && !isExpired(c);
        const isToggling = togglingId === c._id;
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleActive(c)}
              disabled={isToggling}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                c.isActive ? 'bg-emerald-600' : 'bg-slate-300'
              } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
              title={c.isActive ? 'Click to deactivate' : 'Click to activate'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  c.isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold border ${
                c.isActive && !isExpired(c)
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isExpired(c)
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {isExpired(c) ? 'Expired' : c.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div className="flex justify-end gap-1.5">
          <Link
            to={`/coupons/${c._id}/edit`}
            className="inline-flex items-center justify-center rounded-md border border-indigo-200/70 bg-indigo-50/80 p-1.5 text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-700 hover:scale-105 active:scale-95"
            title="Edit Coupon"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setToDelete(c)}
            className="inline-flex items-center justify-center rounded-md border border-rose-200/70 bg-rose-50/80 p-1.5 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700 hover:scale-105 active:scale-95"
            title="Delete Coupon"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Coupons</h1>
          <p className="text-sm font-medium text-slate-500">Create and manage promotional discount codes</p>
        </div>
        <Link
          to="/coupons/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-amber-300 hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Coupon
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <DataTable columns={columns} rows={items} loading={status === 'loading'} emptyLabel="No coupons yet" />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete coupon "${toDelete?.code}"?`}
        message="Customers will no longer be able to use this code."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
