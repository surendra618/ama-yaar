import api from '../lib/axios';

/**
 * Resolves media URLs (e.g. /uploads/image.jpg) dynamically based on active API origin.
 * Prevents broken localhost:5000 calls on live production deployments.
 */
export function getMediaUrl(path) {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Determine API origin from axios config or env
  const base =
    api.defaults.baseURL ||
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.MODE === 'production'
      ? 'https://ama-yaar.vercel.app/api/v1'
      : 'http://localhost:5000/api/v1');

  const origin = base.replace(/\/api\/v1\/?$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return origin ? `${origin}${cleanPath}` : cleanPath;
}

export default getMediaUrl;
