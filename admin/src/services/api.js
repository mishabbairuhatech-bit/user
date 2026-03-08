import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Track refresh state to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

// Routes that should NOT trigger token refresh
const publicRoutes = [
  'auth/login',
  'auth/forgot-password',
  'auth/reset-password',
  'auth/mfa/verify',
  'auth/refresh',
  'auth/google/one-tap',
];

// Response interceptor — auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors for non-public routes that haven't been retried
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      publicRoutes.some((route) => (originalRequest.url || '').includes(route))
    ) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          originalRequest._retry = true;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      // Attempt to refresh the tokens
      await api.post('auth/refresh');

      // Refresh succeeded — retry all queued requests
      processQueue(null);

      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed — logout the user
      processQueue(refreshError);
      window.dispatchEvent(new Event('auth:expired'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
