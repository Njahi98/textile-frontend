import { RouteObject } from "react-router-dom";
import DashboardLayout from "@/features/dashboard/pages/DashboardLayout";
import DashboardHome from "@/features/dashboard/pages/DashboardHome";

export const dashboardRoutes: RouteObject = {
  element: <DashboardLayout />,
  children: [
    {
      path: "dashboard",
      element: <DashboardHome />,
    },
    {
      path: "production-lines",
      children: [
        {
          index: true,
          element: <p>production main page</p>,
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
