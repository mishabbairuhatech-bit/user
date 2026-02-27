import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only fire expired event for authenticated API calls (not login/public routes)
      const url = error.config?.url || '';
      const publicRoutes = ['auth/login', 'auth/forgot-password', 'auth/reset-password', 'auth/mfa/verify'];
      const isPublicRoute = publicRoutes.some((route) => url.includes(route));

      if (!isPublicRoute) {
        window.dispatchEvent(new Event('auth:expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
