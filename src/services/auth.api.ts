import api from '@/lib/api';
import { AuthResponse, User } from '@/types/auth';

interface LogoutResponse {
  success: boolean;
  message: string;
}

interface UserResponse {
  success: boolean;
  user: User;
}

interface ResetResponse {
  success: boolean;
  message: string;
}

export const authApi = {
  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Register user
  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', userData);
    return response.data;
  },

  // Logout user
  async logout(): Promise<LogoutResponse> {
    const response = await api.post<LogoutResponse>('/api/auth/logout');
    return response.data;
  },

  // Get current user
  async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/api/auth/me');
    return response.data;
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<ResetResponse> {
    const response = await api.post<ResetResponse>('/api/auth/password-reset-request', {
      email,
    });
    return response.data;
  },

  // Reset password
  async resetPassword(token: string, password: string): Promise<ResetResponse> {
    const response = await api.post<ResetResponse>('/api/auth/password-reset', {
      token,
      password,
    });
    return response.data;
  },
};