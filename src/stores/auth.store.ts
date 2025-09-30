import { create } from 'zustand';
import { AuthState, AuthStore } from '@/types/auth';
import { authApi } from '@/services/auth.api';
import { isAxiosError } from 'axios';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  isInitialized: false,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  clearError: () => set({ error: null }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.login(email, password);
      set({
        user: response.user ?? null,
        isAuthenticated: !!response.user,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error ?? error.message
        : error instanceof Error
          ? error.message
          : "An error occurred during login";

      set({
        error: errorMessage,
        isLoading: false,
        user: null,
        isAuthenticated: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  register: async (userData: { username: string; email: string; password: string }) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.register(userData);
      set({
        user: response.user ?? null,
        isAuthenticated: !!response.user,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred during registration';
      
      set({
        error: errorMessage,
        isLoading: false,
        user: null,
        isAuthenticated: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  refreshToken: async () => {
    try {
      const response = await authApi.refreshToken();
      set({
        user: response.user ?? null,
        isAuthenticated: !!response.user,
        error: null,
      });
      return { success: true };
    } catch (error: any) {
      // Silent error from interceptor - just mark initialized
      if (error?.silent) {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isInitialized: true,
        });
        return { success: false };
      }

      // Real error - clear auth and potentially redirect
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isInitialized: true,
      });
      return { success: false };
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await authApi.logout();
    } catch (error) {
      // Always clear local state on logout, even if API fails
    }
    
    set({
      ...initialState,
      isInitialized: true,
      isLoading: false,
    });
    return { success: true };
  },

  getCurrentUser: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.getCurrentUser();
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
      return { success: true };
    } catch (error: any) {
      // Silent error - try refresh
      if (error?.silent) {
        const refreshResult = await get().refreshToken();
        if (refreshResult.success) {
          return { success: true };
        }
      }
      
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
        isInitialized: true,
      });
      return { success: false };
    }
  },

  requestPasswordReset: async (email: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await authApi.requestPasswordReset(email);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to request password reset';
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  resetPassword: async (token: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await authApi.resetPassword(token, password);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to reset password';
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  googleLogin: async (credential: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.googleLogin(credential);
      
      if (response.success) {
        set({ 
          user: response.user, 
          isAuthenticated: true, 
          isLoading: false, 
          error: null,
          isInitialized: true
        });
        return response;
      }
      
      const errorMessage = response.message || 'Google login failed';
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      return response;
    } catch (error) {
      let errorMessage = 'Google login failed';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid token')) {
          errorMessage = 'Invalid Google token. Please try signing in again.';
        } else if (error.message.includes('Account')) {
          errorMessage = error.message;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      throw new Error(errorMessage);
    }
  },
}));