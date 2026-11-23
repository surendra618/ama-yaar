import api from '../lib/axios';

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
  if (
    path.startsWith('/model') ||
    path.startsWith('model') ||
    path.startsWith('/editorial-looks/') ||
    path.startsWith('editorial-looks/') ||
    path.startsWith('/video/') ||
    path.startsWith('video/') ||
    path.startsWith('/home img/') ||
    path.startsWith('home img/') ||
    path.startsWith('/nocta-stage/') ||
    path.startsWith('nocta-stage/') ||
    path.startsWith('/insta-banner') ||
    path.startsWith('insta-banner')
  ) {
    return path.startsWith('/') ? path : `/${path}`;
  }

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

