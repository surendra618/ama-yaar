import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Search,
  MessageSquare,
  Package,
  Check,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Play,
  Video,
  X,
} from 'lucide-react';
import api from '../../../lib/axios';
import { getMediaUrl } from '../../../utils/mediaUrl';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function ReviewsListPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'pending'
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [activeMediaModal, setActiveMediaModal] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/reviews/admin/all', { params });
      const data = res.data?.data || {};
      setReviews(data.reviews || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      console.warn('Failed to fetch reviews:', err);
      // Fallback to public reviews list if admin endpoint unavailable
      try {
        const fallbackRes = await api.get('/reviews', { params: { limit: 20 } });
        setReviews(fallbackRes.data?.data?.reviews || []);
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReviews();
  };

  const handleToggleApprove = async (review) => {
    setActionLoadingId(review._id);
    try {
      await api.patch(`/reviews/admin/${review._id}/toggle-approve`);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === review._id ? { ...r, isApproved: !r.isApproved } : r
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update review status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/reviews/${toDelete._id}`);
      setReviews((prev) => prev.filter((r) => r._id !== toDelete._id));
      setToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Star className="h-4 w-4 fill-white" />
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Product Reviews & Ratings
            </h1>
            <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {pagination.total || reviews.length} Reviews
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Moderate, approve, and manage customer reviews submitted on products across your storefront.
          </p>
        </div>

        {/* Filter by Approval Status */}
        <div className="flex items-center gap-2">
          {['all', 'approved', 'pending'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quick link to Homepage Happy Customers Slider */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Star className="h-4 w-4 text-amber-600 fill-amber-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-950">Looking to edit the &ldquo;OUR HAPPY Customers&rdquo; homepage slider?</p>
            <p className="text-[11px] text-amber-800 font-medium">Manage featured customer testimonials, photos, ratings, and purchased products shown on the homepage.</p>
          </div>
        </div>
        <Link
          to="/happy-customers"
          className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-1.5 text-xs font-bold text-white hover:bg-neutral-800 transition shrink-0 shadow-xs cursor-pointer"
        >
          <span>Edit Happy Customers</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by comment, product or customer..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:border-black focus:ring-1 focus:ring-black outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Reviews Table / List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="h-6 w-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No reviews found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Customer reviews submitted on product detail pages will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((rev) => {
              const product = rev.product || {};
              const author = rev.user?.name || rev.userName || 'Anonymous Customer';
              const productImg = Array.isArray(product.images) && product.images[0] ? product.images[0] : null;

              return (
                <div key={rev._id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-5 hover:bg-slate-50/70 transition">
                  {/* Left: Product & Review Details */}
                  <div className="space-y-3 flex-1">
                    {/* Product Header */}
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {productImg ? (
                          <img
                            src={getMediaUrl(productImg)}
                            alt={product.name || 'Product'}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/model01.png';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-400">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {product.name || 'Unnamed Product'}
                          </span>
                          {product.price && (
                            <span className="font-mono text-[11px] text-slate-500">
                              ₹{Number(product.price).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Reviewed by <strong className="text-slate-800">{author}</strong>
                          </span>
                          {(rev.isVerifiedPurchase || rev.user) && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                              <Check className="h-2.5 w-2.5" />
                              <span>Verified Purchase</span>
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            • {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }) : 'Recent'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating & Review Body */}
                    <div className="pl-0 sm:pl-15 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">
                          {rev.rating} of 5 Stars
                        </span>
                      </div>

                      {rev.title && (
                        <h4 className="text-xs font-bold text-slate-900">
                          "{rev.title}"
                        </h4>
                      )}

                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {rev.comment}
                      </p>

                      {/* Customer Attached Media */}
                      {((rev.images && rev.images.length > 0) || (rev.videos && rev.videos.length > 0)) && (
                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-full block">
                            Attached Media ({((rev.images?.length || 0) + (rev.videos?.length || 0))})
                          </span>

                          {rev.videos?.map((v, vi) => (
                            <button
                              key={`v-${vi}`}
                              type="button"
                              onClick={() => setActiveMediaModal({ url: getMediaUrl(v), type: 'video', author })}
                              className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-300 bg-black cursor-pointer group hover:opacity-90 transition shadow-2xs"
                            >
                              <video src={getMediaUrl(v)} className="h-full w-full object-cover opacity-75" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="h-4 w-4 text-white fill-white" />
                              </div>
                              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-1 text-[7px] font-black text-rose-300">
                                VID
                              </span>
                            </button>
                          ))}

                          {rev.images?.map((im, imi) => (
                            <button
                              key={`im-${imi}`}
                              type="button"
                              onClick={() => setActiveMediaModal({ url: getMediaUrl(im), type: 'image', author })}
                              className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group hover:opacity-90 transition shadow-2xs"
                            >
                              <img src={getMediaUrl(im)} alt="" className="h-full w-full object-cover" />
                              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 text-[7px] font-black text-white">
                                IMG
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2.5 shrink-0 pt-2 md:pt-0">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        rev.isApproved !== false
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {rev.isApproved !== false ? 'Approved & Visible' : 'Hidden / Pending'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={actionLoadingId === rev._id}
                        onClick={() => handleToggleApprove(rev)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                          rev.isApproved !== false
                            ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                            : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={rev.isApproved !== false ? 'Hide from storefront' : 'Approve review'}
                      >
                        {rev.isApproved !== false ? (
                          <>
                            <EyeOff className="h-3 w-3" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3" />
                            <span>Approve</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setToDelete(rev)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete Customer Review?"
        message={`Are you sure you want to permanently delete the review by "${toDelete?.userName || toDelete?.user?.name || 'Customer'}"? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />

      {/* Media Lightbox Modal */}
      {activeMediaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onClick={() => setActiveMediaModal(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveMediaModal(null)}
              className="absolute -top-10 right-0 text-white/90 hover:text-white transition p-2 cursor-pointer flex items-center gap-1.5 text-xs font-bold bg-slate-900/90 rounded-full px-3 py-1 border border-white/20"
            >
              <span>Close</span>
              <X className="h-4 w-4" />
            </button>

            {activeMediaModal.type === 'video' ? (
              <video
                src={activeMediaModal.url}
                controls
                autoPlay
                className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl bg-black"
              />
            ) : (
              <img
                src={activeMediaModal.url}
                alt="Review Attachment"
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl bg-black/40"
              />
            )}

            {activeMediaModal.author && (
              <p className="mt-3 text-xs font-semibold text-white/90 bg-slate-900/80 px-3 py-1 rounded-full border border-white/10">
                Uploaded by {activeMediaModal.author}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
