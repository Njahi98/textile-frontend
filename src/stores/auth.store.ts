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
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
      set({
        error: errorMessage,
        isLoading: false,
        user: null,
        isAuthenticated: false,
      });
      return { success: false, error: errorMessage };
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
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
      set({
        error: errorMessage,
        isLoading: false,
        user: null,
        isAuthenticated: false,
      });
      return { success: false, error: errorMessage };
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
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during logout';
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
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
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get current user';
      set({
        user: null,
        isAuthenticated: false,
        error: errorMessage,
        isLoading: false,
        isInitialized: true,
      });
      return { success: false, error: errorMessage };
    }
  },

  requestPasswordReset: async (email: string) => {
    try {
      set({ isLoading: true, error: null });
      await authApi.requestPasswordReset(email);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request password reset';
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      await authApi.resetPassword(token, password);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },
})); 