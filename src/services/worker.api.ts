import api from "@/lib/api";
import { mutate } from "swr";

interface Worker {
   id: string,
   name: string,
   email: string | null,
   cin: string,
   phone: string | null,
   role: string | null,
   createdAt: string;
   updatedAt: string;
   _count?: {
     assignments: number;
     performanceRecords: number;
   };
}

interface WorkerResponse {
  success: boolean;
  message?: string;
  worker: Worker;
}

interface CreateOrUpdateUserData {
  name: string;
  cin: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
}

export interface ImportRowError {
  row: number;
  error: string;
}

export interface ImportRowSuccess {
  row: number;
  [key: string]: unknown;
}

interface ImportResult {
  success: ImportRowSuccess[];
  errors: ImportRowError[];
  total: number;
}

interface ImportResponse {
  success: boolean;
  message: string;
  results: ImportResult;
}

export const workerApi = {

  async getWorkerById(id: string): Promise<WorkerResponse> {
    const response = await api.get<WorkerResponse>(`/api/workers/${id}`);
    return response.data;
  },

  async createWorker(userData: CreateOrUpdateUserData): Promise<WorkerResponse> {
    const response = await api.post<WorkerResponse>('/api/workers', userData);
    await mutate('/api/workers');
    return response.data;
  },

  async updateWorker(id: string, userData: CreateOrUpdateUserData): Promise<WorkerResponse> {
    const response = await api.put<WorkerResponse>(`/api/workers/${id}`, userData);
    await mutate('/api/workers');
    return response.data;
  },

  async deleteWorker(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/workers/${id}`);
    await mutate('/api/workers');
    return response.data;
  },

  // Import workers from CSV
  async importWorkers(file: File): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ImportResponse>('/api/workers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    await mutate('/api/workers');
    return response.data;
  }
}