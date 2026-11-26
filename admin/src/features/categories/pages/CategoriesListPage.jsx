import { Fragment, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  CheckCircle2,
  CornerDownRight,
  Layers,
  Sparkles,
  Search,
  ChevronDown,
  ChevronRight,
  Table2,
  LayoutGrid,
} from 'lucide-react';
import { fetchCategories, updateCategory, deleteCategory } from '../categoriesSlice';
import ConfirmDialog from '../../../components/ConfirmDialog';
import getMediaUrl from '../../../utils/mediaUrl';

export default function CategoriesListPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.categories);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState({});

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

  const getImageUrl = (image) => {
    return getMediaUrl(image);
  };

  const toggleExpand = (rootId) => {
    setExpandedIds((prev) => ({
      ...prev,
      [rootId]: !prev[rootId],
    }));
  };

  // Group items into Root Categories with their nested subcategories (supporting multi-level hierarchy)
  const rootCategoryCards = useMemo(() => {
    if (!items || items.length === 0) return [];

    const byId = new Map();
    items.forEach((c) => byId.set(c._id.toString(), c));

    const roots = items.filter((c) => !c.parent);
    const children = items.filter((c) => c.parent);
    const rootIds = new Set(roots.map((r) => r._id.toString()));

    const findRootId = (cat) => {
      const visited = new Set();
      let curr = cat;
      while (curr && curr.parent) {
        const pId = (curr.parent?._id || curr.parent)?.toString();
        if (!pId || visited.has(pId)) return null;
        if (rootIds.has(pId)) return pId;
        visited.add(pId);
        curr = byId.get(pId);
      }
      return null;
    };

    const groupedSubs = new Map();
    const orphans = [];

    children.forEach((child) => {
      const rId = findRootId(child);
      if (rId) {
        if (!groupedSubs.has(rId)) groupedSubs.set(rId, []);
        groupedSubs.get(rId).push(child);
      } else {
        orphans.push(child);
      }
    });

    const cards = roots.map((root) => ({
      root,
      subcategories: groupedSubs.get(root._id.toString()) || [],
    }));

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

  // Filter grouped categories by search query
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rootCategoryCards;

    return rootCategoryCards
      .map(({ root, subcategories }) => {
        const rootMatches =
          root.name?.toLowerCase().includes(q) || root.slug?.toLowerCase().includes(q);
        if (rootMatches) {
          return { root, subcategories };
        }
        const matchingSubs = subcategories.filter(
          (sub) => sub.name?.toLowerCase().includes(q) || sub.slug?.toLowerCase().includes(q)
        );
        if (matchingSubs.length > 0) {
          return { root, subcategories: matchingSubs };
        }
        return null;
      })
      .filter(Boolean);
  }, [rootCategoryCards, searchQuery]);

  const allExpanded =
    filteredGroups.some(({ subcategories }) => subcategories.length > 0) &&
    filteredGroups.every(({ root, subcategories }) => subcategories.length === 0 || !!expandedIds[root._id]);

  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedIds({});
    } else {
      const next = {};
      filteredGroups.forEach(({ root, subcategories }) => {
        if (subcategories.length > 0) next[root._id] = true;
      });
      setExpandedIds(next);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
            Categories & Subcategories
            <Sparkles className="h-4 w-4 text-amber-500" />
          </h1>
          <p className="text-[11px] font-medium text-slate-500">
            Manage root categories and their nested subcategories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 className="h-3.5 w-3.5" /> Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Cards
            </button>
          </div>

          <Link
            to="/categories/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-slate-900 shadow-xs transition hover:bg-amber-300"
          >
            <Plus className="h-3.5 w-3.5" /> Add Root Category
          </Link>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      {status !== 'loading' && rootCategoryCards.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories or slugs..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
            <span>
              <strong className="text-slate-800">{filteredGroups.length}</strong> roots •{' '}
              <strong className="text-slate-800">
                {filteredGroups.reduce((acc, g) => acc + g.subcategories.length, 0)}
              </strong>{' '}
              subs
            </span>
            {viewMode === 'table' && (
              <button
                type="button"
                onClick={handleToggleAll}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                {allExpanded ? 'Collapse All' : 'Expand All'}
              </button>
            )}
          </div>
        </div>
      )}

      {status === 'loading' ? (
        <div className="flex items-center justify-center py-12 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            <span className="text-xs font-bold text-slate-700">Loading categories...</span>
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
      ) : filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-slate-300 bg-white text-center">
          <Search className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-700">No categories match "{searchQuery}"</p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* CLEAN COMPACT HIERARCHICAL TABLE VIEW */
        <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Slug
                  </th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">
                    Products
                  </th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGroups.map(({ root, subcategories }) => {
                  const isExpanded = searchQuery.trim().length > 0 || !!expandedIds[root._id];
                  const hasSubs = subcategories.length > 0;

                  return (
                    <Fragment key={root._id}>
                      {/* ROOT CATEGORY ROW */}
                      <tr className="bg-slate-50/50 hover:bg-slate-100/70 transition-colors">
                        <td className="px-3 py-1.5 align-middle">
                          <div className="flex items-center gap-2">
                            {hasSubs ? (
                              <button
                                type="button"
                                onClick={() => toggleExpand(root._id)}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition"
                                title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </button>
                            ) : (
                              <span className="w-5 shrink-0" />
                            )}

                            {root.image ? (
                              <img
                                src={getImageUrl(root.image)}
                                alt={root.name}
                                className="h-7 w-7 rounded object-cover ring-1 ring-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-900 text-white">
                                <Layers className="h-3.5 w-3.5" />
                              </div>
                            )}

                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-extrabold text-slate-900">{root.name}</span>
                              <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                                {subcategories.length} {subcategories.length === 1 ? 'sub' : 'subs'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-1.5 align-middle font-mono text-[11px] text-slate-600">
                          /{root.slug}
                        </td>

                        <td className="px-3 py-1.5 align-middle">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-800 border border-blue-200">
                            ROOT
                          </span>
                        </td>

                        <td className="px-3 py-1.5 align-middle text-center">
                          <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-700">
                            {root.productCount ?? 0}
                          </span>
                        </td>

                        <td className="px-3 py-1.5 align-middle">
                          {root.isActive !== undefined && !root.isVirtual ? (
                            <button
                              type="button"
                              onClick={() => handleToggleActive(root)}
                              disabled={togglingId === root._id}
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition border ${
                                root.isActive
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title={root.isActive ? 'Click to Disable' : 'Click to Activate'}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  root.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              {root.isActive ? 'Active' : 'Disabled'}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-3 py-1.5 align-middle text-right">
                          {!root.isVirtual && (
                            <div className="inline-flex items-center justify-end gap-1">
                              <Link
                                to={`/categories/new?parent=${root._id}`}
                                className="inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-[10px] font-bold text-white hover:bg-slate-800 transition"
                              >
                                <Plus className="h-3 w-3" /> Sub
                              </Link>
                              <Link
                                to={`/categories/${root._id}/edit`}
                                className="inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 transition"
                                title="Edit Root Category"
                              >
                                <Pencil className="h-3 w-3" /> Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => setToDelete(root)}
                                className="rounded border border-rose-200 bg-rose-50 p-1 text-rose-600 hover:bg-rose-100 transition"
                                title="Delete Root Category"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* CHILD SUBCATEGORY ROWS */}
                      {isExpanded &&
                        subcategories.map((sub) => (
                          <tr key={sub._id} className="bg-white hover:bg-purple-50/30 transition-colors">
                            <td className="px-3 py-1.5 align-middle">
                              <div className="flex items-center gap-2 pl-6">
                                <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                                {sub.image ? (
                                  <img
                                    src={getImageUrl(sub.image)}
                                    alt={sub.name}
                                    className="h-6 w-6 rounded object-cover ring-1 ring-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-purple-100 text-purple-700 border border-purple-200">
                                    <FolderTree className="h-3 w-3" />
                                  </div>
                                )}
                                <span className="text-xs font-semibold text-slate-800">{sub.name}</span>
                              </div>
                            </td>

                            <td className="px-3 py-1.5 align-middle font-mono text-[11px] text-slate-500">
                              /{sub.slug}
                            </td>

                            <td className="px-3 py-1.5 align-middle">
                              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
                                SUB
                              </span>
                            </td>

                            <td className="px-3 py-1.5 align-middle text-center">
                              <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded bg-slate-50 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
                                {sub.productCount ?? 0}
                              </span>
                            </td>

                            <td className="px-3 py-1.5 align-middle">
                              <button
                                type="button"
                                onClick={() => handleToggleActive(sub)}
                                disabled={togglingId === sub._id}
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition border ${
                                  sub.isActive
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                title={sub.isActive ? 'Active - Click to Disable' : 'Disabled - Click to Activate'}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    sub.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                  }`}
                                />
                                {sub.isActive ? 'Active' : 'Disabled'}
                              </button>
                            </td>

                            <td className="px-3 py-1.5 align-middle text-right">
                              <div className="inline-flex items-center justify-end gap-1">
                                <Link
                                  to={`/categories/${sub._id}/edit`}
                                  className="inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 transition"
                                  title="Edit Subcategory"
                                >
                                  <Pencil className="h-3 w-3" /> Edit
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => setToDelete(sub)}
                                  className="rounded border border-rose-200 bg-rose-50 p-1 text-rose-600 hover:bg-rose-100 transition"
                                  title="Delete Subcategory"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {filteredGroups.map(({ root, subcategories }) => (
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
                          className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold ${
                            root.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {root.isActive ? 'Active' : 'Disabled'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                      /{root.slug} • <strong className="text-slate-800">{subcategories.length} Subs</strong> •{' '}
                      {root.productCount ?? 0} Prods
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
                      className={`rounded-sm border p-1 transition ${
                        root.isActive
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
                    {subcategories.map((sub) => (
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

                        {/* Directly Visible Subcategory Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(sub)}
                            disabled={togglingId === sub._id}
                            className={`rounded border p-1 transition shadow-2xs ${
                              sub.isActive
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100'
                            }`}
                            title={sub.isActive ? 'Active - Click to Disable' : 'Disabled - Click to Activate'}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>

                          <Link
                            to={`/categories/${sub._id}/edit`}
                            className="inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
                            title="Edit Subcategory"
                          >
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setToDelete(sub)}
                            className="rounded border border-rose-200 bg-rose-50 p-1 text-rose-600 hover:bg-rose-100 transition shadow-2xs"
                            title="Delete Subcategory"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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
