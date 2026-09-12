import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { fetchUserById, clearCurrentUser } from '../usersSlice';
import StatusBadge from '../../../components/StatusBadge';
import Loader from '../../../components/Loader';

export default function UserDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { current: user } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUserById(id));
    return () => dispatch(clearCurrentUser());
  }, [dispatch, id]);

  if (!user) return <Loader label="Loading user…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button
        onClick={() => navigate('/users')}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </button>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{user.name}</h1>
              <p className="text-sm text-slate-500">Customer since {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <StatusBadge status={user.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="h-4 w-4 text-slate-400" /> {user.email}
          </p>
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="h-4 w-4 text-slate-400" /> {user.phone || '—'}
          </p>
        </div>

        {user.addresses?.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              <MapPin className="h-4 w-4 text-indigo-500" /> Saved Addresses
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {user.addresses.map((a) => (
                <div key={a._id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">{a.fullName}</p>
                  <p>
                    {a.line1}, {a.city}, {a.state} - {a.pincode}
                  </p>
                  <p>{a.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <h3 className="border-b border-slate-100 p-5 text-sm font-bold text-slate-900">Recent Orders</h3>
        {!user.orders || user.orders.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-400">No orders placed yet</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {user.orders.map((o) => (
              <Link
                key={o._id}
                to={`/orders/${o._id}`}
                className="flex items-center justify-between gap-3 p-4 transition hover:bg-slate-50/60"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{o.orderNumber || `#${o._id.slice(-6)}`}</p>
                  <p className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">₹{o.total?.toLocaleString('en-IN')}</span>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
