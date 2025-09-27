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

// Auto-refresh mechanism
let refreshTimeoutId: NodeJS.Timeout | null = null;
const REFRESH_BUFFER_TIME = 2 * 60 * 1000; // 2 minutes before expiry
const ACCESS_TOKEN_DURATION = 15 * 60 * 1000; // 15 minutes

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  clearError: () => set({ error: null }),

  // Auto-refresh setup
  setupAutoRefresh: () => {
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
    }
    
    refreshTimeoutId = setTimeout(async () => {
      const state = get();
      if (state.isAuthenticated) {
        await get().refreshToken();
      }
    }, ACCESS_TOKEN_DURATION - REFRESH_BUFFER_TIME);
  },

  clearAutoRefresh: () => {
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
      refreshTimeoutId = null;
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.login(email, password);
      set({
        user: response.user ?? null,
        isAuthenticated: !!response.user,
        isLoading: false,
      });
      
      // Setup auto-refresh after successful login
      get().setupAutoRefresh();
      
      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
      isAxiosError<{ error?: string }>(error)
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
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.register(userData);
      set({
        user: response.user ?? null,
        isAuthenticated: !!response.user,
        isLoading: false,
      });
      
      // Setup auto-refresh after successful registration
      get().setupAutoRefresh();
      
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

  refreshToken: async () => {
    try {
      const response = await authApi.refreshToken();
      set({
        user: response.user ?? null,
        isAuthenticated: !!response.user,
        error: null,
      });
      
      // Setup next auto-refresh
      get().setupAutoRefresh();
      
      return { success: true };
    } catch (error) {
      // Check if this is a silent error (from our interceptor)
      const isSilentError = error instanceof Error && error.name === 'SilentError';
      
      // Refresh failed - clear auth state
      get().clearAutoRefresh();
      set({
        user: null,
        isAuthenticated: false,
        error: null, // Don't show error for failed refresh
        isInitialized: true,
      });
      
      // Only redirect if it's not a silent error and not on auth pages
      if (!isSilentError && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/auth/') && currentPath !== '/') {
          window.location.href = '/auth/login';
        }
      }
      
      return { success: false };
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      get().clearAutoRefresh();
      await authApi.logout();
      set({
        ...initialState,
        isInitialized: true,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      // Even if logout fails, clear local state
      get().clearAutoRefresh();
      set({
        ...initialState,
        isInitialized: true,
        isLoading: false,
      });
      return { success: true }; // Always return success for logout
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
      
      // Setup auto-refresh for existing session
      get().setupAutoRefresh();
      
      return { success: true };
    } catch (error) {
      // Check if this is a silent error (from our interceptor)
      const isSilentError = error instanceof Error && error.name === 'SilentError';
      
      // If getCurrentUser fails and it's not a silent error, try to refresh token
      if (!isSilentError) {
        const refreshResult = await get().refreshToken();
        if (refreshResult.success) {
          return { success: true };
        }
      }
      
      // Mark as initialized without showing errors
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
    } else {
      const errorMessage = response.message || 'Google login failed';
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      return response;
    }
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