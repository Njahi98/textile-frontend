import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import i18n from './i18n';

const VITE_API_URL = import.meta.env.VITE_API_URL as string;

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

interface SilentError {
  silent: true;
}

export const api = axios.create({
  baseURL: VITE_API_URL,
  //google gemini sometimes takes too long to generate a result so i added some timeout delay
  timeout: 30000, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetcher = <T,>(url: string): Promise<T> => 
  api.get(url).then((res: AxiosResponse<T>) => res.data);

api.interceptors.request.use(
  (config) => {
    const lng = i18n.language || localStorage.getItem('preferred-language') || 'en';
    config.headers['Accept-Language'] = lng;
    return config;
  },
  (error: Error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error instanceof Error ? error : new Error('Unknown error'));
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

    if (originalRequest?.url?.includes('/auth/me') || originalRequest?.url?.includes('/auth/refresh')) {
      const silentError: SilentError = { silent: true };
      return Promise.reject(silentError);
    }

    if (error.response?.status === 429) {
      return Promise.reject(error);
    }

    const errorData = error.response?.data as { message?: string } | undefined;
    const errorMessage = errorData?.message || error.message || 'An unknown error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

function handleAuthFailure(): void {
  const isPublicRoute = window.location.pathname === '/' || 
                       window.location.pathname.startsWith('/auth/');
  
  if (!isPublicRoute) {
    window.location.href = '/auth/login';
  }
}

export default api;