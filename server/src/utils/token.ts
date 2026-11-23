import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

/**
 * Generate a short-lived JWT Access Token
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Generate a cryptographically secure random Refresh Token
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

/**
 * Compute SHA-256 hash of a token for secure database storage
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a JWT Access Token
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
