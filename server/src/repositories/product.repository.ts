import { query, pool } from '../config/database';

export interface ProductRecord {
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
  price: number | null;
  currency: string;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
  status_reason: string | null;
  is_featured: boolean;
  view_count: number;
  images?: string[];
  created_at: Date;
  updated_at: Date;
}

export class ProductRepository {
  async createProduct(data: {
    businessId: string;
    categoryId?: string;
    name: string;
    slug: string;
    description: string;
    price?: number;
    currency?: string;
    status?: string;
    isFeatured?: boolean;
    images?: string[];
  }): Promise<ProductRecord> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const productRes = await client.query<ProductRecord>(
        `
        INSERT INTO products (
          business_id, category_id, name, slug, description, price, currency, status, is_featured
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        `,
        [
          data.businessId,
          data.categoryId || null,
          data.name,
          data.slug,
          data.description,
          data.price || null,
          data.currency || 'INR',
          data.status || 'published',
          data.isFeatured || false,
        ]
      );

      const product = productRes.rows[0];

      if (data.images && data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
          await client.query(
            `
            INSERT INTO product_images (product_id, image_url, display_order, is_primary)
            VALUES ($1, $2, $3, $4)
            `,
            [product.id, data.images[i], i, i === 0]
          );
        }
      }

      await client.query('COMMIT');
      product.images = data.images || [];
      return product;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<ProductRecord | null> {
    const result = await query<ProductRecord>(
      `
      SELECT p.*, c.name as category_name, b.name as business_name, b.slug as business_slug, b.city,
        COALESCE(
          (SELECT json_agg(image_url ORDER BY display_order ASC) FROM product_images WHERE product_id = p.id),
          '[]'::json
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      INNER JOIN businesses b ON p.business_id = b.id
      WHERE p.id = $1
      `,
      [id]
    );
    return result.rows[0] || null;
  }

  async findBySlug(businessId: string, slug: string): Promise<ProductRecord | null> {
    const result = await query<ProductRecord>(
      'SELECT * FROM products WHERE business_id = $1 AND slug = $2',
      [businessId, slug]
    );
    return result.rows[0] || null;
  }

  async findBusinessProducts(businessId: string): Promise<ProductRecord[]> {
    const result = await query<ProductRecord>(
      `
      SELECT p.*, c.name as category_name,
        COALESCE(
          (SELECT json_agg(image_url ORDER BY display_order ASC) FROM product_images WHERE product_id = p.id),
          '[]'::json
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.business_id = $1
      ORDER BY p.created_at DESC
      `,
      [businessId]
    );
    return result.rows;
  }

  async updateProduct(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      categoryId: string;
      price: number;
      currency: string;
      status: string;
      isFeatured: boolean;
      images: string[];
    }>
  ): Promise<ProductRecord | null> {
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
      if (data.price !== undefined) {
        updates.push(`price = $${idx++}`);
        values.push(data.price || null);
      }
      if (data.currency !== undefined) {
        updates.push(`currency = $${idx++}`);
        values.push(data.currency);
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
          UPDATE products
          SET ${updates.join(', ')}, updated_at = NOW()
          WHERE id = $${idx}
          `,
          values
        );
      }

      if (data.images !== undefined) {
        await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
        for (let i = 0; i < data.images.length; i++) {
          await client.query(
            `
            INSERT INTO product_images (product_id, image_url, display_order, is_primary)
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

  async deleteProduct(id: string): Promise<boolean> {
    const result = await query('DELETE FROM products WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async findFeatured(limit = 8): Promise<ProductRecord[]> {
    const result = await query<ProductRecord>(
      `
      SELECT p.*, c.name as category_name, b.name as business_name, b.slug as business_slug, b.city,
        COALESCE(
          (SELECT json_agg(image_url ORDER BY display_order ASC) FROM product_images WHERE product_id = p.id),
          '[]'::json
        ) as images
      FROM products p
      INNER JOIN businesses b ON p.business_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE b.status = 'approved' AND p.status = 'published'
      ORDER BY p.is_featured DESC, p.created_at DESC
      LIMIT $1
      `,
      [limit]
    );
    return result.rows;
  }
}

export const productRepository = new ProductRepository();
