import { Loader2 } from 'lucide-react';

export default function Loader({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 py-16 text-slate-400 ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
