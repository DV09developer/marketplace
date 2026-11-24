import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/token';
import { sendError } from '../utils/api-response';
import { userRepository } from '../repositories/user.repository';

// Extend Express Request interface with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { fullName?: string };
    }
  }
}

/**
 * Middleware: Verify JWT access token from Authorization header or cookie
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      sendError(res, 'Authentication required. No access token provided.', 401);
      return;
    }

    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await userRepository.findById(payload.userId);
    if (!user || user.account_status !== 'active') {
      sendError(res, 'User session is invalid or account is suspended.', 401);
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'Access token has expired. Please refresh token.', 401, 'TokenExpired');
      return;
    }
    sendError(res, 'Invalid authentication token.', 401, 'InvalidToken');
  }
}

/**
 * Middleware: Optional authentication. If user token is present and valid, sets req.user.
 * Does not block guests.
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        const user = await userRepository.findById(payload.userId);
        if (user && user.account_status === 'active') {
          req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            fullName: user.full_name,
          };
        }
      } catch {
        // Token invalid or expired - proceed as guest
      }
    }
    next();
  } catch (error) {
    next();
  }
}

/**
 * Middleware: Role-based authorization check
 */
export function requireRole(...allowedRoles: Array<'user' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'Forbidden: Insufficient privileges for this action', 403);
      return;
    }

    next();
  };
}
