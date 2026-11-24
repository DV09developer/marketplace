export interface PlatformMetrics {
  totalUsers: number;
  totalBusinesses: number;
  pendingBusinesses: number;
  approvedBusinesses: number;
  totalProducts: number;
  totalServices: number;
  totalInquiries: number;
  newInquiries: number;
  recentUsers: Array<{ id: string; fullName: string; email: string; createdAt: string }>;
  recentPendingBusinesses: Array<{ id: string; name: string; city: string; categoryName?: string; createdAt: string }>;
}

export interface AdminBusiness {
  id: string;
  name: string;
  slug: string;
  description: string;
  email: string;
  contact_number: string;
  city: string;
  state: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  status_reason?: string | null;
  category_name?: string;
  owner_name?: string;
  owner_email?: string;
  products_count: number | string;
  services_count: number | string;
  inquiries_count: number | string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  role: 'user' | 'admin';
  account_status: 'active' | 'suspended' | 'pending';
  profile_image?: string | null;
  businesses_count: number | string;
  submitted_inquiries_count: number | string;
  created_at: string;
}

export interface AdminInquiry {
  id: string;
  business_id: string;
  business_name?: string;
  business_slug?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subject: string;
  message: string;
  product_name?: string | null;
  service_name?: string | null;
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon_name?: string | null;
  image_url?: string | null;
  is_active: boolean;
  display_order: number;
  businesses_count?: number | string;
  created_at: string;
}
