import { RouteObject } from "react-router-dom";
import DashboardLayout from "@/features/dashboard/pages/DashboardLayout";
import DashboardHome from "@/features/dashboard/pages/DashboardHome";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Users from "@/features/users";
import Workers from "@/features/workers";
import ProductionLines from "@/features/productionLines";
import Assignments from "@/features/assignements";
import AssignmentsCalendar from "@/features/assignements/assignment-calendar";
import Products from "@/features/products";
import Performance from "@/features/performanceRecords";
import PerformanceAnalytics from "@/features/performanceRecords/performance-analytics-dashboard";
import AccountSettings from "../features/settings/account/AccountSettings";
import Chats from "@/features/chats";

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
      path:"chat",
      element:<Chats/>
    },
    {
      path: "workers",
      element: <Workers />,
    },
      {
        path: "production-lines",
        element: <ProductionLines />,
      },
      {
        path: "assignments",
        children: [
          {
            path: "overview",
            element: <Assignments />,
          },
          {
            path: "calendar",
            element: <AssignmentsCalendar />,
          },
        ],
      },
      {
        path: "products",
        element: <Products />,
      },
      {path: "performance",
           children: [
            {
              path:"overview",
              element: <Performance />,
            },
          {
            path: "analytics",
            element: <PerformanceAnalytics />,
          },]
      },{
        path: "settings",
        children:[
          {
            path: "account",
            element:<AccountSettings />
          }
        ]
      }
  ],
};
