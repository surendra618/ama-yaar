import { Inbox } from 'lucide-react';
import Loader from './Loader';

/**
 * Generic admin table.
 * columns: [{ key, header, render?(row), className? }]
 * rows: array of records (each should have an `_id`)
 */
export default function DataTable({ columns, rows, loading, emptyLabel = 'No records found', onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length}>
                <Loader />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                  <Inbox className="h-8 w-8" />
                  <span className="text-sm font-medium">{emptyLabel}</span>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row._id || row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition hover:bg-slate-50/80 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 align-middle text-slate-700 ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
