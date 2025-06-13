import { publicRoutes } from "./public";
import { dashboardRoutes } from "./dashboard";
import { RouteObject } from "react-router-dom";
import NotFoundError from "@/features/errors/NotFound";

export const routes: RouteObject[] = [
  ...publicRoutes,
  dashboardRoutes,
  {
    path: "*",
    element: <NotFoundError />
  }
];
