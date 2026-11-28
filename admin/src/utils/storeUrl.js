const sanitizeUrl = (url) => (url && typeof url === 'string' ? url.trim().replace(/\/+$/, '') : '');

/**
 * Resolves the live customer storefront URL for "Live Store" / "Store" links.
 */
export function getStoreUrl() {
  const envUrl = sanitizeUrl(import.meta.env.VITE_STORE_URL);
  if (envUrl) return envUrl;
  return 'https://www.amayaar.in';
}

export const STORE_URL = getStoreUrl();
