import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  SlidersHorizontal,
  X,
  Star,
  RotateCcw,
  Sparkles,
  Filter,
  Check,
  Tag,
  LayoutGrid,
  List,
} from 'lucide-react';
import { fetchProducts, fetchCategories, fetchFilterOptions } from '../productsSlice';
import ProductCard from '../../../components/ProductCard';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { items: products, pagination, categories, filterOptions, loading } = useSelector(
    (state) => state.products
  );

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Extract query params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
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
      next.set(key, value);
    }
    next.set('page', '1'); // reset page on filter change
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(search ? { search } : {});
    setPriceRange({ min: '', max: '' });
  };

  const selectedBrands = brand ? brand.split(',') : [];

  const toggleBrand = (b) => {
    let next;
    if (selectedBrands.includes(b)) {
      next = selectedBrands.filter((x) => x !== b);
    } else {
      next = [...selectedBrands, b];
    }
    updateFilter('brand', next.length > 0 ? next.join(',') : '');
  };

  const activeFilterCount = [
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    minDiscount,
    inStock,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Breadcrumb */}
        <div className="mb-6 border-b border-neutral-100 pb-6">
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-2">
            <Link to="/" className="hover:text-black transition">Home</Link>
            <span>/</span>
            <span className="text-black font-extrabold uppercase tracking-wider">
              {search ? `Search: "${search}"` : category ? category.replace(/-/g, ' ') : 'All Products'}
            </span>
          </nav>
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400 block mb-1">
                AMA YAAR COLLECTION
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
                {search ? `SEARCH RESULTS FOR "${search.toUpperCase()}"` : category ? category.replace(/-/g, ' ').toUpperCase() : 'EXPLORE ALL COLLECTIONS'}
              </h1>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-black bg-black px-4 py-2 text-xs font-bold text-white shadow-xs md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter Products {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {/* Quick Category Tabs Bar */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto scrollbar-hide pt-2 pb-1">
            <button
              onClick={() => updateFilter('category', '')}
              className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                !category
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black border border-neutral-200/60'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => updateFilter('category', cat.slug)}
                className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  category === cat.slug
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black border border-neutral-200/60'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid & Filter Sidebar Layout */}
        <div className="flex gap-8 items-start">
          
          {/* 1. Desktop Filter Sidebar */}
          <aside className="hidden md:block w-64 shrink-0 rounded-md border border-neutral-200/80 bg-white p-5 shadow-2xs sticky top-24">
            
            {/* Sidebar Title */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-5">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-black">
                <SlidersHorizontal className="h-4 w-4 text-black" /> Filters
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-[11px] font-extrabold text-rose-600 uppercase tracking-wider hover:underline"
                >
                  <RotateCcw className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            <div className="space-y-6 text-xs divide-y divide-neutral-100">
              
              {/* Category Filter */}
              <div>
                <h4 className="font-extrabold text-black uppercase tracking-wider mb-3">Category</h4>
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`flex items-center justify-between w-full text-left rounded-md px-3 py-2 text-xs transition font-semibold ${
                      !category
                        ? 'bg-black text-white font-bold'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <span>All Categories</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => updateFilter('category', cat.slug)}
                      className={`flex items-center justify-between w-full text-left rounded-md px-3 py-2 text-xs transition font-semibold ${
                        category === cat.slug
                          ? 'bg-black text-white font-bold'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {cat.productCount > 0 && (
                        <span className={`text-[10px] ${category === cat.slug ? 'text-neutral-300' : 'text-neutral-400'}`}>
                          ({cat.productCount})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="pt-5">
                <h4 className="font-extrabold text-black uppercase tracking-wider mb-3">Price Range (₹)</h4>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 font-medium focus:border-black focus:outline-hidden"
                  />
                  <span className="text-neutral-400 font-bold">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 font-medium focus:border-black focus:outline-hidden"
                  />
                </div>
                <button
                  onClick={() => {
                    updateFilter('minPrice', priceRange.min);
                    updateFilter('maxPrice', priceRange.max);
                  }}
                  className="w-full rounded-md bg-black py-2 text-xs font-black text-white uppercase tracking-wider hover:bg-neutral-800 transition"
                >
                  Apply Price
                </button>
              </div>

              {/* Brand Filter */}
              {filterOptions.brands?.length > 0 && (
                <div className="pt-5">
                  <h4 className="font-extrabold text-black uppercase tracking-wider mb-3">Brand</h4>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {filterOptions.brands.map((b) => (
                      <label key={b} className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-700 hover:text-black">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(b)}
                          onChange={() => toggleBrand(b)}
                          className="rounded-md border-neutral-300 text-black focus:ring-black h-4 w-4"
                        />
                        <span className="truncate">{b}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Filter */}
              <div className="pt-5">
                <h4 className="font-extrabold text-black uppercase tracking-wider mb-3">Customer Rating</h4>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2].map((r) => {
                    const isSelected = minRating === String(r);
                    return (
                      <button
                        key={r}
                        onClick={() => updateFilter('minRating', isSelected ? '' : r)}
                        className={`flex items-center justify-between w-full rounded-md px-3 py-2.5 transition text-xs font-semibold border ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-300 text-neutral-900 font-extrabold shadow-2xs'
                            : 'bg-white border-neutral-100/90 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {Array.from({ length: r }).map((_, sIdx) => (
                            <Star
                              key={sIdx}
                              className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className={`text-[11px] uppercase tracking-wider ${isSelected ? 'font-black text-amber-900' : 'font-semibold text-neutral-400'}`}>
                          {r === 5 ? '5.0 Stars' : '& Above'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Discount Filter */}
              <div className="pt-5">
                <h4 className="font-extrabold text-black uppercase tracking-wider mb-3">Discount</h4>
                <div className="space-y-1.5">
                  {[50, 40, 30, 20].map((d) => (
                    <button
                      key={d}
                      onClick={() => updateFilter('minDiscount', minDiscount === String(d) ? '' : d)}
                      className={`block w-full text-left rounded-md px-3 py-2 transition text-xs font-extrabold ${
                        minDiscount === String(d)
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {d}% OFF or more
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Toggle */}
              <div className="pt-5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-extrabold text-black uppercase tracking-wider">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStock === 'true'}
                    onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                    className="rounded-md border-neutral-300 text-black focus:ring-black h-4 w-4"
                  />
                </label>
              </div>
            </div>
          </aside>

          {/* 2. Main Products Catalog */}
          <main className="flex-1">
            
            {/* Top Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-md border border-neutral-200/80 bg-white p-4 shadow-2xs">
              <div className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                Showing <strong className="text-black font-black">{products.length}</strong> of{' '}
                <strong className="text-black font-black">{pagination.total || products.length}</strong> products
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle Buttons */}
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-md border border-neutral-200/80">
                  <button
                    onClick={() => setViewMode('grid')}
                    title="Grid View (3 cards per row)"
                    className={`p-1.5 rounded-md transition ${
                      viewMode === 'grid'
                        ? 'bg-black text-white shadow-2xs'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    title="List View (1 product per row - Image left, text right)"
                    className={`p-1.5 rounded-md transition ${
                      viewMode === 'list'
                        ? 'bg-black text-white shadow-2xs'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <div className="h-4 w-px bg-neutral-200" />

                <span className="text-xs text-neutral-500 font-extrabold uppercase tracking-wider">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-bold text-black focus:border-black focus:outline-hidden"
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
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1 text-xs font-bold text-white">
                    Category: {category}
                    <button onClick={() => updateFilter('category', '')}><X className="h-3.5 w-3.5" /></button>
                  </span>
                )}
                {brand && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1 text-xs font-bold text-white">
                    Brand: {brand}
                    <button onClick={() => updateFilter('brand', '')}><X className="h-3.5 w-3.5" /></button>
                  </span>
                )}
                {minPrice && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1 text-xs font-bold text-white">
                    Min: ₹{minPrice}
                    <button onClick={() => updateFilter('minPrice', '')}><X className="h-3.5 w-3.5" /></button>
                  </span>
                )}
                {maxPrice && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1 text-xs font-bold text-white">
                    Max: ₹{maxPrice}
                    <button onClick={() => updateFilter('maxPrice', '')}><X className="h-3.5 w-3.5" /></button>
                  </span>
                )}
                {minRating && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1 text-xs font-black text-black">
                    {minRating}★ & Above
                    <button onClick={() => updateFilter('minRating', '')}><X className="h-3.5 w-3.5" /></button>
                  </span>
                )}
                {minDiscount && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1 text-xs font-black text-white">
                    {minDiscount}%+ OFF
                    <button onClick={() => updateFilter('minDiscount', '')}><X className="h-3.5 w-3.5" /></button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-rose-600 font-black uppercase tracking-wider hover:underline ml-2"
                >
                  Reset All
                </button>
              </div>
            )}

            {/* Products Catalog Display (Grid View vs Horizontal List View) */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 bg-white py-16 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-black mb-4">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-black uppercase tracking-wide">No products match your criteria</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mb-6 font-medium">
                  Try adjusting your price range, selecting different categories, or removing active filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="rounded-md bg-black px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'list' ? (
              /* Horizontal List View: 1 Product Per Row (Left Image, Right Details) */
              <div className="flex flex-col gap-4">
                {products.map((product) => {
                  const mainImg =
                    product.images?.[0] ||
                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';
                  return (
                    <div
                      key={product._id}
                      className="group flex flex-col sm:flex-row overflow-hidden rounded-md border border-neutral-200/60 bg-white p-4 shadow-2xs transition-all duration-200 hover:shadow-md hover:border-neutral-300 gap-5"
                    >
                      {/* Left Side: Product Image */}
                      <Link
                        to={`/products/${product.slug || product._id}`}
                        className="relative w-full sm:w-56 aspect-square shrink-0 overflow-hidden bg-neutral-100 rounded-md"
                      >
                        <img
                          src={mainImg}
                          alt={product.name}
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';
                          }}
                        />
                        {product.discount > 0 && (
                          <span className="absolute top-2.5 left-2.5 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                            {product.discount}% OFF
                          </span>
                        )}
                      </Link>

                      {/* Right Side: Product Details & Actions */}
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div>
                          {/* Brand & Category & Rating */}
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-extrabold text-indigo-600 uppercase tracking-widest text-[11px]">
                              {product.brand || product.category?.name || 'AMA YAAR'}
                            </span>
                            {product.rating > 0 && (
                              <span className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span>{product.rating}</span>
                                {product.numReviews > 0 && (
                                  <span className="text-neutral-400 font-normal">
                                    ({product.numReviews})
                                  </span>
                                )}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <Link
                            to={`/products/${product.slug || product._id}`}
                            className="text-base sm:text-lg font-black text-neutral-900 hover:text-indigo-600 transition leading-snug block mb-2"
                          >
                            {product.name}
                          </Link>

                          {/* Description summary */}
                          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-4 font-medium">
                            {product.description ||
                              'Crafted with premium high-quality fabric for ultimate breathability, enduring elegance, and a flawless modern fit.'}
                          </p>
                        </div>

                        {/* Price & Action Buttons Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-neutral-900">
                              ₹{product.price?.toLocaleString('en-IN')}
                            </span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="text-xs text-neutral-400 line-through font-semibold">
                                ₹{product.mrp?.toLocaleString('en-IN')}
                              </span>
                            )}
                            {product.discount > 0 && (
                              <span className="text-xs font-black text-rose-600">
                                ({product.discount}% OFF)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/products/${product.slug || product._id}`}
                              className="rounded-md bg-amber-500 px-5 py-2.5 text-xs font-black text-black hover:bg-amber-400 transition"
                            >
                              Add to Cart
                            </Link>
                            <Link
                              to={`/products/${product.slug || product._id}`}
                              className="rounded-md bg-black px-5 py-2.5 text-xs font-black text-white hover:bg-neutral-800 transition"
                            >
                              Buy Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Standard Grid View: 3 Product Cards Per Row */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => updateFilter('page', pagination.page - 1)}
                  className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-black disabled:opacity-40 hover:bg-neutral-100"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateFilter('page', p)}
                    className={`h-9 w-9 rounded-md text-xs font-black transition ${
                      pagination.page === p
                        ? 'bg-black text-white shadow-xs'
                        : 'border border-neutral-200 bg-white text-black hover:bg-neutral-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => updateFilter('page', pagination.page + 1)}
                  className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-black disabled:opacity-40 hover:bg-neutral-100"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs md:hidden">
          <div className="ml-auto flex h-full w-full max-w-xs flex-col bg-white p-5 shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-black text-black uppercase tracking-wider">Filter Products</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="rounded-md p-1 text-neutral-400 hover:text-black">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-6 text-xs">
              <div>
                <h4 className="font-black text-black uppercase tracking-wider mb-2">Category</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`block w-full text-left rounded-md p-2 font-bold ${!category ? 'bg-black text-white' : 'text-neutral-700'}`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => updateFilter('category', c.slug)}
                      className={`block w-full text-left rounded-md p-2 font-bold ${category === c.slug ? 'bg-black text-white' : 'text-neutral-700'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-neutral-100 pt-3">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full rounded-md bg-black py-3 text-xs font-black uppercase tracking-wider text-white"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
