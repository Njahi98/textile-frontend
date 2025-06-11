import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

function AuthLayout() {
  const location = useLocation();
  const [imagePosition, setImagePosition] = useState<'left' | 'right'>('right');

  useEffect(() => {
    setImagePosition(location.pathname === '/auth/register' ? 'left' : 'right');
  }, [location]);

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-5">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="relative">
          <div className={`absolute inset-y-0 transition-all duration-500 ease-in-out hidden md:block w-1/2
            ${imagePosition === 'left' ? 'left-0' : 'left-1/2'}`}>
            <div className="bg-muted min-h-[600px] w-full relative rounded-xl border py-6 shadow-sm">
              <img
                src="/illustration-dashboard.webp"
                alt="Dashboard illustration"
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
