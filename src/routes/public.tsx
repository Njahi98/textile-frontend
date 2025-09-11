import { RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

const createLazyComponent = (factory: () => Promise<{ default: any }>) => {
  const LazyComponent = lazy(factory);
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent />
    </Suspense>
  );
};

const AppLayout = lazy(() => import("@/layouts/AppLayout"));
const AuthLayout = lazy(() => import("@/features/auth/pages/AuthLayout"));

export const publicRoutes: RouteObject[] = [
  {
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <AppLayout />
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: createLazyComponent(() => import("@/features/landingPage/Home")),
      },
      {
        path: "auth",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AuthLayout />
          </Suspense>
        ),
        children: [
          {
            path: "login",
            element: createLazyComponent(() => import("@/features/auth/components/LoginForm")),
          },
          {
            path: "register",
            element: createLazyComponent(() => import("@/features/auth/components/RegisterForm")),
          },
          {
            path: "reset-password",
            element: createLazyComponent(() => import("@/features/auth/components/ResetPassword")),
          },
        ],
      },
    ],
  },
];