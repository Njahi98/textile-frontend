import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useLocation } from 'react-router-dom';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/auth/reset-password'];

const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/auth/'));
};

export const useAuthInit = () => {
  const { getCurrentUser, isInitialized } = useAuthStore();
  const location = useLocation();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only run once
    if (hasInitialized.current || isInitialized) return;
    
    // Skip auth check on public routes
    if (isPublicRoute(location.pathname)) {
      useAuthStore.setState({ isInitialized: true });
      hasInitialized.current = true;
      return;
    }

    // Protected route - check authentication
    void getCurrentUser().finally(() => {
      hasInitialized.current = true;
    });
  }, [getCurrentUser, isInitialized, location.pathname]);
};

// Socket authentication helper
export const useSocketAuth = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  return {
    isAuthenticated,
    user,
    // Cookies are sent automatically with socket connection
    getSocketAuthToken: () => isAuthenticated ? 'cookie-auth' : null,
  };
};