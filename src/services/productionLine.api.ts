import api from "@/lib/api";
import { mutate } from "swr";

export interface PerformanceMetrics {
  avgErrorRate: number;
  avgTimeTaken: number;
}

export interface ProductionLine {
  id: number;
  name: string;
  description?: string | null;
  capacity?: number | null;
  isActive: boolean;
  targetOutput?: number | null;
  location?: string | null;
  createdAt: string;
  updatedAt: string;

  currentAssignments?: number;
  dailyOutput?: number;
  performance?: PerformanceMetrics;
}

export interface ProductionLineResponse {
  success: boolean;
  message?: string;
  productionLine: ProductionLine;
}

export interface ProductionLineListResponse {
  success: boolean;
  productionLines: ProductionLine[];
}

export const productionLineApi = {
  async getAll(): Promise<ProductionLineListResponse> {
    const response = await api.get<ProductionLineListResponse>("/api/production-lines");
    return response.data;
  },

  async getById(id: number): Promise<ProductionLineResponse> {
    const response = await api.get<ProductionLineResponse>(`/api/production-lines/${id}`);
    return response.data;
  },

  async create(data: Omit<ProductionLine, "id" | "createdAt" | "updatedAt" | "currentAssignments" | "dailyOutput" | "performance">): Promise<ProductionLineResponse> {
    const response = await api.post<ProductionLineResponse>("/api/production-lines", data);
    await mutate('/api/production-lines');
    return response.data;
  },

  async update(id: number, data: Partial<Omit<ProductionLine, "id" | "createdAt" | "updatedAt" | "currentAssignments" | "dailyOutput" | "performance">>): Promise<ProductionLineResponse> {
    const response = await api.put<ProductionLineResponse>(`/api/production-lines/${id}`, data);
    await mutate('/api/production-lines');
    return response.data;
  },

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/production-lines/${id}`);
    await mutate('/api/production-lines');
    return response.data;
  },

  async toggleStatus(id: number): Promise<ProductionLineResponse> {
    const response = await api.patch<ProductionLineResponse>(`/api/production-lines/${id}/toggle`);
    await mutate('/api/production-lines');
    return response.data;
  },
};
