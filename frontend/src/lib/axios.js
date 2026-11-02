import axios from 'axios';

const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://ama-yaar.vercel.app/api/v1' 
    : 'http://localhost:5000/api/v1');

const api = axios.create({
  baseURL: defaultBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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
          } catch (_) {}
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

    return Promise.reject(error);
  }
);

export default api;
