import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

export const useAuthInit = () => {
  const { getCurrentUser, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      getCurrentUser().catch(() => {
        // Silently fail - don't show errors for auth check
      });
    }
  }, [getCurrentUser, isInitialized]);
};