import api from "@/lib/api";
import { User } from '@/types/auth';
import { mutate } from "swr";

interface AccountResponse {
  success: boolean;
  message?: string;
  user: User;
}

interface AccountSettingsResponse {
  success: boolean;
  user: User;
}

interface UpdateAccountData {
  email?: string;
  password?: string;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

export const accountApi = {
  async getAccountSettings(): Promise<AccountSettingsResponse> {
    const response = await api.get<AccountSettingsResponse>('/api/settings/account');
    return response.data;
  },

  async updateAccount(userData: UpdateAccountData): Promise<AccountResponse> {
    const response = await api.put<AccountResponse>('/api/settings/account', userData);
    await mutate('/api/settings/account');
    await mutate('/api/auth/me');
    return response.data;
  },

  async updateAvatar(file: File): Promise<AccountResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.put<AccountResponse>('/api/settings/account/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    await mutate('/api/settings/account');
    await mutate('/api/auth/me');
    return response.data;
  },

  async deleteAvatar(): Promise<AccountResponse> {
    const response = await api.delete<AccountResponse>('/api/settings/account/avatar');
    await mutate('/api/settings/account');
    await mutate('/api/auth/me');
    return response.data;
  },

  async deleteAccount(): Promise<DeleteAccountResponse> {
    const response = await api.delete<DeleteAccountResponse>('/api/settings/account');
    return response.data;
  }
};