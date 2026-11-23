import { Request, Response, NextFunction } from 'express';
import { businessRepository } from '../repositories/business.repository';
import { sendError } from '../utils/api-response';

export type BusinessRole = 'owner' | 'manager' | 'staff';

const roleHierarchy: Record<BusinessRole, number> = {
  staff: 1,
  manager: 2,
  owner: 3,
};

// Extend express Request
declare global {
  namespace Express {
    interface Request {
      businessRole?: BusinessRole;
    }
  }
}

/**
 * Middleware: Verify that authenticated user is a verified member of the target business.
 * Never trusts unverified client business IDs.
 */
export function requireBusinessMember(minRole: BusinessRole = 'staff') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }

      // Administrators have overarching governance permissions
      if (req.user.role === 'admin') {
        req.businessRole = 'owner';
        next();
        return;
      }

      const businessId = req.params.businessId || req.params.id;
      if (!businessId) {
        sendError(res, 'Business ID parameter is missing', 400);
        return;
      }

      const memberRole = (await businessRepository.checkUserMembership(
        businessId,
        req.user.userId
      )) as BusinessRole | null;

      if (!memberRole) {
        sendError(res, 'Forbidden: You do not have permissions for this business', 403);
        return;
      }

      const userRoleRank = roleHierarchy[memberRole] || 0;
      const minRequiredRank = roleHierarchy[minRole];

      if (userRoleRank < minRequiredRank) {
        sendError(
          res,
          `Forbidden: Action requires at least '${minRole}' role in this business`,
          403
        );
        return;
      }

      req.businessRole = memberRole;
      next();
    } catch (error) {
      next(error);
    }
  };
}
