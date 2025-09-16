export interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  avatarUrl?: string;     
  avatarPublicId?: string;  
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface ApiError {
  error: string;
  message: string;
}

// Auth store state interface
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Auth store actions interface
export interface AuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshToken: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  getCurrentUser: () => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setupAutoRefresh: () => void;
  clearAutoRefresh: () => void;
}

export type AuthStore = AuthState & AuthActions;

export interface GoogleLoginResponse {
  success: boolean;
  message: string;
  user: User;
}