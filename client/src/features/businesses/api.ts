import { api } from '@/lib/api';
import { Business, ApiResponse } from '@/types';
import { CreateBusinessFormData, BusinessMember } from './types';

export const businessApi = {
  async getMyBusinesses(): Promise<ApiResponse<{ businesses: Business[] }>> {
    return api.get<{ businesses: Business[] }>('/businesses/my-businesses');
  },

  async getBusinessById(id: string): Promise<ApiResponse<{ business: Business }>> {
    return api.get<{ business: Business }>(`/businesses/${id}`);
  },

  async getBusinessBySlug(slug: string): Promise<ApiResponse<{ business: Business }>> {
    return api.get<{ business: Business }>(`/businesses/slug/${slug}`);
  },

  async createBusiness(data: CreateBusinessFormData): Promise<ApiResponse<{ business: Business }>> {
    return api.post<{ business: Business }>('/businesses', data);
  },

  async updateBusiness(
    id: string,
    data: Partial<CreateBusinessFormData>
  ): Promise<ApiResponse<{ business: Business }>> {
    return api.put<{ business: Business }>(`/businesses/${id}`, data);
  },

  async getMembers(businessId: string): Promise<ApiResponse<{ members: BusinessMember[] }>> {
    return api.get<{ members: BusinessMember[] }>(`/businesses/${businessId}/members`);
  },

  async addMember(
    businessId: string,
    email: string,
    role: 'manager' | 'staff'
  ): Promise<ApiResponse<{ member: BusinessMember }>> {
    return api.post<{ member: BusinessMember }>(`/businesses/${businessId}/members`, { email, role });
  },

  async removeMember(businessId: string, userId: string): Promise<ApiResponse<null>> {
    return api.delete<null>(`/businesses/${businessId}/members/${userId}`);
  },
};
