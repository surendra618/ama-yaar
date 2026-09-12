import React from 'react';
import { TrendingUp } from 'lucide-react';

const TONES = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  purple: 'bg-purple-50 text-purple-600',
};

export default function StatCard({ icon: Icon, label, value, tone = 'indigo', trend = '+12%', subtext }) {
  const iconStyle = TONES[tone] || TONES.indigo;

  return (
    <div className="rounded-md bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconStyle}`}>
          <Icon className="h-5 w-5" />
        </div>

        {trend && (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
            <TrendingUp className="h-3 w-3 text-emerald-600" />
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>

      {subtext && (
        <p className="mt-3 text-[11px] font-medium text-slate-400 border-t border-slate-100 pt-2">
          {subtext}
        </p>
      )}
    </div>
  );
}
