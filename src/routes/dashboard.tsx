import { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import { lazy, Suspense } from "react";

const createLazyComponent = (factory: () => Promise<{ default: any }>) => {
  const LazyComponent = lazy(factory);
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent />
    </Suspense>
  );
};


const DashboardLayout = lazy(
  () => import("@/features/dashboard/pages/DashboardLayout")
);

export const dashboardRoutes: RouteObject = {
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: "dashboard",
      element: createLazyComponent(
        () => import("@/features/dashboard/pages/DashboardHome")
      ),
    },
    {
      path: "users", 
      element: createLazyComponent(() => import("@/features/users")),
    },
    {
      path: "chat",
      element: createLazyComponent(() => import("@/features/chats")),
    },
    {
      path: "workers",
      element: createLazyComponent(() => import("@/features/workers")),
    },
    {
      path: "production-lines",
      element: createLazyComponent(() => import("@/features/productionLines")),
    },
    {
      path: "assignments",
      children: [
        {
          path: "overview",
          element: createLazyComponent(() => import("@/features/assignements")),
        },
        {
          path: "calendar",
          element: createLazyComponent(
            () => import("@/features/assignements/assignment-calendar")
          ),
        },
      ],
    },
    {
      path: "products",
      element: createLazyComponent(() => import("@/features/products")),
    },
    {
      path: "performance",
      children: [
        {
          path: "overview",
          element: createLazyComponent(
            () => import("@/features/performanceRecords")
          ),
        },
        {
          path: "analytics",
          element: createLazyComponent(
            () =>
              import(
                "@/features/performanceRecords/performance-analytics-dashboard"
              )
          ),
        },
        {
          path: "ai-insights",
          element: createLazyComponent(
            () => import("@/features/performanceRecords/AIInsightsDashboard")
          ),
        },
      ],
    },
    {
      path: "settings",
      children: [
        {
          path: "account",
          element: createLazyComponent(
            () => import("@/features/settings/account/AccountSettings")
          ),
        },
      ],
    },
  ],
};