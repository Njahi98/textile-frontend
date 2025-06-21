import api from "@/lib/api";
import { User } from '@/types/auth';
import { mutate } from "swr";

interface UsersResponse {
  success: boolean;
  users: User[];
}

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

// interface UpdateUserData {
//   email?: string;
//   username?: string;
//   firstName?: string;
//   lastName?: string;
//   phone?: string;
//   role?: string;
//   password?: string;
//   status?: string;
// }

export const userApi = {

  // Get user by ID
  async getUserById(id: string): Promise<UserResponse> {
    const response = await api.get<UserResponse>(`/api/users/${id}`);
    return response.data;
  },

  // Create new user
  async createUser(userData: CreateOrUpdateUserData): Promise<UserResponse> {
    const response = await api.post<UserResponse>('/api/users', userData);
    await mutate('/api/users');
    return response.data;
  },

  // Update user
  async updateUser(id: string, userData: CreateOrUpdateUserData): Promise<UserResponse> {
    const response = await api.put<UserResponse>(`/api/users/${id}`, userData);
    await mutate('/api/users');
    return response.data;
  },

  // Delete user
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/users/${id}`);
    await mutate('/api/users');
    return response.data;
  }
}