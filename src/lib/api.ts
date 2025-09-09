import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL as string;

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token?: string) => void;
  reject: (error: any) => void;
}> = [];

// Process failed queue after refresh
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token || '');
    }
  });
  
  failedQueue = [];
};

export const api = axios.create({
  baseURL: VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetcher = <T,>(url: string): Promise<T> => api.get(url).then((res: AxiosResponse<T>) => res.data);

api.interceptors.request.use(
  (config) => config,
  (error: unknown) =>
    Promise.reject(error instanceof Error ? error : new Error(String(error)))
);

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Check if error is 401 and we should attempt token refresh
      if (
        error.response?.status === 401 && 
        originalRequest && 
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/refresh') &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/register') &&
        !originalRequest.url?.includes('/auth/password-reset') &&
        !originalRequest.url?.includes('/auth/me') // Don't refresh on me endpoint
      ) {
        // If already refreshing, queue the request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh token
          await api.post('/api/auth/refresh');
          
          processQueue(null, 'refreshed');
          isRefreshing = false;
          
          // Retry original request
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          
          // Clear any auth state and redirect only if not on public pages
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
            
            const currentPath = window.location.pathname;
            // Only redirect if not on public pages (home, auth pages)
            if (!currentPath.startsWith('/auth/') && currentPath !== '/') {
              window.location.href = '/auth/login';
            }
          }
          
          return Promise.reject(refreshError);
        }
      }

      // Don't show errors for auth check endpoint
      if (error.config?.url?.includes('/auth/me')) {
        return Promise.reject(new Error(''));
      }

      if (error.response?.status === 401 && !window.location.pathname.includes('/auth/') && window.location.pathname !== '/') {
        window.location.href = '/auth/login';
      }

      // This gives TypeScript confidence that data.message exists safely
      const data = error.response?.data as { message?: string } | undefined;
      const errorMessage = data?.message ?? error.message;
      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default api;