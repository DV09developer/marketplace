import { api } from '@/lib/api';
import { Category, ApiResponse } from '@/types';

export const categoryApi = {
  async getCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
    return api.get<{ categories: Category[] }>('/categories');
  },
};
