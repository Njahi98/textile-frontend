import { RouteObject } from "react-router-dom";
import AuthLayout from "@/features/auth/pages/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { ResetPassword } from "@/features/auth/components/ResetPassword";
import AppLayout from "@/layouts/AppLayout";
import Home from "@/features/main";

export const publicRoutes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home/>,
      },
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <LoginForm />,
          },
          {
            path: "register",
            element: <RegisterForm />,
          },
          {
            path: "reset-password",
            element: <ResetPassword />,
          },
        ],
      },
    ],
  },
];
