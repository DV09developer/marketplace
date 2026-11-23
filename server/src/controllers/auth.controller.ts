import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator';
import { sendSuccess, sendError } from '../utils/api-response';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const clientInfo = {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.register(validated, clientInfo);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_COOKIE_MAX_AGE,
      });
      res.cookie('accessToken', result.tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_COOKIE_MAX_AGE,
      });

      sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
        'Registration successful. Welcome to the marketplace!',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const clientInfo = {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.login(validated, clientInfo);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_COOKIE_MAX_AGE,
      });
      res.cookie('accessToken', result.tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_COOKIE_MAX_AGE,
      });

      sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
        'Login successful.'
      );
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      const clientInfo = {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.refreshToken(token, clientInfo);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_COOKIE_MAX_AGE,
      });
      res.cookie('accessToken', result.tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_COOKIE_MAX_AGE,
      });

      sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
        'Token refreshed successfully.'
      );
    } catch (error) {
      res.clearCookie('refreshToken', COOKIE_OPTIONS);
      res.clearCookie('accessToken', COOKIE_OPTIONS);
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      await authService.logout(token);

      res.clearCookie('refreshToken', COOKIE_OPTIONS);
      res.clearCookie('accessToken', COOKIE_OPTIONS);

      sendSuccess(res, null, 'Logged out successfully.');
    } catch (error) {
      res.clearCookie('refreshToken', COOKIE_OPTIONS);
      res.clearCookie('accessToken', COOKIE_OPTIONS);
      sendSuccess(res, null, 'Logged out successfully.');
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(validated);
      sendSuccess(
        res,
        null,
        'If an account exists with that email, a password reset link has been dispatched.'
      );
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(validated);
      sendSuccess(res, null, 'Password reset successfully. You may now sign in.');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const user = await authService.getProfile(req.user.userId);
      sendSuccess(res, { user }, 'User profile retrieved.');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const validated = updateProfileSchema.parse(req.body);
      const user = await authService.updateProfile(req.user.userId, validated);
      sendSuccess(res, { user }, 'Profile updated successfully.');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
