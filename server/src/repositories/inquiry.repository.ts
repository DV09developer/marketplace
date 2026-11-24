import { query } from '../config/database';

export interface InquiryRecord {
  id: string;
  business_id: string;
  user_id: string | null;
  product_id: string | null;
  service_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subject: string;
  message: string;
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
  business_notes: string | null;
  business_name?: string;
  business_slug?: string;
  business_email?: string;
  business_phone?: string;
  product_name?: string;
  service_name?: string;
  created_at: Date;
  updated_at: Date;
}

export class InquiryRepository {
  async createInquiry(data: {
    businessId: string;
    userId?: string;
    productId?: string;
    serviceId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    subject: string;
    message: string;
  }): Promise<InquiryRecord> {
    const result = await query<InquiryRecord>(
      `
      INSERT INTO inquiries (
        business_id, user_id, product_id, service_id,
        customer_name, customer_email, customer_phone,
        subject, message, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new')
      RETURNING *
      `,
      [
        data.businessId,
        data.userId || null,
        data.productId || null,
        data.serviceId || null,
        data.customerName,
        data.customerEmail,
        data.customerPhone,
        data.subject,
        data.message,
      ]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<InquiryRecord | null> {
    const result = await query<InquiryRecord>(
      `
      SELECT i.*,
        b.name as business_name, b.slug as business_slug, b.email as business_email, b.contact_number as business_phone,
        p.name as product_name,
        s.name as service_name
      FROM inquiries i
      INNER JOIN businesses b ON i.business_id = b.id
      LEFT JOIN products p ON i.product_id = p.id
      LEFT JOIN services s ON i.service_id = s.id
      WHERE i.id = $1
      `,
      [id]
    );
    return result.rows[0] || null;
  }

  async findBusinessInquiries(
    businessId: string,
    options: {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ items: InquiryRecord[]; total: number; totalPages: number }> {
    const page = Math.max(options.page || 1, 1);
    const limit = Math.min(Math.max(options.limit || 15, 1), 50);
    const offset = (page - 1) * limit;

    const whereClauses: string[] = ['i.business_id = $1'];
    const values: any[] = [businessId];
    let idx = 2;

    if (options.status && options.status !== 'all') {
      whereClauses.push(`i.status = $${idx++}`);
      values.push(options.status);
    }

    if (options.search) {
      whereClauses.push(`(i.customer_name ILIKE $${idx} OR i.customer_email ILIKE $${idx} OR i.subject ILIKE $${idx})`);
      values.push(`%${options.search.trim()}%`);
      idx++;
    }

    const whereStr = whereClauses.join(' AND ');

    const countSql = `SELECT COUNT(*) as total FROM inquiries i WHERE ${whereStr}`;
    const countRes = await query<{ total: string }>(countSql, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const itemsSql = `
      SELECT i.*,
        p.name as product_name,
        s.name as service_name
      FROM inquiries i
      LEFT JOIN products p ON i.product_id = p.id
      LEFT JOIN services s ON i.service_id = s.id
      WHERE ${whereStr}
      ORDER BY i.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(limit, offset);

    const itemsRes = await query<InquiryRecord>(itemsSql, values);

    return {
      items: itemsRes.rows,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findUserInquiries(
    userId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<{ items: InquiryRecord[]; total: number; totalPages: number }> {
    const page = Math.max(options.page || 1, 1);
    const limit = Math.min(Math.max(options.limit || 15, 1), 50);
    const offset = (page - 1) * limit;

    const countRes = await query<{ total: string }>(
      'SELECT COUNT(*) as total FROM inquiries WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const result = await query<InquiryRecord>(
      `
      SELECT i.*,
        b.name as business_name, b.slug as business_slug, b.city,
        p.name as product_name,
        s.name as service_name
      FROM inquiries i
      INNER JOIN businesses b ON i.business_id = b.id
      LEFT JOIN products p ON i.product_id = p.id
      LEFT JOIN services s ON i.service_id = s.id
      WHERE i.user_id = $1
      ORDER BY i.created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );

    return {
      items: result.rows,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateStatus(
    id: string,
    status: string,
    businessNotes?: string
  ): Promise<InquiryRecord | null> {
    const result = await query<InquiryRecord>(
      `
      UPDATE inquiries
      SET status = $1, business_notes = COALESCE($2, business_notes), updated_at = NOW()
      WHERE id = $3
      RETURNING *
      `,
      [status, businessNotes || null, id]
    );
    return result.rows[0] || null;
  }
}

export const inquiryRepository = new InquiryRepository();
