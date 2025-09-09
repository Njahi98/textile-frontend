import api from '@/lib/api';
import { mutate } from 'swr';

export interface Worker {
  id: number;
  name: string;
  cin: string;
  role?: string;
  email?: string;
  phone?: string;
}

export interface ProductionLine {
  id: number;
  name: string;
  description?: string;
  location?: string;
  capacity?: number;
  isActive: boolean;
}

export interface Assignment {
  id: number;
  date: Date;
  position: string;
  shift: string;
  createdAt: Date;
  updatedAt: Date;
  worker: Worker;
  productionLine: ProductionLine;
}

export interface AssignmentQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  workerId?: number;
  productionLineId?: number;
  shift?: string;
  position?: string;
}

export interface CreateAssignmentData {
  workerId: number;
  productionLineId: number;
  position: string;
  date: string;
  shift: string;
}

export interface UpdateAssignmentData {
  workerId?: number;
  productionLineId?: number;
  position?: string;
  date?: string;
  shift?: string;
}

export interface CalendarQueryParams {
  year: number;
  month: number;
  workerId?: number;
  productionLineId?: number;
}

export interface AssignmentConflict {
  workerId: number;
  date: string;
  shift: string;
  assignments: {
    assignmentId: number;
    productionLineId: number;
    position: string;
    productionLineName: string;
  }[];
  worker: Worker;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AssignmentsResponse {
  success: boolean;
  assignments: Assignment[];
  pagination: PaginationInfo;
}

export interface AssignmentResponse {
  success: boolean;
  assignment: Assignment;
}

export interface CalendarResponse {
  success: boolean;
  calendar: Record<string, Assignment[]>;
  summary: {
    year: number;
    month: number;
    totalAssignments: number;
    daysWithAssignments: number;
  };
}

export interface ConflictsResponse {
  success: boolean;
  conflicts: AssignmentConflict[];
  summary: {
    totalConflicts: number;
    dateRange: {
      startDate: string;
      endDate: string;
    };
  };
}

export const assignmentApi = {

  async getAssignmentById(id: number): Promise<AssignmentResponse> {
    const response = await api.get<AssignmentResponse>(`/api/assignments/${id}`);
    return response.data;
  },

  async createAssignment(data: CreateAssignmentData): Promise<AssignmentResponse> {
    const response = await api.post<AssignmentResponse>('/api/assignments', data);
    await mutate('/api/assignments');
    return response.data;
  },

  async updateAssignment(id: number, data: UpdateAssignmentData): Promise<AssignmentResponse> {
    const response = await api.put<AssignmentResponse>(`/api/assignments/${id}`, data);
    await mutate('/api/assignments');
    return response.data;
  },

  async deleteAssignment(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/assignments/${id}`);
    await mutate('/api/assignments');
    return response.data;
  },

  async getAssignmentsCalendar(params: CalendarQueryParams): Promise<CalendarResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('year', params.year.toString());
    searchParams.append('month', params.month.toString());
    if (params.workerId) {
      searchParams.append('workerId', params.workerId.toString());
    }
    if (params.productionLineId) {
      searchParams.append('productionLineId', params.productionLineId.toString());
    }
    const response = await api.get<CalendarResponse>(`/api/assignments/calendar?${searchParams.toString()}`);
    return response.data;
  },

  async getAssignmentConflicts(params?: { startDate?: string; endDate?: string }): Promise<ConflictsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) {
      searchParams.append('startDate', params.startDate);
    }
    if (params?.endDate) {
      searchParams.append('endDate', params.endDate);
    }
    const response = await api.get<ConflictsResponse>(`/api/assignments/conflicts?${searchParams.toString()}`);
    return response.data;
  },
};