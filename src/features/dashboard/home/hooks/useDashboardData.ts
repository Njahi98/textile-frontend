import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { ActivitiesResponse, MetricsResponse, PerformanceResponse, StatsResponse, TrendsResponse } from "../data/types";

export function useDashboardData() {
  const { data: statsData, error: statsError, isLoading: statsLoading } =
    useSWR<StatsResponse>("/api/dashboard/stats", fetcher, { refreshInterval: 30000 });

  const { data: metricsData, error: metricsError, isLoading: metricsLoading } =
    useSWR<MetricsResponse>("/api/dashboard/production-metrics", fetcher, { refreshInterval: 30000 });

  const { data: performanceData, error: performanceError, isLoading: performanceLoading } =
    useSWR<PerformanceResponse>("/api/dashboard/worker-performance", fetcher, { refreshInterval: 30000 });

  const { data: activitiesData } =
    useSWR<ActivitiesResponse>("/api/dashboard/recent-activities", fetcher, { refreshInterval: 60000 });

  const { data: trendsData } =
    useSWR<TrendsResponse>("/api/dashboard/production-trends", fetcher, { refreshInterval: 60000 });

  return {
    statsData,
    metricsData,
    performanceData,
    activitiesData,
    trendsData,
    statsLoading,
    metricsLoading,
    performanceLoading,
    statsError,
    metricsError,
    performanceError,
  };
}


