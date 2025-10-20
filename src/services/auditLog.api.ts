import api from "@/lib/api";

export interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  resource: string;
  resourceId: string | null;
  tableName: string | null;
  oldValues: any;
  newValues: any;
  metadata: any;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}

export interface AuditLogsResponse {
  success: boolean;
  auditLogs: AuditLog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    startDate?: string;
    endDate?: string;
    userId?: number;
    action?: string;
    resource?: string;
    search?: string;
  };
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  userId?: number;
  action?: string;
  resource?: string;
  search?: string;
}

export interface AuditStatsResponse {
  success: boolean;
  stats: {
    period: {
      days: number;
      startDate: string;
      endDate: string;
    };
    totalActions: number;
    actionsByType: Array<{
      action: string;
      count: number;
    }>;
    actionsByResource: Array<{
      resource: string;
      count: number;
    }>;
    actionsByUser: Array<{
      userId: number | null;
      _count: number;
      user?: {
        id: number;
        username: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: string;
      };
    }>;
    recentActivity: Array<{
      hour: string;
      count: number;
    }>;
    topUsers: Array<{
      id: number;
      username: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: string;
      action_count: number;
    }>;
  };
}

export const auditLogApi = {
  async getAuditLogs(params: AuditLogQueryParams = {}): Promise<AuditLogsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.userId) queryParams.append('userId', params.userId.toString());
    if (params.action) queryParams.append('action', params.action);
    if (params.resource) queryParams.append('resource', params.resource);
    if (params.search) queryParams.append('search', params.search);

    const response = await api.get<AuditLogsResponse>(`/api/audit-logs?${queryParams.toString()}`);
    return response.data;
  },

  async getAuditLogById(id: string): Promise<{ success: boolean; auditLog: AuditLog }> {
    const response = await api.get<{ success: boolean; auditLog: AuditLog }>(`/api/audit-logs/${id}`);
    return response.data;
  },

  async getAuditStats(days = 30): Promise<AuditStatsResponse> {
    const response = await api.get<AuditStatsResponse>(`/api/audit-logs/stats?days=${days}`);
    return response.data;
  },

  async exportAuditLogs(): Promise<Blob> {
    try {
      const response = await api.get('/api/audit-logs/export', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Export API error:', error);
      throw error;
    }
  },

  async cleanupAuditLogs(days: number = 365): Promise<{ success: boolean; message: string; deletedCount: number; daysToKeep: number }> {
    const response = await api.delete<{ success: boolean; message: string; deletedCount: number; daysToKeep: number }>(`/api/audit-logs/cleanup?days=${days}`);
    return response.data;
  },

  // Helper function to download CSV file
  async downloadAuditLogsCSV(): Promise<void> {
    try {
      const blob = await this.exportAuditLogs();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading audit logs:', error);
      throw error;
    }
  },

  // Log export actions for frontend CSV exports
  async logPerformanceAnalyticsExport(metadata: {
    dateRange: { from: string; to: string };
    groupBy: string;
    filters?: { workerId?: number; productionLineId?: number };
    dataPoints: number;
    totalRecords: number;
  }): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/api/audit-logs/log-export', {
      exportType: 'performance_analytics',
      metadata,
    });
    return response.data;
  },

  async logPerformanceAiInsightsExport(metadata: {
    dataAnalyzed?: {
      totalRecords: number;
      workersAnalyzed: number;
      productionLinesAnalyzed: number;
      productsAnalyzed: number;
      dateRange?: { startDate: string; endDate: string };
    };
    insightsGenerated: boolean;
  }): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/api/audit-logs/log-export', {
      exportType: 'performance_ai_insights',
      metadata,
    });
    return response.data;
  }
};
