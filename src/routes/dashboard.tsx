import { RouteObject } from "react-router-dom";
import DashboardLayout from "@/features/dashboard/pages/DashboardLayout";
import DashboardHome from "@/features/dashboard/pages/DashboardHome";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Users from "@/features/users";
import Workers from "@/features/workers";
import ProductionLines from "@/features/productionLines";
export const dashboardRoutes: RouteObject = {
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: "dashboard",
      element: <DashboardHome />,
    },
    {
      path: "users",
      element: <Users />,
    },
    {
      path: "workers",
      children: [{ index: true, element: <Workers /> }],
    },
    {
      path: "production-lines",
      children: [
        {
          index: true,
          element: <ProductionLines />,
        },
        {
          path: "assignment",
          element: <p>production assignment page</p>,
        },
        {
          path: "analytics",
          element: <p>production analytics page</p>,
        },
      ],
    },
  ],
};
