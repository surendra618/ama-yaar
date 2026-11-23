import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { fetchBanners, deleteBanner, updateBanner } from '../bannersSlice';
import DataTable from '../../../components/DataTable';
import ConfirmDialog from '../../../components/ConfirmDialog';
import getMediaUrl from '../../../utils/mediaUrl';

const POSITION_LABELS = {
  home_hero: 'Home Hero',
  home_promo: 'Home Promo',
  category: 'Category',
  offer_strip: 'Offer Strip',
};

export default function BannersListPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.banners);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteBanner(toDelete._id));
    setDeleting(false);
    setToDelete(null);
  };

  const handleToggleActive = async (b) => {
    setTogglingId(b._id);
    await dispatch(updateBanner({ id: b._id, bannerData: { isActive: !b.isActive } }));
    setTogglingId(null);
  };

  const columns = [
    {
      key: 'banner',
      header: 'Banner',
      render: (b) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200/60">
            {b.image ? (
              <img
                src={getMediaUrl(b.image)}
                alt={b.title}
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
          <div>
            <p className="text-sm font-semibold text-slate-800">{b.title || <span className="italic text-slate-400 font-normal">(Image Only Banner)</span>}</p>
            <p className="text-xs font-mono font-medium text-indigo-600 truncate max-w-[200px]">{b.link || '—'}</p>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
              <span className="font-semibold text-slate-700">Opacity: {b.opacity ?? 100}%</span>
              <span>•</span>
              <span className={b.mobileImage ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                {b.mobileImage ? 'Mobile Banner: Custom' : 'Mobile Banner: Auto'}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Placement',
      render: (b) => (
        <span className="inline-flex items-center rounded-md border border-indigo-200/60 bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
          {POSITION_LABELS[b.position] || b.position}
        </span>
      ),
    },
    {
      key: 'schedule',
      header: 'Schedule',
      render: (b) => (
        <span className="text-xs font-medium text-slate-500">
          {b.startDate || b.endDate
            ? `${b.startDate ? new Date(b.startDate).toLocaleDateString() : '—'} → ${b.endDate ? new Date(b.endDate).toLocaleDateString() : '—'}`
            : 'Always on'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => (
        <span
          className={`rounded-md px-2.5 py-1 text-[11px] font-bold border ${
            b.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-slate-100 text-slate-500 border-slate-200/60'
          }`}
        >
          {b.isActive ? 'Active' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (b) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => handleToggleActive(b)}
            disabled={togglingId === b._id}
            className={`inline-flex items-center justify-center rounded-md border p-1.5 transition hover:scale-105 active:scale-95 ${
              b.isActive
                ? 'border-emerald-200/70 bg-emerald-50/80 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700'
                : 'border-amber-200/70 bg-amber-50/80 text-amber-600 hover:bg-amber-100 hover:text-amber-700'
            }`}
            title={b.isActive ? 'Disable Banner' : 'Approve & Activate Banner'}
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <Link
            to={`/banners/${b._id}/edit`}
            className="inline-flex items-center justify-center rounded-md border border-indigo-200/70 bg-indigo-50/80 p-1.5 text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-700 hover:scale-105 active:scale-95"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setToDelete(b)}
            className="inline-flex items-center justify-center rounded-md border border-rose-200/70 bg-rose-50/80 p-1.5 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700 hover:scale-105 active:scale-95"
            title="Delete"
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
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Banners</h1>
          <p className="text-sm font-medium text-slate-500">Manage promotional banners across the storefront</p>
        </div>
        <Link
          to="/banners/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-amber-300 hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Banner
        </Link>
      </div>

      {/* Featured Instagram Banner Direct Link */}
      <div className="rounded-xl border border-pink-200 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-lg shadow-sm">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Homepage Instagram Promo Banner
            </h3>
            <p className="text-xs text-slate-600">
              Customize the full-width Instagram banner displayed on the homepage with live preview & click redirect URL
            </p>
          </div>
        </div>
        <Link
          to="/homepage-showcase?tab=instagram"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-neutral-800 transition shadow-xs shrink-0"
        >
          <span>Manage Instagram Banner</span>
          <span>&rarr;</span>
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <DataTable columns={columns} rows={items} loading={status === 'loading'} emptyLabel="No banners yet" />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete "${toDelete?.title}"?`}
        message="This banner will be removed from the storefront immediately."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
