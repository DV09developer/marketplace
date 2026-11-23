import { Request, Response, NextFunction } from 'express';
import { businessService } from '../services/business.service';
import {
  createBusinessSchema,
  updateBusinessSchema,
  updateBusinessStatusSchema,
  addBusinessMemberSchema,
} from '../validators/business.validator';
import { sendSuccess, sendError } from '../utils/api-response';

export class BusinessController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const validated = createBusinessSchema.parse(req.body);
      const business = await businessService.createBusiness(req.user.userId, validated);
      sendSuccess(
        res,
        { business },
        'Business created successfully and submitted for admin review.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async getMyBusinesses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const businesses = await businessService.getMyBusinesses(req.user.userId);
      sendSuccess(res, { businesses }, 'Businesses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const business = await businessService.getBusinessById(
        req.params.id,
        req.user?.userId,
        req.user?.role === 'admin'
      );
      sendSuccess(res, { business });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const business = await businessService.getBusinessBySlug(
        req.params.slug,
        req.user?.userId,
        req.user?.role === 'admin'
      );
      sendSuccess(res, { business });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateBusinessSchema.parse(req.body);
      const business = await businessService.updateBusiness(req.params.id, validated);
      sendSuccess(res, { business }, 'Business details updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateBusinessStatusSchema.parse(req.body);
      const business = await businessService.updateStatus(req.params.id, validated);
      sendSuccess(
        res,
        { business },
        `Business status successfully set to '${validated.status}'`
      );
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const members = await businessService.listMembers(req.params.id);
      sendSuccess(res, { members }, 'Business members retrieved');
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = addBusinessMemberSchema.parse(req.body);
      const member = await businessService.addMember(req.params.id, validated);
      sendSuccess(res, { member }, 'Team member added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await businessService.removeMember(req.params.id, req.params.userId);
      sendSuccess(res, null, 'Team member removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const businessController = new BusinessController();
