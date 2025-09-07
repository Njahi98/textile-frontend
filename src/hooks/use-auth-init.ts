import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';


export const useAuthInit = () => {
  const { getCurrentUser, isInitialized, setupAutoRefresh, clearAutoRefresh, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      getCurrentUser().catch(() => {
        // Silently fail - don't show errors for auth check
      });
    }
  }, [getCurrentUser, isInitialized]);

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