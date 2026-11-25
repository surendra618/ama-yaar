import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { subscribeToToasts } from '../utils/toast';

const STYLE_MAP = {
  error: {
    container: 'bg-neutral-950 text-white border-rose-500/40 shadow-2xl',
    icon: <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />,
  },
  success: {
    container: 'bg-neutral-950 text-white border-emerald-500/40 shadow-2xl',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
  },
  warning: {
    container: 'bg-neutral-950 text-white border-amber-500/40 shadow-2xl',
    icon: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
  },
  info: {
    container: 'bg-neutral-950 text-white border-sky-500/40 shadow-2xl',
    icon: <Info className="h-4 w-4 text-sky-400 shrink-0" />,
  },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timers = new Map();

    const unsubscribe = subscribeToToasts((event) => {
      if (event.action === 'remove') {
        setToasts((prev) => prev.filter((t) => t.id !== event.id));
        const timer = timers.get(event.id);
        if (timer) {
          clearTimeout(timer);
          timers.delete(event.id);
        }
        return;
      }

      if (event.action === 'add' && event.toast) {
        const item = event.toast;
        setToasts((prev) => [...prev.slice(-3), item]);
        const timer = setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== item.id));
          timers.delete(item.id);
        }, item.duration);
        timers.set(item.id, timer);
      }
    });

    return () => {
      unsubscribe();
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 w-full max-w-md px-4 pointer-events-none"
    >
      {toasts.map((item) => {
        const style = STYLE_MAP[item.type] || STYLE_MAP.info;
        return (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-semibold backdrop-blur-md transition-all duration-200 ${style.container}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {style.icon}
              <span className="leading-snug break-words">{item.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== item.id))}
              className="rounded-md p-1 text-neutral-400 hover:bg-white/10 hover:text-white transition shrink-0 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
