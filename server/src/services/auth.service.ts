import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { userRepository, UserRecord } from '../repositories/user.repository';
import { tokenRepository } from '../repositories/token.repository';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '../utils/token';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from '../validators/auth.validator';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface SafeUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  profileImage: string | null;
  accountStatus: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export function formatSafeUser(user: UserRecord): SafeUser {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phoneNumber: user.phone_number,
    profileImage: user.profile_image,
    accountStatus: user.account_status,
    role: user.role,
    createdAt: user.created_at,
  };
}

export class AuthService {
  async register(
    input: RegisterInput,
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      const error: any = new Error('An account with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await userRepository.createUser({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      phoneNumber: input.phoneNumber,
      profileImage: input.profileImage,
      role: 'user', // Default role; single account acts as buyer & business owner
    });

    const tokens = await this.issueTokenPair(user, clientInfo);

    return {
      user: formatSafeUser(user),
      tokens,
    };
  }

  async login(
    input: LoginInput,
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (user.account_status !== 'active') {
      const error: any = new Error(`Account is currently ${user.account_status}. Please contact support.`);
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await bcrypt.compare(input.password, user.password_hash);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const tokens = await this.issueTokenPair(user, clientInfo);

    return {
      user: formatSafeUser(user),
      tokens,
    };
  }

  /**
   * Refresh token rotation with reuse detection
   */
  async refreshToken(
    rawRefreshToken: string,
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    if (!rawRefreshToken) {
      const error: any = new Error('Refresh token is required');
      error.statusCode = 401;
      throw error;
    }

    const tokenHash = hashToken(rawRefreshToken);
    const tokenRecord = await tokenRepository.findByTokenHash(tokenHash);

    if (!tokenRecord) {
      const error: any = new Error('Invalid or unrecognized refresh token');
      error.statusCode = 401;
      throw error;
    }

    // Reuse detection: If token is already revoked, an attacker or compromise occurred!
    if (tokenRecord.is_revoked) {
      await tokenRepository.revokeAllUserTokens(tokenRecord.user_id);
      const error: any = new Error('Refresh token reuse detected. All active sessions have been revoked for your security.');
      error.statusCode = 403;
      throw error;
    }

    // Check expiration
    if (new Date() > new Date(tokenRecord.expires_at)) {
      await tokenRepository.revokeToken(tokenRecord.id);
      const error: any = new Error('Refresh token has expired. Please sign in again.');
      error.statusCode = 401;
      throw error;
    }

    const user = await userRepository.findById(tokenRecord.user_id);
    if (!user || user.account_status !== 'active') {
      const error: any = new Error('User account is suspended or no longer exists');
      error.statusCode = 403;
      throw error;
    }

    // Issue new pair & rotate
    const tokens = await this.issueTokenPair(user, clientInfo);

    // Mark previous token as revoked and replaced
    const newTokenHash = hashToken(tokens.refreshToken);
    const newRecord = await tokenRepository.findByTokenHash(newTokenHash);
    await tokenRepository.revokeToken(tokenRecord.id, newRecord?.id);

    return {
      user: formatSafeUser(user),
      tokens,
    };
  }

  async logout(rawRefreshToken?: string): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      const tokenRecord = await tokenRepository.findByTokenHash(tokenHash);
      if (tokenRecord) {
        await tokenRepository.revokeToken(tokenRecord.id);
      }
    }
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<boolean> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      // Return true to prevent email enumeration
      return true;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepository.setResetPasswordToken(user.email, resetToken, expiresAt);

    // In production, send email with reset link. In dev, log for verification:
    console.log(`[Dev Password Reset] Token for ${user.email}: ${resetToken}`);
    return true;
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const user = await userRepository.findByResetToken(input.token);
    if (!user) {
      const error: any = new Error('Invalid or expired password reset token');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.newPassword, salt);

    await userRepository.updatePassword(user.id, passwordHash);
    // Revoke all existing sessions so old tokens cannot be used
    await tokenRepository.revokeAllUserTokens(user.id);
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return formatSafeUser(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<SafeUser> {
    const updated = await userRepository.updateProfile(userId, {
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      profileImage: input.profileImage,
    });
    if (!updated) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return formatSafeUser(updated);
  }

  private async issueTokenPair(
    user: UserRecord,
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<AuthTokens> {
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await tokenRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: '15m',
    };
  }
}

export const authService = new AuthService();
