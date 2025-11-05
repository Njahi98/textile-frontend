import { useEffect, useRef, useState } from 'react';
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

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  disabled = false,
  onSuccess,
  onError 
}) => {
  const { googleLogin, isLoading } = useAuthStore();
  const { t } = useTranslation('auth');
  const buttonRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (disabled || !buttonRef.current) return;

    const timer = setTimeout(() => {
      const init = () => {
        if (!window.google || !buttonRef.current || !containerRef.current) return;

        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
          callback: async (response: GoogleCredentialResponse) => {
            try {
              if (!response?.credential) {
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
            } catch (error) {
              const msg = error instanceof Error ? error.message : t('googleAuth.errors.loginFailed');
              toast.error(msg);
              onError?.();
            }
          },
          ux_mode: 'popup',
          error_callback: (error: unknown) => {
            toast.error(getGoogleAuthErrorMessage(error as Error));
          }
        });

        window.google.accounts.id.renderButton(buttonRef.current!, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: containerRef.current!.offsetWidth
        });

        setTimeout(() => setReady(true), 300);
      };

      if (window.google) {
        init();
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = init;
        document.head.appendChild(script);
      }
    }, 600);

    return () => clearTimeout(timer);
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
      className="w-full relative overflow-hidden"
      style={{ 
        opacity: disabled || isLoading ? 0.6 : 1,
        pointerEvents: disabled || isLoading ? 'none' : 'auto',
        height: '44px'
      }}
    >
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      )}
      
      <div 
        ref={buttonRef}
        className="w-full h-full flex justify-center items-center"
        style={{ 
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.3s'
        }}
      />
    </div>
  );
};

export default GoogleLoginButton;