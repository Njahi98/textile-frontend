import api from "@/lib/api";
import { User } from '@/types/auth';
import { mutate } from "swr";


interface UserResponse {
  success: boolean;
  message?: string;
  user: User;
}

interface CreateOrUpdateUserData {
  email: string;
  password?: string;
  username: string;
  firstName?: string|null;
  lastName?: string|null;
  phone?: string;
  role?: string;
  status?: string;
}

export const userApi = {

  async getUserById(id: string): Promise<UserResponse> {
    const response = await api.get<UserResponse>(`/api/users/${id}`);
    return response.data;
  },

  async createUser(userData: CreateOrUpdateUserData): Promise<UserResponse> {
    const response = await api.post<UserResponse>('/api/users', userData);
    await mutate('/api/users');
    return response.data;
  },

  async updateUser(id: string, userData: CreateOrUpdateUserData): Promise<UserResponse> {
    const response = await api.put<UserResponse>(`/api/users/${id}`, userData);
    await mutate('/api/users');
    return response.data;
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/users/${id}`);
    await mutate('/api/users');
    return response.data;
  }
}