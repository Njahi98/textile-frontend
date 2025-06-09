export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  avatar?:string
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
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;