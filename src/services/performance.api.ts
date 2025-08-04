import { api } from '@/lib/api';
import { mutate } from 'swr';

export interface PerformanceRecord {
  id: number;
  workerId: number;
  productId: number;
  productionLineId: number;
  date: Date;
  piecesMade: number;
  shift: 'morning' | 'afternoon' | 'night';
  timeTaken: number;
  errorRate: number;
  createdAt: Date;
  updatedAt: Date;
  worker: {
    id: number;
    name: string;
    cin: string;
    role: string;
  };
  product: {
    id: number;
    name: string;
    code: string;
    category: string;
  };
  productionLine: {
    id: number;
    name: string;
    location: string;
  };
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PerformanceRecordQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  workerId?: number;
  productId?: number;
  productionLineId?: number;
  shift?: 'morning' | 'afternoon' | 'night';
}

export interface CreatePerformanceRecordInput {
  workerId: number;
  productId: number;
  productionLineId: number;
  date: Date;
  piecesMade: number;
  shift: 'morning' | 'afternoon' | 'night';
  timeTaken: number;
  errorRate: number;
}

export interface UpdatePerformanceRecordInput {
  workerId?: number;
  productId?: number;
  productionLineId?: number;
  date?: Date;
  piecesMade?: number;
  shift?: 'morning' | 'afternoon' | 'night';
  timeTaken?: number;
  errorRate?: number;
}

export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  workerId?: string;
  productionLineId?: string;
  groupBy?: 'worker' | 'product' | 'productionLine' | 'date';
}

export interface PerformanceAnalytics {
  overall: {
    totalPieces: number;
    avgErrorRate: number;
    avgTimeTaken: number;
    totalRecords: number;
  };
  grouped: any[];
  groupBy: 'worker' | 'product' | 'productionLine' | 'date';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export const performanceApi = {
  async getAllPerformanceRecords(params?: PerformanceRecordQueryParams) {
    const response = await api.get<{
      success: boolean;
      performanceRecords: PerformanceRecord[];
      pagination: PaginationResponse;
    }>('/api/performance', { params });
    return response.data;
  },

  async getPerformanceRecordById(id: number) {
    const response = await api.get<{
      success: boolean;
      performanceRecord: PerformanceRecord;
    }>(`/api/performance/${id}`);
    return response.data;
  },

  async createPerformanceRecord(data: CreatePerformanceRecordInput) {
    const response = await api.post<{
      success: boolean;
      message: string;
      performanceRecord: PerformanceRecord;
    }>('/api/performance', data);
    await mutate('/api/performance');
    return response.data;
  },

  async updatePerformanceRecord(id: number, data: UpdatePerformanceRecordInput) {
    const response = await api.put<{
      success: boolean;
      message: string;
      performanceRecord: PerformanceRecord;
    }>(`/api/performance/${id}`, data);
    await mutate('/api/performance');
    return response.data;
  },

  async deletePerformanceRecord(id: number) {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/api/performance/${id}`);
    await mutate('/api/performance');
    return response.data;
  },

  async getPerformanceAnalytics(params?: AnalyticsQueryParams) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) {
      searchParams.append('startDate', params.startDate);
    }
    if (params?.endDate) {
      searchParams.append('endDate', params.endDate);
    }
    if (params?.workerId) {
      searchParams.append('workerId', params.workerId);
    }
    if (params?.productionLineId) {
      searchParams.append('productionLineId', params.productionLineId);
    }
    if (params?.groupBy) {
      searchParams.append('groupBy', params.groupBy);
    }
    
    const response = await api.get<{
      success: boolean;
      analytics: PerformanceAnalytics;
    }>(`/api/performance/analytics${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    return response.data;
  },
};
