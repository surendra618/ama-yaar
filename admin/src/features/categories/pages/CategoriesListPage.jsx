import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, FolderTree, CheckCircle2, CornerDownRight, Layers, Sparkles, MoreVertical } from 'lucide-react';
import { fetchCategories, updateCategory, deleteCategory } from '../categoriesSlice';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function CategoriesListPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.categories);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

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

  const getImageUrl = (image) => {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
      return image;
    }
    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '')
      : 'http://localhost:5000';
    return `${backendUrl}${image.startsWith('/') ? '' : '/'}${image}`;
  };

  // Group items into Root Cards with their respective subcategories inside
  const rootCategoryCards = useMemo(() => {
    if (!items || items.length === 0) return [];

    const roots = items.filter((c) => !c.parent);
    const children = items.filter((c) => c.parent);

    const cards = roots.map((root) => {
      const subs = children.filter((child) => {
        const pId = child.parent?._id || child.parent;
        return pId && pId.toString() === root._id.toString();
      });

      return {
        root,
        subcategories: subs,
      };
    });

    const rootIds = new Set(roots.map((r) => r._id.toString()));
    const orphans = children.filter((child) => {
      const pId = child.parent?._id || child.parent;
      return !pId || !rootIds.has(pId.toString());
    });

    if (orphans.length > 0) {
      cards.push({
        root: {
          _id: 'orphans',
          name: 'Unassigned Subcategories',
          slug: 'other',
          isVirtual: true,
        },
        subcategories: orphans,
      });
    }

    return cards;
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            Categories & Subcategories
            <Sparkles className="h-4 w-4 text-amber-500" />
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Every Root Category is displayed as a Card, with its Child Subcategories grouped inside.
          </p>
        </div>
        <Link
          to="/categories/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-900 shadow-xs transition hover:bg-amber-300 hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Root Category
        </Link>
      </div>

      {status === 'loading' ? (
        <div className="flex items-center justify-center py-12 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            <span className="text-xs font-bold text-slate-700">Loading category cards...</span>
          </div>
        </div>
      ) : rootCategoryCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-slate-300 bg-white text-center">
          <Layers className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Root Categories Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Get started by creating your first Root Category.</p>
          <Link
            to="/categories/new"
            className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" /> Create Category
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {rootCategoryCards.map(({ root, subcategories }) => (
            <div
              key={root._id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:border-slate-300 flex flex-col"
            >
              {/* CARD HEADER: ROOT CATEGORY BANNER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/90 px-4 py-3.5">
                {/* Left: Root Category info */}
                <div className="flex items-center gap-3 min-w-0">
                  {root.image ? (
                    <img
                      src={getImageUrl(root.image)}
                      alt={root.name}
                      className="h-10 w-10 rounded-sm object-cover ring-1 ring-slate-200 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-black text-white shadow-xs">
                      <Layers className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="text-sm font-extrabold text-slate-900 truncate">{root.name}</h2>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-extrabold text-blue-800 border border-blue-200/80">
                        ROOT
                      </span>
                      {root.isActive !== undefined && (
                        <span
                          className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold ${root.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                        >
                          {root.isActive ? 'Active' : 'Disabled'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                      /{root.slug} • <strong className="text-slate-800">{subcategories.length} Subs</strong> • {root.productCount ?? 0} Prods
                    </p>
                  </div>
                </div>

                {/* Right: Actions for Root Category */}
                {!root.isVirtual && (
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <Link
                      to={`/categories/new?parent=${root._id}`}
                      className="inline-flex items-center gap-1 rounded-sm bg-black px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-slate-800 transition"
                    >
                      <Plus className="h-3 w-3" /> Sub
                    </Link>
                    <button
                      onClick={() => handleToggleActive(root)}
                      disabled={togglingId === root._id}
                      className={`rounded-sm border p-1 transition ${root.isActive
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        : 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100'
                        }`}
                      title={root.isActive ? 'Click to Disable' : 'Click to Activate'}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      to={`/categories/${root._id}/edit`}
                      className="rounded-sm border border-indigo-200 bg-indigo-50 p-1 text-indigo-600 hover:bg-indigo-100 transition"
                      title="Edit Root Category"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => setToDelete(root)}
                      className="rounded-sm border border-rose-200 bg-rose-50 p-1 text-rose-600 hover:bg-rose-100 transition"
                      title="Delete Root Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* CARD BODY: SUB CATEGORIES INNER GRID */}
              <div className="p-4 flex-1 flex flex-col gap-2.5">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <CornerDownRight className="h-3.5 w-3.5 text-purple-600" /> Subcategories inside "{root.name}"
                  </h3>
                  {subcategories.length > 0 && !root.isVirtual && (
                    <Link
                      to={`/categories/new?parent=${root._id}`}
                      className="text-[10px] font-bold text-purple-700 hover:underline flex items-center gap-0.5"
                    >
                      + Add Sub
                    </Link>
                  )}
                </div>

                {subcategories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {subcategories.map((sub, subIdx) => (
                      <div
                        key={sub._id}
                        className="flex items-center justify-between gap-2 border border-slate-200 bg-slate-50/70 p-2.5 hover:bg-white hover:border-purple-300 transition shadow-2xs group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {sub.image ? (
                            <img
                              src={getImageUrl(sub.image)}
                              alt={sub.name}
                              className="h-8 w-8 object-cover ring-1 ring-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-purple-100 text-purple-700 font-bold border border-purple-200 text-xs">
                              <FolderTree className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{sub.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">/{sub.slug}</p>
                          </div>
                        </div>

                        {/* Child Subcategory Actions (Ultra Compact Text-Only Popup) */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === sub._id ? null : sub._id);
                            }}
                            className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition shadow-2xs"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeMenuId === sub._id && (
                            <div
                              className={`absolute top-1/2 -translate-y-1/2 z-30 w-[72px] border border-slate-200 bg-white p-0.5 shadow-sm animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5 ${subIdx % 2 === 1 ? 'right-full mr-1' : 'left-full ml-1'
                                }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleToggleActive(sub);
                                }}
                                disabled={togglingId === sub._id}
                                className="w-full text-left px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                              >
                                {sub.isActive ? 'Disable' : 'Activate'}
                              </button>

                              <Link
                                to={`/categories/${sub._id}/edit`}
                                onClick={() => setActiveMenuId(null)}
                                className="w-full text-left px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition block"
                              >
                                Edit
                              </Link>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setToDelete(sub);
                                }}
                                className="w-full text-left px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-50 transition"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-6 text-center bg-slate-50/50">
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      No subcategories added under "{root.name}" yet.
                    </p>
                    <Link
                      to={`/categories/new?parent=${root._id}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add First Subcategory
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete "${toDelete?.name}"?`}
        message="Categories with subcategories cannot be deleted until those subcategories are removed first."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
