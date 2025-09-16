import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { getGoogleAuthErrorMessage } from '@/lib/googleAuthErrors';

interface GoogleLoginButtonProps {
  text?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: () => void;
}

declare global {
  interface Window {
    google: any;
    handleCredentialResponse: (response: any) => void;
  }
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  text = 'Continue with Google',
  disabled = false,
  onSuccess,
  onError 
}) => {
  const { googleLogin, isLoading } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || disabled) return;

    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        // Define the callback globally
        window.handleCredentialResponse = async (response: any) => {
          try {
            const result = await googleLogin(response.credential);
            if (result.success) {
              toast.success('Google login successful!');
              onSuccess?.();
            } else {
              toast.error(result.message || 'Google login failed. Please try again.');
              onError?.();
            }
          } catch (error) {
            console.error('Google login failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Google login failed. Please try again.';
            toast.error(errorMessage);
            onError?.();
          }
        };

        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: window.handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          // Handle initialization errors
          error_callback: (error: any) => {
            console.error('Google Sign-In initialization error:', error);
            const errorMessage = getGoogleAuthErrorMessage(error);
            toast.error(errorMessage);
          }
        });

        initialized.current = true;
      }
    };

    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }

    return () => {
      // Cleanup
      if (window.handleCredentialResponse) {
        delete window.handleCredentialResponse;
      }
    };
  }, [disabled, googleLogin, onSuccess, onError]);

  const handleGoogleLogin = () => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      toast.error('Google Sign-In is not configured. Please contact support.');
      return;
    }

    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            const errorMessage = getGoogleAuthErrorMessage(notification);
            toast.error(errorMessage);
          } else if (notification.isSkippedMoment()) {
            toast.info('Google sign-in was dismissed.');
          }
        });
      } catch (error) {
        console.error('Google prompt error:', error);
        const errorMessage = getGoogleAuthErrorMessage(error);
        toast.error(errorMessage);
      }
    } else {
      toast.error('Google Sign-In is not available. Please refresh the page and try again.');
    }
  };

  return (
    <Button 
      variant="outline" 
      className="w-full hover:cursor-pointer"
      type="button"
      disabled={disabled || isLoading}
      onClick={handleGoogleLogin}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
        <path
          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
          fill="currentColor"
        />
      </svg>
      {text}
    </Button>
  );
};

export default GoogleLoginButton;