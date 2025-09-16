import api from "@/lib/api";
import { AuthResponse, GoogleLoginResponse, User } from "@/types/auth";

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

interface RefreshResponse {
  success: boolean;
  message: string;
  user: User;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/api/auth/register",
      userData
    );
    return response.data;
  },

  async refreshToken(): Promise<RefreshResponse> {
    const response = await api.post<RefreshResponse>("/api/auth/refresh");
    return response.data;
  },

  async logout(): Promise<LogoutResponse> {
    const response = await api.post<LogoutResponse>("/api/auth/logout");
    return response.data;
  },

  async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get<UserResponse>("/api/auth/me");
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<ResetResponse> {
    const response = await api.post<ResetResponse>(
      "/api/auth/password-reset-request",
      {
        email,
      }
    );
    return response.data;
  },

  async resetPassword(token: string, password: string): Promise<ResetResponse> {
    const response = await api.post<ResetResponse>("/api/auth/password-reset", {
      token,
      password,
    });
    return response.data;
  },

  async googleLogin(credential: string): Promise<GoogleLoginResponse> {
    const response = await api.post<GoogleLoginResponse>(
      "/api/auth/google-login",
      {
        credential,
      }
    );
    return response.data;
  },
};
