import { query, pool } from '../config/database';

export interface BusinessRecord {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  email: string;
  contact_number: string;
  whatsapp_number: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_category_id: string | null;
  category_name?: string;
  category_slug?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  website_url: string | null;
  working_hours: Record<string, string> | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  status_reason: string | null;
  is_verified: boolean;
  view_count: number;
  created_at: Date;
  updated_at: Date;
  user_role?: string; // If fetched in user context
}

export interface BusinessMemberRecord {
  id: string;
  business_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'staff';
  full_name: string;
  email: string;
  created_at: Date;
}

export class BusinessRepository {
  async createBusiness(data: {
    ownerId: string;
    name: string;
    slug: string;
    description: string;
    email: string;
    contactNumber: string;
    whatsappNumber?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    primaryCategoryId?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    websiteUrl?: string;
    workingHours?: Record<string, string>;
  }): Promise<BusinessRecord> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert into businesses table
      const businessRes = await client.query<BusinessRecord>(
        `
        INSERT INTO businesses (
          owner_id, name, slug, description, email, contact_number, whatsapp_number,
          logo_url, cover_image_url, primary_category_id, address, city, state, pincode,
          website_url, working_hours, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'pending')
        RETURNING *
        `,
        [
          data.ownerId,
          data.name,
          data.slug,
          data.description,
          data.email,
          data.contactNumber,
          data.whatsappNumber || null,
          data.logoUrl || null,
          data.coverImageUrl || null,
          data.primaryCategoryId || null,
          data.address,
          data.city,
          data.state,
          data.pincode,
          data.websiteUrl || null,
          data.workingHours ? JSON.stringify(data.workingHours) : null,
        ]
      );

      const business = businessRes.rows[0];

      // 2. Add owner as 'owner' in business_members table
      await client.query(
        `
        INSERT INTO business_members (business_id, user_id, role)
        VALUES ($1, $2, 'owner')
        `,
        [business.id, data.ownerId]
      );

      // 3. Link category in business_categories
      if (data.primaryCategoryId) {
        await client.query(
          `
          INSERT INTO business_categories (business_id, category_id, is_primary)
          VALUES ($1, $2, TRUE)
          ON CONFLICT DO NOTHING
          `,
          [business.id, data.primaryCategoryId]
        );
      }

      await client.query('COMMIT');
      return business;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<BusinessRecord | null> {
    const result = await query<BusinessRecord>(
      `
      SELECT b.*, c.name as category_name, c.slug as category_slug
      FROM businesses b
      LEFT JOIN categories c ON b.primary_category_id = c.id
      WHERE b.id = $1
      `,
      [id]
    );
    return result.rows[0] || null;
  }

  async findBySlug(slug: string): Promise<BusinessRecord | null> {
    const result = await query<BusinessRecord>(
      `
      SELECT b.*, c.name as category_name, c.slug as category_slug
      FROM businesses b
      LEFT JOIN categories c ON b.primary_category_id = c.id
      WHERE b.slug = $1
      `,
      [slug]
    );
    return result.rows[0] || null;
  }

  async findUserBusinesses(userId: string): Promise<BusinessRecord[]> {
    const result = await query<BusinessRecord>(
      `
      SELECT b.*, bm.role as user_role, c.name as category_name
      FROM businesses b
      INNER JOIN business_members bm ON b.id = bm.business_id
      LEFT JOIN categories c ON b.primary_category_id = c.id
      WHERE bm.user_id = $1
      ORDER BY b.created_at DESC
      `,
      [userId]
    );
    return result.rows;
  }

  async checkUserMembership(businessId: string, userId: string): Promise<string | null> {
    const result = await query<{ role: string }>(
      `
      SELECT role FROM business_members
      WHERE business_id = $1 AND user_id = $2
      `,
      [businessId, userId]
    );
    return result.rows[0]?.role || null;
  }

  async updateBusiness(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      email: string;
      contactNumber: string;
      whatsappNumber: string;
      logoUrl: string;
      coverImageUrl: string;
      primaryCategoryId: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      websiteUrl: string;
      workingHours: Record<string, string>;
    }>
  ): Promise<BusinessRecord | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const fieldMap: Record<string, string> = {
      name: 'name',
      description: 'description',
      email: 'email',
      contactNumber: 'contact_number',
      whatsappNumber: 'whatsapp_number',
      logoUrl: 'logo_url',
      coverImageUrl: 'cover_image_url',
      primaryCategoryId: 'primary_category_id',
      address: 'address',
      city: 'city',
      state: 'state',
      pincode: 'pincode',
      websiteUrl: 'website_url',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if ((data as any)[key] !== undefined) {
        updates.push(`${col} = $${idx++}`);
        values.push((data as any)[key] || null);
      }
    }

    if (data.workingHours !== undefined) {
      updates.push(`working_hours = $${idx++}`);
      values.push(JSON.stringify(data.workingHours));
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `
      UPDATE businesses
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING *
    `;

    const result = await query<BusinessRecord>(sql, values);
    return result.rows[0] || null;
  }

  async updateStatus(
    businessId: string,
    status: 'pending' | 'approved' | 'rejected' | 'suspended',
    reason?: string
  ): Promise<BusinessRecord | null> {
    const result = await query<BusinessRecord>(
      `
      UPDATE businesses
      SET status = $1, status_reason = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
      `,
      [status, reason || null, businessId]
    );
    return result.rows[0] || null;
  }

  async listBusinessMembers(businessId: string): Promise<BusinessMemberRecord[]> {
    const result = await query<BusinessMemberRecord>(
      `
      SELECT bm.id, bm.business_id, bm.user_id, bm.role, u.full_name, u.email, bm.created_at
      FROM business_members bm
      INNER JOIN users u ON bm.user_id = u.id
      WHERE bm.business_id = $1
      ORDER BY bm.created_at ASC
      `,
      [businessId]
    );
    return result.rows;
  }

  async addBusinessMember(
    businessId: string,
    userId: string,
    role: 'manager' | 'staff'
  ): Promise<BusinessMemberRecord> {
    const result = await query<BusinessMemberRecord>(
      `
      INSERT INTO business_members (business_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (business_id, user_id) DO UPDATE
      SET role = EXCLUDED.role
      RETURNING *
      `,
      [businessId, userId, role]
    );
    return result.rows[0];
  }

  async removeBusinessMember(businessId: string, userId: string): Promise<boolean> {
    const result = await query(
      `
      DELETE FROM business_members
      WHERE business_id = $1 AND user_id = $2 AND role != 'owner'
      `,
      [businessId, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async incrementViewCount(businessId: string): Promise<void> {
    await query(
      'UPDATE businesses SET view_count = view_count + 1 WHERE id = $1',
      [businessId]
    );
  }
}

export const businessRepository = new BusinessRepository();
