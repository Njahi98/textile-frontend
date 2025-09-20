import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar';

export function NavigationProgress() {
  const ref = useRef<LoadingBarRef>(null);
  const location = useLocation();

  useEffect(() => {
    // Start the loading bar when location changes (simulating navigation start)
    ref.current?.continuousStart();

    // Complete the loading bar after a short delay to simulate navigation completion
    const timer = setTimeout(() => {
      ref.current?.complete();
    }, 300);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <LoadingBar
      color="var(--muted-foreground)"
      ref={ref}
      shadow={true}
      height={2}
    />
  );
}