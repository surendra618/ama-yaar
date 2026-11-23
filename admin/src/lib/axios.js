import axios from 'axios';

const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  return url
    .replace(/^-NoNewline\s*/i, '')
    .trim()
    .replace(/\/+$/, '');
};

const getApiBaseUrl = () => {
  const envUrl = sanitizeUrl(import.meta.env.VITE_API_BASE_URL);
  if (envUrl) return envUrl;
  if (import.meta.env.MODE === 'production') return 'https://ama-yaar-backend-dev.vercel.app/api/v1';
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:5000/api/v1`;
  }
  return 'http://localhost:5000/api/v1';
};

const defaultBaseUrl = getApiBaseUrl();

const api = axios.create({
  baseURL: defaultBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ay_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      localStorage.removeItem('ay_admin_token');
      localStorage.removeItem('ay_admin_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
