import api from "@/lib/api";
import { User } from '@/types/auth';
import { mutate } from "swr";

interface AccountResponse {
  success: boolean;
  message?: string;
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
  // Update current user's account
  async updateAccount(userData: UpdateAccountData): Promise<AccountResponse> {
    const response = await api.put<AccountResponse>('/api/settings/account', userData);
    await mutate('/api/auth/me');
    return response.data;
  },

  // Delete current user's account
  async deleteAccount(): Promise<DeleteAccountResponse> {
    const response = await api.delete<DeleteAccountResponse>('/api/settings/account');
    return response.data;
  }
};