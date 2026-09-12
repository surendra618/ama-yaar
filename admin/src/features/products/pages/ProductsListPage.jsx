import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Pencil, Trash2, Star, CheckCircle2 } from 'lucide-react';
import { fetchProducts, updateProduct, deleteProduct } from '../productsSlice';
import DataTable from '../../../components/DataTable';
import Pagination from '../../../components/Pagination';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function ProductsListPage() {
  const dispatch = useDispatch();
  const { items, pagination, status } = useSelector((state) => state.products);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts({ search, page, limit: 10 }));
  }, [dispatch, search, page]);

  const handleToggleActive = async (p) => {
    setTogglingId(p._id);
    await dispatch(updateProduct({ id: p._id, payload: { isActive: !p.isActive } }));
    setTogglingId(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteProduct(toDelete._id));
    setDeleting(false);
    setToDelete(null);
  };

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200/60">
            <img
              src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
              alt={p.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
              }}
            />
          </div>
          <div className="min-w-0">
            <p className="max-w-[240px] truncate text-sm font-semibold text-slate-800" title={p.name}>
              {p.name}
            </p>
            <p className="text-xs text-slate-400 font-medium">{p.brand || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) => (
        <span className="text-sm font-medium text-slate-600">
          {p.category?.name || '—'}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (p) => (
        <div>
          <span className="font-bold text-slate-900">₹{p.price?.toLocaleString('en-IN')}</span>
          {p.discount > 0 && (
            <span className="ml-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              -{p.discount}%
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => (
        <span className={`font-bold ${p.stock > 10 ? 'text-slate-700' : p.stock > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
          {p.stock ?? 0}
        </span>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (p) => (
        <span className="inline-flex items-center gap-1 font-bold text-slate-700 text-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {p.rating ? p.rating.toFixed(1) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <span
          className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
            p.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-500 border border-slate-200/60'
          }`}
        >
          {p.isActive ? 'Active' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => handleToggleActive(p)}
            disabled={togglingId === p._id}
            className={`inline-flex items-center justify-center rounded-md border p-1.5 transition hover:scale-105 active:scale-95 ${
              p.isActive
                ? 'border-emerald-200/70 bg-emerald-50/80 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700'
                : 'border-amber-200/70 bg-amber-50/80 text-amber-600 hover:bg-amber-100 hover:text-amber-700'
            }`}
            title={p.isActive ? 'Status: Approved / Active (Click to Disable)' : 'Click to Approve / Activate'}
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <Link
            to={`/products/${p._id}/edit`}
            className="inline-flex items-center justify-center rounded-md border border-indigo-200/70 bg-indigo-50/80 p-1.5 text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-700 hover:scale-105 active:scale-95"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setToDelete(p)}
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
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Products</h1>
          <p className="text-sm font-medium text-slate-500">Manage your product catalog</p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-amber-300 hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-3.5 bg-slate-50/40">
          <div className="relative max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-200 py-1.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            />
          </div>
        </div>

        <DataTable columns={columns} rows={items} loading={status === 'loading'} emptyLabel="No products found" />
        <Pagination {...pagination} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete "${toDelete?.name}"?`}
        message="This product will be permanently removed from your catalog."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
