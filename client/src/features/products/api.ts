import { api } from '@/lib/api';
import { Product, ApiResponse } from '@/types';

export interface CreateProductData {
  name: string;
  description: string;
  categoryId?: string;
  price?: number;
  currency?: string;
  images?: string[];
  status?: 'draft' | 'pending' | 'published';
  isFeatured?: boolean;
}

export const productApi = {
  async getFeatured(limit = 8): Promise<ApiResponse<{ products: Product[] }>> {
    return api.get<{ products: Product[] }>(`/products/featured?limit=${limit}`);
  },

  async getBusinessProducts(businessId: string): Promise<ApiResponse<{ products: Product[] }>> {
    return api.get<{ products: Product[] }>(`/products/business/${businessId}`);
  },

  async getProductById(id: string): Promise<ApiResponse<{ product: Product }>> {
    return api.get<{ product: Product }>(`/products/${id}`);
  },

  async createProduct(
    businessId: string,
    data: CreateProductData
  ): Promise<ApiResponse<{ product: Product }>> {
    return api.post<{ product: Product }>(`/products/business/${businessId}`, data);
  },

  async updateProduct(
    id: string,
    data: Partial<CreateProductData>
  ): Promise<ApiResponse<{ product: Product }>> {
    return api.put<{ product: Product }>(`/products/${id}`, data);
  },

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return api.delete<null>(`/products/${id}`);
  },
};
