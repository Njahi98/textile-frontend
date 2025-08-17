export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  avatar?:string
  firstName?:string;
  lastName?:string;
  phone?:string;
  status:string;
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
  logout: () => Promise<{ success: boolean; error?: string }>;
  getCurrentUser: () => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;