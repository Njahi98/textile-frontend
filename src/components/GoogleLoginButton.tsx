import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { getGoogleAuthErrorMessage } from '@/lib/googleAuthErrors';
import { useTranslation } from 'react-i18next';

interface GoogleLoginButtonProps {
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: () => void;
}

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccounts {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      auto_select?: boolean;
      cancel_on_tap_outside?: boolean;
      error_callback?: (error: unknown) => void;
      ux_mode?: 'popup' | 'redirect';
    }) => void;
    renderButton: (element: HTMLElement, config: {
      theme: 'outline' | 'filled_blue' | 'filled_black';
      size: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      width?: number;
      type?: 'standard' | 'icon';
    }) => void;
  };
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
    handleCredentialResponse?: (response: GoogleCredentialResponse) => void;
  }
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  disabled = false,
  onSuccess,
  onError 
}) => {
  const { googleLogin, isLoading } = useAuthStore();
  const { t } = useTranslation('auth');
  const initialized = useRef(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialized.current || disabled || !buttonRef.current) return;

    const initializeGoogleSignIn = () => {
      if (window.google?.accounts && buttonRef.current && containerRef.current) {
        // Define the callback globally
        window.handleCredentialResponse = (response: GoogleCredentialResponse) => {
          const handleResponse = async () => {
            try {
              if (!response?.credential) {
                console.error('No credential received from Google');
                toast.error(t('googleAuth.errors.loginFailed'));
                onError?.();
                return;
              }

              const result = await googleLogin(response.credential);
              if (result.success) {
                toast.success(t('googleAuth.errors.loginSuccessful'));
                onSuccess?.();
              } else {
                toast.error(result.message ?? t('googleAuth.errors.loginFailed'));
                onError?.();
              }
            } catch (error: unknown) {
              console.error('Google login failed:', error);
              const errorMessage = error instanceof Error ? error.message : t('googleAuth.errors.loginFailed');
              toast.error(errorMessage);
              onError?.();
            }
          };
          
          void handleResponse();
        };

        // Initialize with popup mode
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
          callback: window.handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
          error_callback: (error: unknown) => {
            console.error('Google Sign-In initialization error:', error);
            const errorMessage = getGoogleAuthErrorMessage(error as Error);
            toast.error(errorMessage);
          }
        });

        // Get the container width to set button width
        const containerWidth = containerRef.current.offsetWidth;

        // Render the Google Sign-In button
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: containerWidth, // Use pixel width instead of percentage
          type: 'standard'
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
  }, [disabled, googleLogin, onSuccess, onError, t]);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <div className="w-full p-3 border border-gray-300 rounded-md text-center text-gray-500">
        Google Sign-In Not Configured
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full"
      style={{ 
        opacity: disabled || isLoading ? 0.6 : 1,
        pointerEvents: disabled || isLoading ? 'none' : 'auto'
      }}
    >
      <div 
        ref={buttonRef}
        className="w-full flex justify-center"
      />
    </div>
  );
};

export default GoogleLoginButton;