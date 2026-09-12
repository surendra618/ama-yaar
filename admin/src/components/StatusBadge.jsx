const STYLES = {
  // order / return statuses
  placed: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  confirmed: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  processing: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  packed: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  shipped: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  out_for_delivery: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  returned: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  refunded: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  requested: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  picked_up: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  verified: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  // user statuses
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  blocked: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-600/20',
  // generic
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  failed: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export default function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase();
  const style = STYLES[key] || 'bg-slate-100 text-slate-600 ring-slate-600/20';
  const label = key.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold capitalize border ${style}`}
    >
      {label || 'unknown'}
    </span>
  );
}
