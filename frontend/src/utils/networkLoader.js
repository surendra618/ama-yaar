// Lightweight global network & navigation activity tracker.

let activeCount = 0;
const listeners = new Set();

function notify() {
  const isLoading = activeCount > 0;
  listeners.forEach((cb) => cb(isLoading, activeCount));
}

export function startLoading() {
  activeCount += 1;
  notify();
}

export function stopLoading() {
  activeCount = Math.max(0, activeCount - 1);
  notify();
}

export function subscribeLoading(cb) {
  listeners.add(cb);
  cb(activeCount > 0, activeCount);
  return () => listeners.delete(cb);
}
