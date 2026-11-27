import axios from 'axios';
import toast from '../utils/toast';
import { startLoading, stopLoading } from '../utils/networkLoader';

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
  if (!config.skipLoader) {
    startLoading();
  }
  const token = localStorage.getItem('ay_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (!response.config?.skipLoader && !response.config?._loaderStopped) {
      if (response.config) response.config._loaderStopped = true;
      stopLoading();
    }
    return response;
  },
  async (error) => {
    if (error.config && !error.config.skipLoader && !error.config._loaderStopped) {
      error.config._loaderStopped = true;
      stopLoading();
    }
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const reqMethod = (originalRequest?.method || 'get').toLowerCase();

    // Retry once on transient network / serverless cold-start errors for GET requests
    if (!error.response && error.code === 'ERR_NETWORK' && originalRequest && !originalRequest._netRetry && reqMethod === 'get') {
      originalRequest._netRetry = true;
      await new Promise((r) => setTimeout(r, 400));
      return api(originalRequest);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const isAuthUrl =
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh-token');

      if (isAuthUrl) {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem('ay_refresh_token');
      if (!refreshToken) {
        const storedUser = localStorage.getItem('ay_user');
        if (storedUser) {
          try {
            const u = JSON.parse(storedUser);
            const { data } = await axios.post(`${defaultBaseUrl}/auth/quick-login`, {
              email: u.email,
              phone: u.phone,
              name: u.name,
            });
            if (data?.data?.accessToken) {
              const newToken = data.data.accessToken;
              localStorage.setItem('ay_access_token', newToken);
              if (data.data.refreshToken) {
                localStorage.setItem('ay_refresh_token', data.data.refreshToken);
              }
              api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          } catch (_) { }
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const baseUrl = defaultBaseUrl;
        const { data } = await axios.post(`${baseUrl}/auth/refresh-token`, { token: refreshToken });

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        localStorage.setItem('ay_access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('ay_refresh_token', newRefreshToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('ay_access_token');
        localStorage.removeItem('ay_refresh_token');
        localStorage.removeItem('ay_user');
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    if (!axios.isCancel(error) && !error.config?.skipErrorToast) {
      const status = error.response?.status;
      const method = (error.config?.method || 'get').toLowerCase();
      const url = error.config?.url || '';
      const isSilentGet401 = method === 'get' && status === 401;
      const isSilentAuthCheck = url.includes('/auth/me') || url.includes('/auth/refresh-token');

      if (!isSilentGet401 && !isSilentAuthCheck) {
        const errMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          (!error.response && error.code === 'ERR_NETWORK'
            ? 'Unable to reach server. Please check your connection and try again.'
            : error.message) ||
          'Something went wrong. Please try again.';
        toast.error(errMessage);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
