import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import { SearchParams, SearchResultItem } from './types';

export const searchApi = {
  async search(params: SearchParams): Promise<ApiResponse<{ items: SearchResultItem[] }>> {
    const query = new URLSearchParams();
    if (params.keyword) query.set('keyword', params.keyword);
    if (params.city) query.set('city', params.city);
    if (params.categoryId && params.categoryId !== 'all') query.set('categoryId', params.categoryId);
    if (params.type && params.type !== 'all') query.set('type', params.type);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    return api.get<{ items: SearchResultItem[] }>(`/search?${query.toString()}`);
  },
};
