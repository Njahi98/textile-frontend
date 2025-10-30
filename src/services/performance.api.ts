import api from '@/lib/api';
import { mutate } from 'swr';

  type shiftType = "morning" | "afternoon" | "night";


export interface PerformanceRecord {
  id: number;
  workerId: number;
  productId: number;
  productionLineId: number;
  date: Date;
  piecesMade: number;
  shift?: shiftType
  timeTaken: number;
  errorRate: number;
  createdAt: Date;
  updatedAt: Date;
  worker: {
    id: number;
    name: string;
    cin: string;
    role?: string;
  };
  product: {
    id: number;
    name: string;
    code: string;
    category?: string | null;
  };
  productionLine: {
    id: number;
    name: string;
    location?: string;
  };
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PerformanceRecordsResponse {
  success: boolean;
  performanceRecords: PerformanceRecord[];
  pagination: PaginationResponse;
  filters?: {
    startDate?: string;
    endDate?: string;
    workerId?: number;
    productId?: number;
    productionLineId?: number;
    shift?: shiftType;
    search?: string;
  };
}

export interface PerformanceRecordQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  workerId?: number;
  productId?: number;
  productionLineId?: number;
  shift?: shiftType;
  search?: string;
}

export interface CreatePerformanceRecordInput {
  workerId: number;
  productId: number;
  productionLineId: number;
  date: Date;
  piecesMade: number;
  shift: string;
  timeTaken: number;
  errorRate: number;
}

export interface UpdatePerformanceRecordInput {
  workerId?: number;
  productId?: number;
  productionLineId?: number;
  date?: Date;
  piecesMade?: number;
  shift?: shiftType;
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
  async getAllPerformanceRecords(params?: PerformanceRecordQueryParams): Promise<PerformanceRecordsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.workerId) queryParams.append('workerId', params.workerId.toString());
    if (params?.productId) queryParams.append('productId', params.productId.toString());
    if (params?.productionLineId) queryParams.append('productionLineId', params.productionLineId.toString());
    if (params?.shift) queryParams.append('shift', params.shift);
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get<PerformanceRecordsResponse>(`/api/performance?${queryParams.toString()}`);
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
    await mutate((key) => typeof key === 'string' && key.startsWith('/api/performance'));
    return response.data;
  },

  async updatePerformanceRecord(id: number, data: UpdatePerformanceRecordInput) {
    const response = await api.put<{
      success: boolean;
      message: string;
      performanceRecord: PerformanceRecord;
    }>(`/api/performance/${id}`, data);
    await mutate((key) => typeof key === 'string' && key.startsWith('/api/performance'));
    return response.data;
  },

  async deletePerformanceRecord(id: number) {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/api/performance/${id}`);
    await mutate((key) => typeof key === 'string' && key.startsWith('/api/performance'));
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

  async exportPerformanceAnalyticsCsv(params?: AnalyticsQueryParams) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.workerId) searchParams.append('workerId', params.workerId);
    if (params?.productionLineId) searchParams.append('productionLineId', params.productionLineId);
    if (params?.groupBy) searchParams.append('groupBy', params.groupBy);

    const response = await api.get(`/api/performance/analytics/export${searchParams.toString() ? `?${searchParams.toString()}` : ''}` , {
      responseType: 'blob'
    });
    return response.data as Blob;
  },
};
