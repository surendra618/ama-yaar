const RANGES = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

export default function ReportFilters({ value, onChange }) {
  return (
    <div className="flex gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
            value === r.value
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
