import { create } from 'zustand';
import { AuthState, AuthStore } from '@/types/auth';
import { authApi } from '@/services/auth.api';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  isInitialized: false,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  clearError: () => set({ error: null }),

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.login(email, password);
      set({
        user: response.user ?? null,
        isAuthenticated: !!response.user,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred during login',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.register(userData);
      set({
        user: response.user ?? null,
        isAuthenticated: !!response.user,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred during registration',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await authApi.logout();
      set({
        ...initialState,
        isInitialized: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred during logout',
        isLoading: false,
      });
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.getCurrentUser();
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Failed to get current user',
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  requestPasswordReset: async (email: string) => {
    try {
      set({ isLoading: true, error: null });
      await authApi.requestPasswordReset(email);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to request password reset',
        isLoading: false,
      });
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      await authApi.resetPassword(token, password);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reset password',
        isLoading: false,
      });
      throw error;
    }
  },
})); 