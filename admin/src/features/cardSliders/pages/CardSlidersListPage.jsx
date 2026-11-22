import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Eye,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import { fetchCardSliders, deleteCardSlider, updateCardSlider, createCardSlider } from '../cardSlidersSlice';
import DataTable from '../../../components/DataTable';
import ConfirmDialog from '../../../components/ConfirmDialog';
import getMediaUrl from '../../../utils/mediaUrl';

const DEFAULT_SHOP_BY_CATEGORY_SEEDS = [
  {
    title: 'Suits',
    subtitle: 'Tailored Street Elegance',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
    link: '/products?category=suits',
    badge: 'Trending',
    displayOrder: 1,
    isActive: true,
  },
  {
    title: 'Jackets',
    subtitle: 'Weatherproof & Utility',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    link: '/products?category=jackets',
    badge: 'Popular',
    displayOrder: 2,
    isActive: true,
  },
  {
    title: 'Shirts',
    subtitle: 'Casual & Oxford Fits',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    link: '/products?category=shirts',
    badge: 'New Drop',
    displayOrder: 3,
    isActive: true,
  },
  {
    title: 'Trousers',
    subtitle: 'Pleated & Tailored',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    link: '/products?category=trousers',
    badge: 'Essentials',
    displayOrder: 4,
    isActive: true,
  },
  {
    title: 'Overcoats',
    subtitle: 'Winter Layers & Dusters',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80',
    link: '/products?category=overcoats',
    badge: 'Premium',
    displayOrder: 5,
    isActive: true,
  },
];

export default function CardSlidersListPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.cardSliders);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [seeding, setSeeding] = useState(false);

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

  const handleSeedDefaults = async () => {
    if (!window.confirm('Add the 5 standard categories (Suits, Jackets, Shirts, Trousers, Overcoats) to your rail?')) {
      return;
    }
    setSeeding(true);
    try {
      for (const seed of DEFAULT_SHOP_BY_CATEGORY_SEEDS) {
        await dispatch(createCardSlider(seed));
      }
      dispatch(fetchCardSliders());
    } finally {
      setSeeding(false);
    }
  };

  const activeCards = (items || []).filter((c) => c.isActive !== false);

  const columns = [
    {
      key: 'card',
      header: 'Category Card',
      render: (card) => (
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/60">
            {card.image ? (
              <img
                src={getMediaUrl(card.image)}
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Shop By Category Cards
            </h1>
            <span className="rounded bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Homepage Rail
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Configure the cards, covers, titles, and links for the "SHOP BY CATEGORY" rail on your homepage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{showPreview ? 'Hide Rail Preview' : 'Show Rail Preview'}</span>
          </button>
          {(!items || items.length === 0) && (
            <button
              type="button"
              disabled={seeding}
              onClick={handleSeedDefaults}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 shadow-xs transition disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{seeding ? 'Seeding...' : 'Load Suits/Jackets Preset'}</span>
            </button>
          )}
          <Link
            to="/card-sliders/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category Card</span>
          </Link>
        </div>
      </div>

      {/* LIVE STOREFRONT RAIL PREVIEW (Matching user screenshot) */}
      {showPreview && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">
                Shop By Category
              </span>
              <p className="text-[11px] text-slate-500">Live preview of the rail as seen by visitors on your homepage</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-xs text-xs">
                  <ArrowLeft className="h-3.5 w-3.5" />
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-xs text-xs">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <span className="text-xs font-bold text-neutral-500">See all</span>
            </div>
          </div>

          <div className="flex items-start gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin">
            {(activeCards.length > 0 ? activeCards : DEFAULT_SHOP_BY_CATEGORY_SEEDS).map((item, idx) => (
              <div
                key={item._id || item.id || idx}
                className={`shrink-0 w-[170px] sm:w-[190px] rounded-2xl bg-neutral-900 overflow-hidden relative shadow-md group transition-all duration-300 ${
                  idx % 2 === 1 ? 'h-[240px] sm:h-[270px] mt-6' : 'h-[240px] sm:h-[270px] mt-0'
                }`}
              >
                <img
                  src={getMediaUrl(item.image)}
                  alt={item.title}
                  className="h-full w-full object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {item.badge && (
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black">
                    {item.badge}
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3.5">
                  <span className="text-xs sm:text-sm font-extrabold leading-tight text-white drop-shadow-md pr-1">
                    {item.title}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white backdrop-blur-xs">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          rows={items}
          loading={status === 'loading'}
          emptyLabel="No category cards created yet. Click 'Add Category Card' or 'Load Suits/Jackets Preset'."
        />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete "${toDelete?.title}"?`}
        message="This category card will be removed from the storefront homepage rail immediately."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
