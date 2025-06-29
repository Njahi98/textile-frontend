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

export const workerApi = {

  // Get worker by ID
  async getWorkerById(id: string): Promise<WorkerResponse> {
    const response = await api.get<WorkerResponse>(`/api/workers/${id}`);
    return response.data;
  },

  // Create new worker
  async createWorker(userData: CreateOrUpdateUserData): Promise<WorkerResponse> {
    const response = await api.post<WorkerResponse>('/api/workers', userData);
    await mutate('/api/workers');
    return response.data;
  },

  // Update worker
  async updateWorker(id: string, userData: CreateOrUpdateUserData): Promise<WorkerResponse> {
    const response = await api.put<WorkerResponse>(`/api/workers/${id}`, userData);
    await mutate('/api/workers');
    return response.data;
  },

  // Delete worker
  async deleteWorker(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/workers/${id}`);
    await mutate('/api/workers');
    return response.data;
  }
}