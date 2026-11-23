import { query } from '../config/database';

export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  is_revoked: boolean;
  replaced_by_token_id: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: Date;
}

export class TokenRepository {
  async createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<RefreshTokenRecord> {
    const result = await query<RefreshTokenRecord>(
      `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        data.userId,
        data.tokenHash,
        data.expiresAt,
        data.userAgent || null,
        data.ipAddress || null,
      ]
    );
    return result.rows[0];
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const result = await query<RefreshTokenRecord>(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1',
      [tokenHash]
    );
    return result.rows[0] || null;
  }

  async revokeToken(id: string, replacedByTokenId?: string): Promise<void> {
    await query(
      `
      UPDATE refresh_tokens
      SET is_revoked = TRUE, replaced_by_token_id = $1
      WHERE id = $2
      `,
      [replacedByTokenId || null, id]
    );
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await query(
      `
      UPDATE refresh_tokens
      SET is_revoked = TRUE
      WHERE user_id = $1
      `,
      [userId]
    );
  }
}

export const tokenRepository = new TokenRepository();
