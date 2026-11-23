import { api } from '@/lib/api';
import { User, ApiResponse } from '@/types';
import { RegisterCredentials, LoginCredentials, AuthResponseData } from './types';

export const authApi = {
  async register(data: RegisterCredentials): Promise<ApiResponse<AuthResponseData>> {
    return api.post<AuthResponseData>('/auth/register', data);
  },

  async login(data: LoginCredentials): Promise<ApiResponse<AuthResponseData>> {
    return api.post<AuthResponseData>('/auth/login', data);
  },

  async refresh(): Promise<ApiResponse<AuthResponseData>> {
    return api.post<AuthResponseData>('/auth/refresh');
  },

  async logout(): Promise<ApiResponse<null>> {
    return api.post<null>('/auth/logout');
  },

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    return api.get<{ user: User }>('/auth/me');
  },

  async updateProfile(data: {
    fullName?: string;
    phoneNumber?: string;
    profileImage?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    return api.put<{ user: User }>('/auth/profile', data);
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return api.post<null>('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
    return api.post<null>('/auth/reset-password', { token, newPassword });
  },
};
