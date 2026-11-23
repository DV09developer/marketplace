export interface SearchParams {
  keyword?: string;
  city?: string;
  categoryId?: string;
  type?: 'all' | 'businesses' | 'products' | 'services';
  page?: number;
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  type: 'business' | 'product' | 'service';
  title: string;
  slug: string;
  description: string;
  price?: number | null;
  pricingInfo?: string | null;
  imageUrl?: string | null;
  businessName?: string;
  businessSlug?: string;
  categoryName?: string;
  city?: string;
  state?: string;
  isVerified?: boolean;
  createdAt: string;
}
