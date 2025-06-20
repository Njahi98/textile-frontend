import api from "@/lib/api";
import { User } from '@/types/auth';

interface UsersResponse {
  success: boolean;
  users: User[];
}

interface UserResponse {
  success: boolean;
  message?: string;
  user: User;
}

interface CreateUserData {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
}

interface UpdateUserData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  password?: string;
  status?: string;
}

export const userApi = {
  // Get all users
  async getUsers(): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>('/api/users');
    return response.data;
  },

  // Get user by ID
  async getUserById(id: string): Promise<UserResponse> {
    const response = await api.get<UserResponse>(`/api/users/${id}`);
    return response.data;
  },

  // Create new user
  async createUser(userData: CreateUserData): Promise<UserResponse> {
    const response = await api.post<UserResponse>('/api/users', userData);
    return response.data;
  },

  // Update user
  async updateUser(id: string, userData: UpdateUserData): Promise<UserResponse> {
    const response = await api.put<UserResponse>(`/api/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/users/${id}`);
    return response.data;
  }
}