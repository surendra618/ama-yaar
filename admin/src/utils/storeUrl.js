const sanitizeUrl = (url) => (url && typeof url === 'string' ? url.trim().replace(/\/+$/, '') : '');

/**
 * Resolves the customer storefront URL for both local development and production builds.
 */
export function getStoreUrl() {
  const envUrl = sanitizeUrl(import.meta.env.VITE_STORE_URL);
  if (envUrl) return envUrl;
  if (import.meta.env.PROD) return 'https://www.amayaar.in';
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:5173`;
  }
  return 'http://localhost:5173';
}

export const STORE_URL = getStoreUrl();
