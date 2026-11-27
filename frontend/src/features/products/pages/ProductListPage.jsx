import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  SlidersHorizontal,
  X,
  Star,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { fetchProducts, fetchCategories, fetchFilterOptions } from '../productsSlice';
import ProductCard from '../../../components/ProductCard';
import EmptyState from '../../../components/EmptyState';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { items: products, pagination, categories, filterOptions, loading } = useSelector(
    (state) => state.products
  );

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Extract query params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const gender = searchParams.get('gender') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const minDiscount = searchParams.get('minDiscount') || '';
  const inStock = searchParams.get('inStock') || '';
  const sort = searchParams.get('sort') || 'newest';

  // Local price inputs
  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchFilterOptions());
  }, [dispatch]);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    dispatch(fetchProducts(params));
  }, [dispatch, searchParams]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    // Only reset to page 1 if changing a filter (category, sort, price, etc.), NOT when navigating pages
    if (key !== 'page') {
      next.set('page', '1');
    }
    setSearchParams(next);
    if (key === 'page') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateMultipleFilters = (entries) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(entries).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(search ? { search } : {});
    setPriceRange({ min: '', max: '' });
  };

  const activeFilterCount = [
    category,
    gender,
    minPrice,
    maxPrice,
    minRating,
    minDiscount,
    inStock,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12">
        
        {/* Top Header & Breadcrumb (Exact Image 2 Reference) */}
        <div className="mb-6">
          <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1.5 font-medium">
            <Link to="/" className="hover:text-black transition">Home</Link>
            <span>/</span>
            <span className="text-black font-semibold uppercase tracking-wider">
              {search ? `Search: "${search}"` : category ? category.replace(/-/g, ' ') : 'ALL PRODUCTS'}
            </span>
          </nav>

          <p className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase mb-1">
            AMA YAAR COLLECTION
          </p>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight uppercase mb-4">
            {search ? `SEARCH: "${search.toUpperCase()}"` : category ? category.replace(/-/g, ' ').toUpperCase() : 'EXPLORE ALL COLLECTIONS'}
          </h1>

          {/* Category Tabs Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => updateFilter('category', '')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap rounded-xs ${
                !category
                  ? 'bg-black text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => updateFilter('category', cat.slug)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap rounded-xs ${
                  category === cat.slug
                    ? 'bg-black text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area without fixed sidebar */}
        <main>
          {/* Toolbar: Filter on Left side, Sort by: on Right side */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 border-b border-neutral-200 pb-3.5">
            {/* Filter Button & Clear All */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="inline-flex items-center gap-2 whitespace-nowrap border border-neutral-300 bg-white px-3 sm:px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-900 hover:border-black transition cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="whitespace-nowrap text-[11px] sm:text-xs font-bold text-rose-600 hover:underline uppercase tracking-wider cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0 ml-auto">
              <span className="whitespace-nowrap text-neutral-500 uppercase tracking-wider font-bold text-[10px] sm:text-[11px]">
                Sort by:
              </span>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="border border-neutral-300 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-black focus:border-black focus:outline-none focus:ring-0 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Customer Rating</option>
                <option value="discount-desc">Better Discount</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFilterCount > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {category && (
                <span className="inline-flex items-center gap-1.5 bg-neutral-100 border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-800">
                  Category: {category}
                  <button onClick={() => updateFilter('category', '')} className="hover:text-black cursor-pointer"><X className="h-3.5 w-3.5" /></button>
                </span>
              )}
              {minPrice && (
                <span className="inline-flex items-center gap-1.5 bg-neutral-100 border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-800">
                  Min: ₹{minPrice}
                  <button onClick={() => updateFilter('minPrice', '')} className="hover:text-black cursor-pointer"><X className="h-3.5 w-3.5" /></button>
                </span>
              )}
              {maxPrice && (
                <span className="inline-flex items-center gap-1.5 bg-neutral-100 border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-800">
                  Max: ₹{maxPrice}
                  <button onClick={() => updateFilter('maxPrice', '')} className="hover:text-black cursor-pointer"><X className="h-3.5 w-3.5" /></button>
                </span>
              )}
              {minRating && (
                <span className="inline-flex items-center gap-1.5 bg-neutral-100 border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-800">
                  {minRating}★ & Above
                  <button onClick={() => updateFilter('minRating', '')} className="hover:text-black cursor-pointer"><X className="h-3.5 w-3.5" /></button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid Area (Always 4 Columns on Desktop) */}
          {loading ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2.5 py-4 text-xs font-extrabold uppercase tracking-widest text-black">
                <Loader2 className="h-5 w-5 animate-spin text-black" />
                <span>{search ? `Searching "${search}"…` : 'Loading products…'}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-5 lg:gap-x-6 gap-y-8 sm:gap-y-12">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col">
                    <div className="aspect-[3/4.2] bg-neutral-200 w-full rounded-xs" />
                    <div className="mt-3 h-4 bg-neutral-200 w-3/4" />
                    <div className="mt-2 h-4 bg-neutral-200 w-1/3" />
                  </div>
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="NO PRODUCTS FOUND"
              subtitle="Try adjusting or clearing your filters to explore our full streetwear catalogue."
              badge="NO MATCHES"
              actionText="Clear All Filters"
              actionLink=""
              onAction={clearAllFilters}
              onRefresh={() => dispatch(fetchProducts({ limit: 12 }))}
              secondaryActionText="Reset View"
            />
          ) : (
            /* Always 4 Columns Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-5 lg:gap-x-6 gap-y-8 sm:gap-y-12">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => updateFilter('page', pagination.page - 1)}
                  className="border border-neutral-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black disabled:opacity-40 hover:bg-neutral-100 cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateFilter('page', p)}
                    className={`h-9 w-9 text-xs font-bold transition cursor-pointer ${
                      pagination.page === p
                        ? 'bg-black text-white'
                        : 'border border-neutral-300 bg-white text-black hover:bg-neutral-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => updateFilter('page', pagination.page + 1)}
                  className="border border-neutral-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black disabled:opacity-40 hover:bg-neutral-100 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>

      {/* Slide-over Filter Drawer (Desktop & Mobile) */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="ml-auto flex h-full w-full max-w-sm flex-col bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-black" />
                <h3 className="text-sm font-black text-black uppercase tracking-wider">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-black text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-rose-600 hover:underline uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1 text-neutral-500 hover:text-black cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Drawer Filter Controls */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6 text-xs divide-y divide-neutral-100">
              {/* Gender / Audience */}
              <div>
                <h4 className="font-black text-black uppercase tracking-wider mb-2.5">Shop For</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'All', val: '' },
                    { label: 'Men', val: 'men' },
                    { label: 'Women', val: 'women' },
                    { label: 'Unisex', val: 'unisex' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => updateFilter('gender', opt.val)}
                      className={`px-3 py-2 text-xs font-bold border transition cursor-pointer ${
                        gender === opt.val
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="pt-5">
                <h4 className="font-black text-black uppercase tracking-wider mb-2.5">Category</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`block w-full text-left px-3 py-2 text-xs font-bold transition ${
                      !category ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => updateFilter('category', c.slug)}
                      className={`block w-full text-left px-3 py-2 text-xs font-bold transition ${
                        category === c.slug ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="pt-5">
                <h4 className="font-black text-black uppercase tracking-wider mb-2.5">Price Range (₹)</h4>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full border border-neutral-300 px-3 py-2 text-xs focus:border-black focus:outline-none focus:ring-0"
                  />
                  <span className="text-neutral-400 font-bold">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full border border-neutral-300 px-3 py-2 text-xs focus:border-black focus:outline-none focus:ring-0"
                  />
                </div>
                <button
                  onClick={() => {
                    updateMultipleFilters({
                      minPrice: priceRange.min,
                      maxPrice: priceRange.max,
                    });
                    setFilterDrawerOpen(false);
                  }}
                  className="w-full bg-black py-2.5 text-xs font-black text-white uppercase tracking-wider hover:bg-neutral-800 transition cursor-pointer active:scale-[0.99]"
                >
                  Apply Price
                </button>
              </div>


              {/* Customer Rating Filter */}
              <div className="pt-5">
                <h4 className="font-black text-black uppercase tracking-wider mb-2.5">Customer Rating</h4>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2].map((r) => {
                    const isSelected = minRating === String(r);
                    return (
                      <button
                        key={r}
                        onClick={() => updateFilter('minRating', isSelected ? '' : r)}
                        className={`flex items-center justify-between w-full px-3 py-2 text-xs font-bold border transition ${
                          isSelected
                            ? 'bg-black text-white border-black'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:border-black'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {Array.from({ length: r }).map((_, sIdx) => (
                            <Star key={sIdx} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="ml-1.5">{r} Stars & Above</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Bottom Apply Button */}
            <div className="border-t border-neutral-200 pt-4">
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full bg-black py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                View Results ({products.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
