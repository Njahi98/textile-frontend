import api from "@/lib/api";

export interface DashboardStats {
  workers: {
    total: number;
    activeToday: number;
  };
  productionLines: {
    total: number;
    active: number;
  };
  products: {
    total: number;
    active: number;
  };
  users: {
    total: number;
  };
  production: {
    today: {
      pieces: number;
      avgErrorRate: number;
      records: number;
    };
    month: {
      pieces: number;
      avgErrorRate: number;
      records: number;
    };
  };
  assignments: {
    today: number;
  };
}

export interface ProductionMetric {
  productionLine: {
    id: number;
    name: string;
    targetOutput: number | null;
    capacity: number | null;
    isActive: boolean;
  } | null;
  production: number;
  avgErrorRate: number;
  avgTimeTaken: number;
  recordCount: number;
  efficiency: number | null;
}

export interface WorkerPerformance {
  worker: {
    id: number;
    name: string;
    cin: string;
    role: string | null;
  } | null;
  production: number;
  avgErrorRate: number;
  recordCount: number;
}

export interface RecentActivities {
  assignments: Array<{
    id: number;
    date: string;
    position: string;
    shift: string;
    createdAt: string;
    worker: {
      id: number;
      name: string;
      cin: string;
    };
    productionLine: {
      id: number;
      name: string;
    };
  }>;
  performanceRecords: Array<{
    id: number;
    date: string;
    piecesMade: number;
    errorRate: number;
    timeTaken: number;
    createdAt: string;
    worker: {
      id: number;
      name: string;
      cin: string;
    };
    product: {
      id: number;
      name: string;
      code: string;
    };
    productionLine: {
      id: number;
      name: string;
    };
  }>;
  newWorkers: Array<{
    id: number;
    name: string;
    cin: string;
    role: string | null;
    createdAt: string;
  }>;
}

export interface ProductionTrend {
  date: string;
  production: number;
  avgErrorRate: number;
  recordCount: number;
}

export interface ProductionTrends {
  data: ProductionTrend[];
  summary: {
    totalProduction: number;
    avgDailyProduction: number;
    trendPercentage: number;
  };
}

interface DashboardStatsResponse {
  success: boolean;
  stats: DashboardStats;
}

interface ProductionMetricsResponse {
  success: boolean;
  metrics: ProductionMetric[];
}

interface WorkerPerformanceResponse {
  success: boolean;
  topPerformers: WorkerPerformance[];
}

interface RecentActivitiesResponse {
  success: boolean;
  activities: RecentActivities;
}

interface ProductionTrendsResponse {
  success: boolean;
  trends: ProductionTrends;
}

export const dashboardApi = {
  async getStats(): Promise<DashboardStatsResponse> {
    const response = await api.get<DashboardStatsResponse>('/api/dashboard/stats');
    return response.data;
  },

  async getProductionMetrics(): Promise<ProductionMetricsResponse> {
    const response = await api.get<ProductionMetricsResponse>('/api/dashboard/production-metrics');
    return response.data;
  },

  async getWorkerPerformance(): Promise<WorkerPerformanceResponse> {
    const response = await api.get<WorkerPerformanceResponse>('/api/dashboard/worker-performance');
    return response.data;
  },

  async getRecentActivities(): Promise<RecentActivitiesResponse> {
    const response = await api.get<RecentActivitiesResponse>('/api/dashboard/recent-activities');
    return response.data;
  },

  async getProductionTrends(): Promise<ProductionTrendsResponse> {
    const response = await api.get<ProductionTrendsResponse>('/api/dashboard/production-trends');
    return response.data;
  }
};