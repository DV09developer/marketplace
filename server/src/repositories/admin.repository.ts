import { query } from '../config/database';
import { CategoryRecord } from './category.repository';
import { BusinessRecord } from './business.repository';
import { UserRecord } from './user.repository';
import { InquiryRecord } from './inquiry.repository';

export interface PlatformMetrics {
  totalUsers: number;
  totalBusinesses: number;
  pendingBusinesses: number;
  approvedBusinesses: number;
  totalProducts: number;
  totalServices: number;
  totalInquiries: number;
  newInquiries: number;
  recentUsers: Array<{ id: string; fullName: string; email: string; createdAt: Date }>;
  recentPendingBusinesses: Array<{ id: string; name: string; city: string; categoryName?: string; createdAt: Date }>;
}

export class AdminRepository {
  async getMetrics(): Promise<PlatformMetrics> {
    const [
      usersCountRes,
      bizCountRes,
      pendingBizRes,
      approvedBizRes,
      productsCountRes,
      servicesCountRes,
      inquiriesCountRes,
      newInquiriesRes,
      recentUsersRes,
      recentPendingBizRes,
    ] = await Promise.all([
      query<{ count: string }>('SELECT COUNT(*) as count FROM users'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM businesses'),
      query<{ count: string }>("SELECT COUNT(*) as count FROM businesses WHERE status = 'pending'"),
      query<{ count: string }>("SELECT COUNT(*) as count FROM businesses WHERE status = 'approved'"),
      query<{ count: string }>("SELECT COUNT(*) as count FROM products WHERE status = 'published'"),
      query<{ count: string }>("SELECT COUNT(*) as count FROM services WHERE status = 'published'"),
      query<{ count: string }>('SELECT COUNT(*) as count FROM inquiries'),
      query<{ count: string }>("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'"),
      query<{ id: string; full_name: string; email: string; created_at: Date }>(
        'SELECT id, full_name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'
      ),
      query<{ id: string; name: string; city: string; category_name?: string; created_at: Date }>(
        `SELECT b.id, b.name, b.city, c.name as category_name, b.created_at
         FROM businesses b
         LEFT JOIN categories c ON b.primary_category_id = c.id
         WHERE b.status = 'pending'
         ORDER BY b.created_at DESC LIMIT 5`
      ),
    ]);

    return {
      totalUsers: parseInt(usersCountRes.rows[0]?.count || '0', 10),
      totalBusinesses: parseInt(bizCountRes.rows[0]?.count || '0', 10),
      pendingBusinesses: parseInt(pendingBizRes.rows[0]?.count || '0', 10),
      approvedBusinesses: parseInt(approvedBizRes.rows[0]?.count || '0', 10),
      totalProducts: parseInt(productsCountRes.rows[0]?.count || '0', 10),
      totalServices: parseInt(servicesCountRes.rows[0]?.count || '0', 10),
      totalInquiries: parseInt(inquiriesCountRes.rows[0]?.count || '0', 10),
      newInquiries: parseInt(newInquiriesRes.rows[0]?.count || '0', 10),
      recentUsers: recentUsersRes.rows.map((r) => ({
        id: r.id,
        fullName: r.full_name,
        email: r.email,
        createdAt: r.created_at,
      })),
      recentPendingBusinesses: recentPendingBizRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        city: r.city,
        categoryName: r.category_name,
        createdAt: r.created_at,
      })),
    };
  }

  async getBusinesses(options: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: any[]; total: number; totalPages: number }> {
    const page = Math.max(options.page || 1, 1);
    const limit = Math.min(Math.max(options.limit || 15, 1), 50);
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (options.status && options.status !== 'all') {
      whereClauses.push(`b.status = $${idx++}`);
      values.push(options.status);
    }

    if (options.search) {
      whereClauses.push(`(b.name ILIKE $${idx} OR b.city ILIKE $${idx} OR u.email ILIKE $${idx} OR u.full_name ILIKE $${idx})`);
      values.push(`%${options.search.trim()}%`);
      idx++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total
      FROM businesses b
      INNER JOIN users u ON b.owner_id = u.id
      ${whereStr}
    `;
    const countRes = await query<{ total: string }>(countSql, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const itemsSql = `
      SELECT
        b.*,
        c.name as category_name,
        u.full_name as owner_name,
        u.email as owner_email,
        u.phone_number as owner_phone,
        (SELECT COUNT(*) FROM products p WHERE p.business_id = b.id) as products_count,
        (SELECT COUNT(*) FROM services s WHERE s.business_id = b.id) as services_count,
        (SELECT COUNT(*) FROM inquiries i WHERE i.business_id = b.id) as inquiries_count
      FROM businesses b
      INNER JOIN users u ON b.owner_id = u.id
      LEFT JOIN categories c ON b.primary_category_id = c.id
      ${whereStr}
      ORDER BY 
        CASE WHEN b.status = 'pending' THEN 0 ELSE 1 END,
        b.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(limit, offset);

    const itemsRes = await query(itemsSql, values);

    return {
      items: itemsRes.rows,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getUsers(options: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: any[]; total: number; totalPages: number }> {
    const page = Math.max(options.page || 1, 1);
    const limit = Math.min(Math.max(options.limit || 15, 1), 50);
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (options.role && options.role !== 'all') {
      whereClauses.push(`u.role = $${idx++}`);
      values.push(options.role);
    }

    if (options.status && options.status !== 'all') {
      whereClauses.push(`u.account_status = $${idx++}`);
      values.push(options.status);
    }

    if (options.search) {
      whereClauses.push(`(u.full_name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.phone_number ILIKE $${idx})`);
      values.push(`%${options.search.trim()}%`);
      idx++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM users u ${whereStr}`;
    const countRes = await query<{ total: string }>(countSql, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const itemsSql = `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone_number,
        u.role,
        u.account_status,
        u.profile_image,
        u.created_at,
        u.updated_at,
        (SELECT COUNT(*) FROM businesses b WHERE b.owner_id = u.id) as businesses_count,
        (SELECT COUNT(*) FROM inquiries i WHERE i.user_id = u.id) as submitted_inquiries_count
      FROM users u
      ${whereStr}
      ORDER BY u.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(limit, offset);

    const itemsRes = await query(itemsSql, values);

    return {
      items: itemsRes.rows,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateUser(
    id: string,
    data: { status?: 'active' | 'suspended' | 'pending'; role?: 'user' | 'admin' }
  ): Promise<UserRecord | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.status) {
      updates.push(`account_status = $${idx++}`);
      values.push(data.status);
    }
    if (data.role) {
      updates.push(`role = $${idx++}`);
      values.push(data.role);
    }

    if (updates.length === 0) {
      const res = await query<UserRecord>('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    }

    values.push(id);
    const sql = `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING *
    `;
    const res = await query<UserRecord>(sql, values);
    return res.rows[0] || null;
  }

  async getInquiries(options: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: any[]; total: number; totalPages: number }> {
    const page = Math.max(options.page || 1, 1);
    const limit = Math.min(Math.max(options.limit || 15, 1), 50);
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (options.status && options.status !== 'all') {
      whereClauses.push(`i.status = $${idx++}`);
      values.push(options.status);
    }

    if (options.search) {
      whereClauses.push(`(i.customer_name ILIKE $${idx} OR i.customer_email ILIKE $${idx} OR i.subject ILIKE $${idx} OR b.name ILIKE $${idx})`);
      values.push(`%${options.search.trim()}%`);
      idx++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total
      FROM inquiries i
      INNER JOIN businesses b ON i.business_id = b.id
      ${whereStr}
    `;
    const countRes = await query<{ total: string }>(countSql, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const itemsSql = `
      SELECT
        i.*,
        b.name as business_name,
        b.slug as business_slug,
        p.name as product_name,
        s.name as service_name
      FROM inquiries i
      INNER JOIN businesses b ON i.business_id = b.id
      LEFT JOIN products p ON i.product_id = p.id
      LEFT JOIN services s ON i.service_id = s.id
      ${whereStr}
      ORDER BY i.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(limit, offset);

    const itemsRes = await query(itemsSql, values);

    return {
      items: itemsRes.rows,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getCategories(): Promise<any[]> {
    const sql = `
      SELECT
        c.*,
        (SELECT COUNT(*) FROM businesses b WHERE b.primary_category_id = c.id) as businesses_count
      FROM categories c
      ORDER BY c.display_order ASC, c.name ASC
    `;
    const res = await query(sql);
    return res.rows;
  }

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    iconName?: string;
    imageUrl?: string;
    isActive?: boolean;
    displayOrder?: number;
  }): Promise<CategoryRecord> {
    const res = await query<CategoryRecord>(
      `
      INSERT INTO categories (name, slug, description, icon_name, image_url, is_active, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        data.name,
        data.slug,
        data.description || null,
        data.iconName || null,
        data.imageUrl || null,
        data.isActive ?? true,
        data.displayOrder || 0,
      ]
    );
    return res.rows[0];
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      iconName?: string;
      imageUrl?: string;
      isActive?: boolean;
      displayOrder?: number;
    }
  ): Promise<CategoryRecord | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.slug !== undefined) {
      updates.push(`slug = $${idx++}`);
      values.push(data.slug);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(data.description || null);
    }
    if (data.iconName !== undefined) {
      updates.push(`icon_name = $${idx++}`);
      values.push(data.iconName || null);
    }
    if (data.imageUrl !== undefined) {
      updates.push(`image_url = $${idx++}`);
      values.push(data.imageUrl || null);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${idx++}`);
      values.push(data.isActive);
    }
    if (data.displayOrder !== undefined) {
      updates.push(`display_order = $${idx++}`);
      values.push(data.displayOrder);
    }

    if (updates.length === 0) {
      const res = await query<CategoryRecord>('SELECT * FROM categories WHERE id = $1', [id]);
      return res.rows[0] || null;
    }

    values.push(id);
    const sql = `
      UPDATE categories
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING *
    `;
    const res = await query<CategoryRecord>(sql, values);
    return res.rows[0] || null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const res = await query('DELETE FROM categories WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}

export const adminRepository = new AdminRepository();
