// Lightweight event-driven toast notification utility for the storefront.

const listeners = new Set();
let lastToastKey = '';
let lastToastTime = 0;

function emit(type, message, options = {}) {
  if (!message) return null;
  const text = String(message).trim();
  if (!text) return null;

  const key = `${type}:${text}`;
  const now = Date.now();
  if (key === lastToastKey && now - lastToastTime < 1500) {
    return null;
  }
  lastToastKey = key;
  lastToastTime = now;

  const id = `toast_${now}_${Math.random().toString(36).slice(2, 7)}`;
  const payload = {
    id,
    type, // 'success' | 'error' | 'info' | 'warning'
    message: text,
    duration: options.duration ?? (type === 'error' ? 5000 : 3500),
  };
  listeners.forEach((cb) => cb({ action: 'add', toast: payload }));
  return id;
}

export const toast = {
  success: (msg, opts) => emit('success', msg, opts),
  error: (msg, opts) => emit('error', msg, opts),
  info: (msg, opts) => emit('info', msg, opts),
  warning: (msg, opts) => emit('warning', msg, opts),
  dismiss: (id) => listeners.forEach((cb) => cb({ action: 'remove', id })),
};

export function subscribeToToasts(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export default toast;
