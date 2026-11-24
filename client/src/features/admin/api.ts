import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import {
  PlatformMetrics,
  AdminBusiness,
  AdminUser,
  AdminInquiry,
  AdminCategory,
} from './types';

export const adminApi = {
  async getMetrics(): Promise<ApiResponse<{ metrics: PlatformMetrics }>> {
    return api.get<{ metrics: PlatformMetrics }>('/admin/metrics');
  },

  async getBusinesses(options: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<{ businesses: AdminBusiness[] }>> {
    const query = new URLSearchParams();
    if (options.status && options.status !== 'all') query.set('status', options.status);
    if (options.search) query.set('search', options.search);
    if (options.page) query.set('page', String(options.page));
    if (options.limit) query.set('limit', String(options.limit));

    return api.get<{ businesses: AdminBusiness[] }>(`/admin/businesses?${query.toString()}`);
  },

  async updateBusinessStatus(
    businessId: string,
    status: 'pending' | 'approved' | 'rejected' | 'suspended',
    statusReason?: string
  ): Promise<ApiResponse<{ business: any }>> {
    return api.patch<{ business: any }>(`/admin/businesses/${businessId}/status`, {
      status,
      statusReason,
    });
  },

  async getUsers(options: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<{ users: AdminUser[] }>> {
    const query = new URLSearchParams();
    if (options.search) query.set('search', options.search);
    if (options.role && options.role !== 'all') query.set('role', options.role);
    if (options.status && options.status !== 'all') query.set('status', options.status);
    if (options.page) query.set('page', String(options.page));
    if (options.limit) query.set('limit', String(options.limit));

    return api.get<{ users: AdminUser[] }>(`/admin/users?${query.toString()}`);
  },

  async updateUserStatus(
    userId: string,
    data: { status?: 'active' | 'suspended' | 'pending'; role?: 'user' | 'admin' }
  ): Promise<ApiResponse<{ user: any }>> {
    return api.patch<{ user: any }>(`/admin/users/${userId}/status`, data);
  },

  async getInquiries(options: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<{ inquiries: AdminInquiry[] }>> {
    const query = new URLSearchParams();
    if (options.status && options.status !== 'all') query.set('status', options.status);
    if (options.search) query.set('search', options.search);
    if (options.page) query.set('page', String(options.page));
    if (options.limit) query.set('limit', String(options.limit));

    return api.get<{ inquiries: AdminInquiry[] }>(`/admin/inquiries?${query.toString()}`);
  },

  async getCategories(): Promise<ApiResponse<{ categories: AdminCategory[] }>> {
    return api.get<{ categories: AdminCategory[] }>('/admin/categories');
  },

  async createCategory(data: {
    name: string;
    slug?: string;
    description?: string;
    iconName?: string;
    imageUrl?: string;
    isActive?: boolean;
    displayOrder?: number;
  }): Promise<ApiResponse<{ category: AdminCategory }>> {
    return api.post<{ category: AdminCategory }>('/admin/categories', data);
  },

  async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      iconName?: string;
      imageUrl?: string;
      isActive?: boolean;
      displayOrder?: number;
    }
  ): Promise<ApiResponse<{ category: AdminCategory }>> {
    return api.put<{ category: AdminCategory }>(`/admin/categories/${id}`, data);
  },

  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    return api.delete<null>(`/admin/categories/${id}`);
  },
};
