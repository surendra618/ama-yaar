import api from '../lib/axios';

const FALLBACK_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
  'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
  'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&q=80',
  'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
  'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
  'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800&q=80',
];

export function getFallbackForName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % FALLBACK_PRODUCT_IMAGES.length;
  return FALLBACK_PRODUCT_IMAGES[index];
}

/**
 * Resolves media URLs dynamically based on active API origin.
 * If a relative path is an un-hosted /products/ placeholder, provides high-res fallback.
 */
export function getMediaUrl(path, fallbackName = '') {
  if (!path) return fallbackName ? getFallbackForName(fallbackName) : FALLBACK_PRODUCT_IMAGES[0];
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:') ||
    path.startsWith('/editorial-looks/') ||
    path.startsWith('/video/') ||
    path.startsWith('video/')
  ) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  // When path is a placeholder /products/... that doesn't exist on server
  if (path.startsWith('/products/') || path.startsWith('products/')) {
    const slug = path.replace(/^\/?products\//, '').replace(/\.[a-zA-Z0-9]+$/, '');
    return getFallbackForName(fallbackName || slug);
  }

  // Determine API origin from axios config or env
  const base =
    api.defaults.baseURL ||
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.MODE === 'production'
      ? 'https://ama-yaar.vercel.app/api/v1'
      : 'http://localhost:5005/api/v1');

  const origin = base.replace(/\/api\/v1\/?$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return origin ? `${origin}${cleanPath}` : cleanPath;
}

export default getMediaUrl;
