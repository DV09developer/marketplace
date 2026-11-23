export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  accountStatus: 'active' | 'suspended' | 'pending';
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string;
  email: string;
  contactNumber: string;
  whatsappNumber?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  websiteUrl?: string;
  workingHours?: Record<string, string>;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  ownerId: string;
  isVerified?: boolean;
  viewCount?: number;
  view_count?: number;
  createdAt: string;
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Product {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price?: number;
  currency?: string;
  images: string[];
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
  createdAt: string;
  businessName?: string;
  city?: string;
}

export interface Service {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  pricingInfo?: string;
  images: string[];
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
  createdAt: string;
  businessName?: string;
  city?: string;
}

export interface Inquiry {
  id: string;
  businessId: string;
  userId?: string;
  productId?: string;
  serviceId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subject: string;
  message: string;
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  businessName?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
