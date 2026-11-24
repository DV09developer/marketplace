import { api } from '@/lib/api';
import { Inquiry, ApiResponse } from '@/types';
import { CreateInquiryData, InquiryStatus } from './types';

export const inquiryApi = {
  async submitInquiry(data: CreateInquiryData): Promise<ApiResponse<{ inquiry: Inquiry }>> {
    return api.post<{ inquiry: Inquiry }>('/inquiries', data);
  },

  async getMyInquiries(page = 1, limit = 15): Promise<ApiResponse<{ inquiries: Inquiry[] }>> {
    return api.get<{ inquiries: Inquiry[] }>(`/inquiries/my-inquiries?page=${page}&limit=${limit}`);
  },

  async getBusinessInquiries(
    businessId: string,
    options: { status?: string; search?: string; page?: number; limit?: number } = {}
  ): Promise<ApiResponse<{ inquiries: Inquiry[] }>> {
    const query = new URLSearchParams();
    if (options.status && options.status !== 'all') query.set('status', options.status);
    if (options.search) query.set('search', options.search);
    if (options.page) query.set('page', String(options.page));
    if (options.limit) query.set('limit', String(options.limit));

    return api.get<{ inquiries: Inquiry[] }>(`/inquiries/business/${businessId}?${query.toString()}`);
  },

  async updateStatus(
    businessId: string,
    inquiryId: string,
    status: InquiryStatus,
    businessNotes?: string
  ): Promise<ApiResponse<{ inquiry: Inquiry }>> {
    return api.patch<{ inquiry: Inquiry }>(`/inquiries/business/${businessId}/${inquiryId}/status`, {
      status,
      businessNotes,
    });
  },
};
