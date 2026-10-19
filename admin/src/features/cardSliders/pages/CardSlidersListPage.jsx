import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { fetchCardSliders, deleteCardSlider, updateCardSlider } from '../cardSlidersSlice';
import DataTable from '../../../components/DataTable';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function CardSlidersListPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.cardSliders);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    dispatch(fetchCardSliders());
  }, [dispatch]);

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteCardSlider(toDelete._id));
    setDeleting(false);
    setToDelete(null);
  };

  const handleToggleActive = async (card) => {
    setTogglingId(card._id);
    await dispatch(updateCardSlider({ id: card._id, payload: { isActive: !card.isActive } }));
    setTogglingId(null);
  };

  const columns = [
    {
      key: 'card',
      header: 'Card Item',
      render: (card) => (
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/60">
            {card.image ? (
              <img
                src={card.image}
                alt={card.title}
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
            <p className="text-sm font-bold text-slate-900">{card.title}</p>
            {card.subtitle && <p className="text-xs font-medium text-slate-500">{card.subtitle}</p>}
            <p className="text-[11px] font-mono text-indigo-600 truncate max-w-[220px]">{card.link || '/products'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'badge',
      header: 'Badge',
      render: (card) => (
        card.badge ? (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200/60">
            {card.badge}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )
      ),
    },
    {
      key: 'order',
      header: 'Display Order',
      render: (card) => (
        <span className="text-xs font-bold text-slate-700">#{card.displayOrder ?? 0}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (card) => (
        <span
          className={`rounded-md px-2.5 py-1 text-[11px] font-bold border ${
            card.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-slate-100 text-slate-500 border-slate-200/60'
          }`}
        >
          {card.isActive ? 'Active' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (card) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => handleToggleActive(card)}
            disabled={togglingId === card._id}
            className={`inline-flex items-center justify-center rounded-md border p-1.5 transition hover:scale-105 active:scale-95 ${
              card.isActive
                ? 'border-emerald-200/70 bg-emerald-50/80 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700'
                : 'border-amber-200/70 bg-amber-50/80 text-amber-600 hover:bg-amber-100 hover:text-amber-700'
            }`}
            title={card.isActive ? 'Disable Card' : 'Activate Card'}
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <Link
            to={`/card-sliders/${card._id}/edit`}
            className="inline-flex items-center justify-center rounded-md border border-indigo-200/70 bg-indigo-50/80 p-1.5 text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-700 hover:scale-105 active:scale-95"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setToDelete(card)}
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
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Card Slider Rail</h1>
          <p className="text-sm font-medium text-slate-500">Manage interactive homepage slider cards</p>
        </div>
        <Link
          to="/card-sliders/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-amber-300 hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Card Slide
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <DataTable columns={columns} rows={items} loading={status === 'loading'} emptyLabel="No card slides created yet" />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete "${toDelete?.title}"?`}
        message="This card slide will be removed from the storefront homepage immediately."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
