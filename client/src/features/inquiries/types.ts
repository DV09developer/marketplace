import { Inquiry } from '@/types';

export interface CreateInquiryData {
  businessId: string;
  productId?: string;
  serviceId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subject: string;
  message: string;
}

export type InquiryStatus = 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
