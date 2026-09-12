import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { fetchReturnById, updateReturnStatus, clearCurrentReturn } from '../returnsSlice';
import StatusBadge from '../../../components/StatusBadge';
import { Select, Input, Textarea } from '../../../components/FormField';
import Loader from '../../../components/Loader';

const STATUS_OPTIONS = ['requested', 'approved', 'rejected', 'picked_up', 'verified', 'refunded'];

export default function ReturnDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { current: ret, updating } = useSelector((state) => state.returns);
  const [nextStatus, setNextStatus] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [adminComment, setAdminComment] = useState('');

  useEffect(() => {
    dispatch(fetchReturnById(id));
    return () => dispatch(clearCurrentReturn());
  }, [dispatch, id]);

  useEffect(() => {
    if (ret) {
      setNextStatus(ret.status);
      setRefundAmount(ret.refundAmount ?? '');
    }
  }, [ret]);

  if (!ret) return <Loader label="Loading return request…" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(
      updateReturnStatus({ id, status: nextStatus, refundAmount: Number(refundAmount) || 0, adminComment })
    );
    setAdminComment('');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button
        onClick={() => navigate('/returns')}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Returns
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Return Request</h1>
          <p className="text-sm text-slate-500">Submitted {new Date(ret.createdAt).toLocaleString()}</p>
        </div>
        <StatusBadge status={ret.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-slate-900">Customer</h3>
          <p className="text-sm text-slate-700">{ret.user?.name}</p>
          <p className="text-xs text-slate-500">{ret.user?.email}</p>
          <p className="text-xs text-slate-500">{ret.user?.phone}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-slate-900">Order</h3>
          <Link to={`/orders/${ret.order?._id}`} className="text-sm font-semibold text-indigo-600 hover:underline">
            {ret.order?.orderNumber || '—'}
          </Link>
          <p className="mt-1 text-xs text-slate-500">Total: ₹{ret.order?.total?.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Return Details</h3>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <p>
            <span className="text-slate-500">Reason: </span>
            <span className="font-medium capitalize text-slate-800">{ret.reason?.replace(/_/g, ' ')}</span>
          </p>
          <p>
            <span className="text-slate-500">Refund Amount: </span>
            <span className="font-medium text-slate-800">₹{(ret.refundAmount || 0).toLocaleString('en-IN')}</span>
          </p>
        </div>
        {ret.comment && (
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">"{ret.comment}"</div>
        )}
        {ret.images?.length > 0 && (
          <div className="mt-3 flex gap-2">
            {ret.images.map((img, i) => (
              <img key={i} src={img} alt={`Return evidence ${i + 1}`} className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-100" />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-slate-900">Update Return Status</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              placeholder="Refund amount (₹)"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
          </div>
          <Textarea
            rows={2}
            placeholder="Note for the customer…"
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
          />
          <button
            type="submit"
            disabled={updating}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {updating ? 'Updating…' : 'Update Status'}
          </button>
        </form>
      </div>
    </div>
  );
}
