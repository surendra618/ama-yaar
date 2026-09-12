import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, FolderTree, CheckCircle2 } from 'lucide-react';
import { fetchCategories, updateCategory, deleteCategory } from '../categoriesSlice';
import DataTable from '../../../components/DataTable';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function CategoriesListPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.categories);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleToggleActive = async (c) => {
    setTogglingId(c._id);
    await dispatch(updateCategory({ id: c._id, payload: { isActive: !c.isActive } }));
    setTogglingId(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const result = await dispatch(deleteCategory(toDelete._id));
    setDeleting(false);
    if (!result.error) setToDelete(null);
  };

  const columns = [
    {
      key: 'name',
      header: 'Category',
      render: (c) => (
        <div className="flex items-center gap-3">
          {c.image ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200/60">
              <img
                src={c.image}
                alt={c.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden h-full w-full items-center justify-center bg-indigo-50 text-indigo-600">
                <FolderTree className="h-4 w-4" />
              </div>
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FolderTree className="h-4 w-4" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-800">{c.name}</p>
            <p className="text-xs text-slate-400 font-medium">/{c.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'parent',
      header: 'Parent',
      render: (c) => (
        <span className="text-sm font-medium text-slate-600">
          {c.parent?.name || <span className="text-slate-400 italic">Root</span>}
        </span>
      ),
    },
    {
      key: 'productCount',
      header: 'Products',
      render: (c) => (
        <span className="inline-flex items-center justify-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
          {c.productCount ?? 0}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <span
          className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
            c.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-500 border border-slate-200/60'
          }`}
        >
          {c.isActive ? 'Active' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (c) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => handleToggleActive(c)}
            disabled={togglingId === c._id}
            className={`inline-flex items-center justify-center rounded-md border p-1.5 transition hover:scale-105 active:scale-95 ${
              c.isActive
                ? 'border-emerald-200/70 bg-emerald-50/80 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700'
                : 'border-amber-200/70 bg-amber-50/80 text-amber-600 hover:bg-amber-100 hover:text-amber-700'
            }`}
            title={c.isActive ? 'Status: Approved / Active (Click to Disable)' : 'Click to Approve / Activate'}
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <Link
            to={`/categories/${c._id}/edit`}
            className="inline-flex items-center justify-center rounded-md border border-indigo-200/70 bg-indigo-50/80 p-1.5 text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-700 hover:scale-105 active:scale-95"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setToDelete(c)}
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
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Categories</h1>
          <p className="text-sm font-medium text-slate-500">Organize your product catalog</p>
        </div>
        <Link
          to="/categories/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-amber-300 hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Category
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <DataTable columns={columns} rows={items} loading={status === 'loading'} emptyLabel="No categories yet" />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete "${toDelete?.name}"?`}
        message="Categories with subcategories cannot be deleted until those are removed first."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
