import { query } from '../config/database';

export interface SearchOptions {
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
  createdAt: Date;
}

export class SearchRepository {
  async search(options: SearchOptions): Promise<{
    items: SearchResultItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(options.page || 1, 1);
    const limit = Math.min(Math.max(options.limit || 12, 1), 50);
    const offset = (page - 1) * limit;

    const queries: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const keywordParam = options.keyword ? `%${options.keyword.trim()}%` : null;
    const cityParam = options.city ? `%${options.city.trim()}%` : null;

    let keywordIdx = 0;
    let cityIdx = 0;
    let categoryIdx = 0;

    if (keywordParam) {
      keywordIdx = idx++;
      values.push(keywordParam);
    }
    if (cityParam) {
      cityIdx = idx++;
      values.push(cityParam);
    }
    if (options.categoryId) {
      categoryIdx = idx++;
      values.push(options.categoryId);
    }

    const type = options.type || 'all';

    // 1. Businesses subquery
    if (type === 'all' || type === 'businesses') {
      let bWhere = "b.status = 'approved'";
      if (keywordIdx) {
        bWhere += ` AND (b.name ILIKE $${keywordIdx} OR b.description ILIKE $${keywordIdx})`;
      }
      if (cityIdx) {
        bWhere += ` AND b.city ILIKE $${cityIdx}`;
      }
      if (categoryIdx) {
        bWhere += ` AND b.primary_category_id = $${categoryIdx}`;
      }

      queries.push(`
        SELECT
          b.id,
          'business'::text as type,
          b.name as title,
          b.slug,
          b.description,
          NULL::numeric as price,
          NULL::text as pricing_info,
          b.logo_url as image_url,
          b.name as business_name,
          b.slug as business_slug,
          c.name as category_name,
          b.city,
          b.state,
          b.is_verified,
          b.created_at
        FROM businesses b
        LEFT JOIN categories c ON b.primary_category_id = c.id
        WHERE ${bWhere}
      `);
    }

    // 2. Products subquery
    if (type === 'all' || type === 'products') {
      let pWhere = "p.status = 'published' AND b.status = 'approved'";
      if (keywordIdx) {
        pWhere += ` AND (p.name ILIKE $${keywordIdx} OR p.description ILIKE $${keywordIdx})`;
      }
      if (cityIdx) {
        pWhere += ` AND b.city ILIKE $${cityIdx}`;
      }
      if (categoryIdx) {
        pWhere += ` AND p.category_id = $${categoryIdx}`;
      }

      queries.push(`
        SELECT
          p.id,
          'product'::text as type,
          p.name as title,
          p.slug,
          p.description,
          p.price,
          NULL::text as pricing_info,
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) as image_url,
          b.name as business_name,
          b.slug as business_slug,
          c.name as category_name,
          b.city,
          b.state,
          b.is_verified,
          p.created_at
        FROM products p
        INNER JOIN businesses b ON p.business_id = b.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE ${pWhere}
      `);
    }

    // 3. Services subquery
    if (type === 'all' || type === 'services') {
      let sWhere = "s.status = 'published' AND b.status = 'approved'";
      if (keywordIdx) {
        sWhere += ` AND (s.name ILIKE $${keywordIdx} OR s.description ILIKE $${keywordIdx})`;
      }
      if (cityIdx) {
        sWhere += ` AND b.city ILIKE $${cityIdx}`;
      }
      if (categoryIdx) {
        sWhere += ` AND s.category_id = $${categoryIdx}`;
      }

      queries.push(`
        SELECT
          s.id,
          'service'::text as type,
          s.name as title,
          s.slug,
          s.description,
          NULL::numeric as price,
          s.pricing_info,
          (SELECT image_url FROM service_images WHERE service_id = s.id ORDER BY display_order ASC LIMIT 1) as image_url,
          b.name as business_name,
          b.slug as business_slug,
          c.name as category_name,
          b.city,
          b.state,
          b.is_verified,
          s.created_at
        FROM services s
        INNER JOIN businesses b ON s.business_id = b.id
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE ${sWhere}
      `);
    }

    if (queries.length === 0) {
      return { items: [], total: 0, page, limit, totalPages: 0 };
    }

    const unionSql = queries.join(' UNION ALL ');

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM (${unionSql}) as total_results`;
    const countResult = await query<{ total: string }>(countSql, values);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // Items query with pagination
    const itemsSql = `
      SELECT * FROM (${unionSql}) as results
      ORDER BY created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(limit, offset);

    const itemsResult = await query<SearchResultItem>(itemsSql, values);

    return {
      items: itemsResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export const searchRepository = new SearchRepository();
