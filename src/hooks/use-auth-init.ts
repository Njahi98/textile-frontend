import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

export const useAuthInit = () => {
  const { getCurrentUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Only try to get current user if we think we're authenticated
    // (based on persisted state) but don't have user data
    if (isAuthenticated) {
      getCurrentUser().catch(() => {
        // If getCurrentUser fails, it will clear the auth state
        console.log('Failed to get current user, clearing auth state');
      });
    }
  }, [getCurrentUser, isAuthenticated]);
};