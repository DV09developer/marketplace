import { query } from '../config/database';

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export class CategoryRepository {
  async findAllActive(): Promise<CategoryRecord[]> {
    const result = await query<CategoryRecord>(
      `
      SELECT * FROM categories
      WHERE is_active = TRUE
      ORDER BY display_order ASC, name ASC
      `
    );
    return result.rows;
  }

  async findById(id: string): Promise<CategoryRecord | null> {
    const result = await query<CategoryRecord>(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findBySlug(slug: string): Promise<CategoryRecord | null> {
    const result = await query<CategoryRecord>(
      'SELECT * FROM categories WHERE slug = $1',
      [slug]
    );
    return result.rows[0] || null;
  }
}

export const categoryRepository = new CategoryRepository();
