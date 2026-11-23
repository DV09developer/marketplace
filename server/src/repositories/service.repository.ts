import { query, pool } from '../config/database';

export interface ServiceRecord {
  id: string;
  business_id: string;
  category_id: string | null;
  category_name?: string;
  business_name?: string;
  business_slug?: string;
  city?: string;
  name: string;
  slug: string;
  description: string;
  pricing_info: string | null;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
  status_reason: string | null;
  is_featured: boolean;
  view_count: number;
  images?: string[];
  created_at: Date;
  updated_at: Date;
}

export class ServiceRepository {
  async createService(data: {
    businessId: string;
    categoryId?: string;
    name: string;
    slug: string;
    description: string;
    pricingInfo?: string;
    status?: string;
    isFeatured?: boolean;
    images?: string[];
  }): Promise<ServiceRecord> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const serviceRes = await client.query<ServiceRecord>(
        `
        INSERT INTO services (
          business_id, category_id, name, slug, description, pricing_info, status, is_featured
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
          data.businessId,
          data.categoryId || null,
          data.name,
          data.slug,
          data.description,
          data.pricingInfo || null,
          data.status || 'published',
          data.isFeatured || false,
        ]
      );

      const service = serviceRes.rows[0];

      if (data.images && data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
          await client.query(
            `
            INSERT INTO service_images (service_id, image_url, display_order, is_primary)
            VALUES ($1, $2, $3, $4)
            `,
            [service.id, data.images[i], i, i === 0]
          );
        }
      }

      await client.query('COMMIT');
      service.images = data.images || [];
      return service;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<ServiceRecord | null> {
    const result = await query<ServiceRecord>(
      `
      SELECT s.*, c.name as category_name, b.name as business_name, b.slug as business_slug, b.city,
        COALESCE(
          (SELECT json_agg(image_url ORDER BY display_order ASC) FROM service_images WHERE service_id = s.id),
          '[]'::json
        ) as images
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      INNER JOIN businesses b ON s.business_id = b.id
      WHERE s.id = $1
      `,
      [id]
    );
    return result.rows[0] || null;
  }

  async findBySlug(businessId: string, slug: string): Promise<ServiceRecord | null> {
    const result = await query<ServiceRecord>(
      'SELECT * FROM services WHERE business_id = $1 AND slug = $2',
      [businessId, slug]
    );
    return result.rows[0] || null;
  }

  async findBusinessServices(businessId: string): Promise<ServiceRecord[]> {
    const result = await query<ServiceRecord>(
      `
      SELECT s.*, c.name as category_name,
        COALESCE(
          (SELECT json_agg(image_url ORDER BY display_order ASC) FROM service_images WHERE service_id = s.id),
          '[]'::json
        ) as images
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.business_id = $1
      ORDER BY s.created_at DESC
      `,
      [businessId]
    );
    return result.rows;
  }

  async updateService(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      categoryId: string;
      pricingInfo: string;
      status: string;
      isFeatured: boolean;
      images: string[];
    }>
  ): Promise<ServiceRecord | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const updates: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (data.name !== undefined) {
        updates.push(`name = $${idx++}`);
        values.push(data.name);
      }
      if (data.description !== undefined) {
        updates.push(`description = $${idx++}`);
        values.push(data.description);
      }
      if (data.categoryId !== undefined) {
        updates.push(`category_id = $${idx++}`);
        values.push(data.categoryId || null);
      }
      if (data.pricingInfo !== undefined) {
        updates.push(`pricing_info = $${idx++}`);
        values.push(data.pricingInfo || null);
      }
      if (data.status !== undefined) {
        updates.push(`status = $${idx++}`);
        values.push(data.status);
      }
      if (data.isFeatured !== undefined) {
        updates.push(`is_featured = $${idx++}`);
        values.push(data.isFeatured);
      }

      if (updates.length > 0) {
        values.push(id);
        await client.query(
          `
          UPDATE services
          SET ${updates.join(', ')}, updated_at = NOW()
          WHERE id = $${idx}
          `,
          values
        );
      }

      if (data.images !== undefined) {
        await client.query('DELETE FROM service_images WHERE service_id = $1', [id]);
        for (let i = 0; i < data.images.length; i++) {
          await client.query(
            `
            INSERT INTO service_images (service_id, image_url, display_order, is_primary)
            VALUES ($1, $2, $3, $4)
            `,
            [id, data.images[i], i, i === 0]
          );
        }
      }

      await client.query('COMMIT');
      return this.findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await query('DELETE FROM services WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async findFeatured(limit = 8): Promise<ServiceRecord[]> {
    const result = await query<ServiceRecord>(
      `
      SELECT s.*, c.name as category_name, b.name as business_name, b.slug as business_slug, b.city,
        COALESCE(
          (SELECT json_agg(image_url ORDER BY display_order ASC) FROM service_images WHERE service_id = s.id),
          '[]'::json
        ) as images
      FROM services s
      INNER JOIN businesses b ON s.business_id = b.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE b.status = 'approved' AND s.status = 'published'
      ORDER BY s.is_featured DESC, s.created_at DESC
      LIMIT $1
      `,
      [limit]
    );
    return result.rows;
  }
}

export const serviceRepository = new ServiceRepository();
