import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useLocation } from 'react-router-dom';


export const useAuthInit = () => {
  const { getCurrentUser, isInitialized, setupAutoRefresh, clearAutoRefresh, isAuthenticated } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Skip auth check if on auth pages (login, register, reset password)
    const isOnAuthPage = location.pathname.startsWith('/auth/') || 
                        location.pathname === '/login' || 
                        location.pathname === '/register';
    
    if (!isInitialized && !isOnAuthPage) {
      getCurrentUser().catch(() => {
        // Silently fail - don't show errors for auth check
      });
    } else if (isOnAuthPage && !isInitialized) {
      // If on auth page and not initialized, mark as initialized without checking auth
      useAuthStore.setState({ isInitialized: true });
    }
  }, [getCurrentUser, isInitialized, location.pathname]);

  // Setup auto-refresh when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      setupAutoRefresh();
    } else {
      clearAutoRefresh();
    }

    // Cleanup on unmount
    return () => clearAutoRefresh();
  }, [isAuthenticated, isInitialized, setupAutoRefresh, clearAutoRefresh]);
};

// Additional hook for socket authentication
export const useSocketAuth = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  // Get auth token for socket connection (uses cookies)
  const getSocketAuthToken = () => {
    return isAuthenticated ? 'cookie-auth' : null;
  };

  return {
    isAuthenticated,
    user,
    getSocketAuthToken,
  };
};