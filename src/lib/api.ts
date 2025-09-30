import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import i18n from './i18n';
import Cookies from 'js-cookie';

const VITE_API_URL = import.meta.env.VITE_API_URL as string;

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;


export const api = axios.create({
  baseURL: VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetcher = <T,>(url: string): Promise<T> => 
  api.get(url).then((res: AxiosResponse<T>) => res.data);

// Add language header and CSRF token to all requests
api.interceptors.request.use(
  (config) => {
    // Add language header
    const lng = i18n.language || localStorage.getItem('preferred-language') || 'en';
    config.headers['Accept-Language'] = lng;

    // Add CSRF token for non-GET requests
    if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      const csrfToken = Cookies.get('XSRF-TOKEN');
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401 (same as before)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    const noRetryEndpoints = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/password-reset', '/auth/me'];
    const shouldNotRetry = noRetryEndpoints.some(endpoint => originalRequest?.url?.includes(endpoint));
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !shouldNotRetry) {
      originalRequest._retry = true;

      if (isRefreshing && refreshPromise) {
        await refreshPromise;
        return api(originalRequest);
      }

      isRefreshing = true;
      refreshPromise = api.post('/api/auth/refresh')
        .then(() => {
          isRefreshing = false;
          refreshPromise = null;
        })
        .catch(() => {
          isRefreshing = false;
          refreshPromise = null;
          handleAuthFailure();
          throw error;
        });

      await refreshPromise;
      return api(originalRequest);
    }

    // Silent fail for auth check endpoints
    if (originalRequest?.url?.includes('/auth/me') || originalRequest?.url?.includes('/auth/refresh')) {
      return Promise.reject({ silent: true });
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      return Promise.reject(error);
    }

    // Handle CSRF errors specifically
    if (error.response?.status === 403 && error.response?.data?.error === 'CSRF_TOKEN_INVALID') {
      // CSRF token might be missing/expired - could refresh page or show error
      console.error('CSRF token validation failed');
      return Promise.reject(new Error('Security token expired. Please refresh the page.'));
    }

    const errorMessage = error.response?.data?.message || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

function handleAuthFailure() {
  localStorage.removeItem('auth-storage');
  
  const isPublicRoute = window.location.pathname === '/' || 
                       window.location.pathname.startsWith('/auth/');
  
  if (!isPublicRoute) {
    window.location.href = '/auth/login';
  }
}

export default api;