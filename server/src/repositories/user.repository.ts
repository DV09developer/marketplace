import { query } from '../config/database';

export interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  password_hash: string;
  profile_image: string | null;
  account_status: 'active' | 'suspended' | 'pending';
  role: 'user' | 'admin';
  reset_password_token: string | null;
  reset_password_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class UserRepository {
  async findById(id: string): Promise<UserRecord | null> {
    const result = await query<UserRecord>('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await query<UserRecord>('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return result.rows[0] || null;
  }

  async createUser(data: {
    fullName: string;
    email: string;
    passwordHash: string;
    phoneNumber?: string;
    profileImage?: string;
    role?: 'user' | 'admin';
  }): Promise<UserRecord> {
    const result = await query<UserRecord>(
      `
      INSERT INTO users (full_name, email, password_hash, phone_number, profile_image, role, account_status)
      VALUES ($1, LOWER($2), $3, $4, $5, $6, 'active')
      RETURNING *
      `,
      [
        data.fullName,
        data.email,
        data.passwordHash,
        data.phoneNumber || null,
        data.profileImage || null,
        data.role || 'user',
      ]
    );
    return result.rows[0];
  }

  async updateProfile(
    id: string,
    data: {
      fullName?: string;
      phoneNumber?: string;
      profileImage?: string;
    }
  ): Promise<UserRecord | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.fullName !== undefined) {
      updates.push(`full_name = $${idx++}`);
      values.push(data.fullName);
    }
    if (data.phoneNumber !== undefined) {
      updates.push(`phone_number = $${idx++}`);
      values.push(data.phoneNumber || null);
    }
    if (data.profileImage !== undefined) {
      updates.push(`profile_image = $${idx++}`);
      values.push(data.profileImage || null);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING *
    `;

    const result = await query<UserRecord>(sql, values);
    return result.rows[0] || null;
  }

  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const result = await query(
      `
      UPDATE users
      SET password_hash = $1, reset_password_token = NULL, reset_password_expires_at = NULL, updated_at = NOW()
      WHERE id = $2
      `,
      [passwordHash, id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async setResetPasswordToken(email: string, token: string, expiresAt: Date): Promise<boolean> {
    const result = await query(
      `
      UPDATE users
      SET reset_password_token = $1, reset_password_expires_at = $2, updated_at = NOW()
      WHERE LOWER(email) = LOWER($3)
      `,
      [token, expiresAt, email]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async findByResetToken(token: string): Promise<UserRecord | null> {
    const result = await query<UserRecord>(
      `
      SELECT * FROM users
      WHERE reset_password_token = $1 AND reset_password_expires_at > NOW()
      `,
      [token]
    );
    return result.rows[0] || null;
  }
}

export const userRepository = new UserRepository();
