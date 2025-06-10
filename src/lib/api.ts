import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL as string;

export const api = axios.create({
  baseURL: VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => config,
  (error: unknown) =>
    Promise.reject(error instanceof Error ? error : new Error(String(error)))
);

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 && !window.location.pathname.includes('/auth/')) {
        window.location.href = '/auth/login';
      }
      
      const errorMessage = error.response?.data?.message || error.message;
      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default api;
