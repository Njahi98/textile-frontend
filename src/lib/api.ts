import axios, { AxiosResponse } from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL as string;

export const api = axios.create({
  baseURL: VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetcher = <T,>(url: string):Promise<T> => api.get(url).then((res:AxiosResponse<T> )=> res.data);

api.interceptors.request.use(
  (config) => config,
  (error: unknown) =>
    Promise.reject(error instanceof Error ? error : new Error(String(error)))
);

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      // Don't show errors for auth check endpoint
      if (error.config?.url?.includes('/auth/me')) {
        return Promise.reject(new Error(''));
      }

      if (error.response?.status === 401 && !window.location.pathname.includes('/auth/')) {
        window.location.href = '/auth/login';
      }
      //This gives TypeScript confidence that data.message exists safely
      const data = error.response?.data as { message?: string } | undefined;
      const errorMessage = data?.message ?? error.message;
      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);


export default api;
