import { DashboardStats, ProductionMetric, WorkerPerformance, RecentActivities, ProductionTrends } from "@/services/dashboard.api";

export interface StatsResponse {
  success: boolean;
  stats: DashboardStats;
}

export interface MetricsResponse {
  success: boolean;
  metrics: ProductionMetric[];
}

export interface PerformanceResponse {
  success: boolean;
  topPerformers: WorkerPerformance[];
}

export interface ActivitiesResponse {
  success: boolean;
  activities: RecentActivities;
}

export interface TrendsResponse {
  success: boolean;
  trends: ProductionTrends;
}


