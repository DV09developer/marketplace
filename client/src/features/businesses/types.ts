import { Business } from '@/types';

export interface CreateBusinessFormData {
  name: string;
  description: string;
  email: string;
  contactNumber: string;
  whatsappNumber?: string;
  primaryCategoryId?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  websiteUrl?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  workingHours?: Record<string, string>;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'staff';
  full_name: string;
  email: string;
  created_at: string;
}
