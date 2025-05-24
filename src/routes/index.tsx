import { publicRoutes } from "./public";
import { dashboardRoutes } from "./dashboard";
import { RouteObject } from "react-router-dom";

export const routes: RouteObject[] = [
  ...publicRoutes,
  dashboardRoutes,
];
