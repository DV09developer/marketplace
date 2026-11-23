import { api } from '@/lib/api';
import { Service, ApiResponse } from '@/types';

export interface CreateServiceData {
  name: string;
  description: string;
  categoryId?: string;
  pricingInfo?: string;
  images?: string[];
  status?: 'draft' | 'pending' | 'published';
  isFeatured?: boolean;
}

export const serviceApi = {
  async getFeatured(limit = 8): Promise<ApiResponse<{ services: Service[] }>> {
    return api.get<{ services: Service[] }>(`/services/featured?limit=${limit}`);
  },

  async getBusinessServices(businessId: string): Promise<ApiResponse<{ services: Service[] }>> {
    return api.get<{ services: Service[] }>(`/services/business/${businessId}`);
  },

  async getServiceById(id: string): Promise<ApiResponse<{ service: Service }>> {
    return api.get<{ service: Service }>(`/services/${id}`);
  },

  async createService(
    businessId: string,
    data: CreateServiceData
  ): Promise<ApiResponse<{ service: Service }>> {
    return api.post<{ service: Service }>(`/services/business/${businessId}`, data);
  },

  async updateService(
    id: string,
    data: Partial<CreateServiceData>
  ): Promise<ApiResponse<{ service: Service }>> {
    return api.put<{ service: Service }>(`/services/${id}`, data);
  },

  async deleteService(id: string): Promise<ApiResponse<null>> {
    return api.delete<null>(`/services/${id}`);
  },
};
