import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-neutral-200/60 bg-white shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black shrink-0">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-black uppercase tracking-wide">Notifications</h2>
            <p className="text-[12px] text-neutral-500 font-medium">Your recent alerts and updates</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Bell className="h-7 w-7 text-neutral-400" />
          </div>
        </div>
        <p className="text-sm font-bold text-neutral-700">No notifications yet</p>
        <p className="text-xs text-neutral-400 font-medium mt-1">Order updates and alerts will appear here</p>
      </div>
    </div>
  );
}
