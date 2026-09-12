export default function FormField({ label, error, hint, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="text-[11px] text-slate-400">{hint}</span>}
      {error && <span className="text-[11px] font-medium text-rose-600">{error}</span>}
    </div>
  );
}

const baseInput =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

export function Input(props) {
  return <input {...props} className={`${baseInput} ${props.className || ''}`} />;
}

export function Textarea(props) {
  return <textarea {...props} className={`${baseInput} ${props.className || ''}`} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${baseInput} ${props.className || ''}`}>
      {children}
    </select>
  );
}
