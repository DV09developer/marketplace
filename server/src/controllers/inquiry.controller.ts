import { Request, Response, NextFunction } from 'express';
import { inquiryService } from '../services/inquiry.service';
import {
  createInquirySchema,
  updateInquiryStatusSchema,
} from '../validators/inquiry.validator';
import { sendSuccess, sendError } from '../utils/api-response';

export class InquiryController {
  async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createInquirySchema.parse(req.body);
      const userId = req.user?.userId;

      const inquiry = await inquiryService.submitInquiry(validated, userId);

      sendSuccess(
        res,
        { inquiry },
        'Your inquiry was submitted directly to the business. The business representative will contact you shortly.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async getBusinessInquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = req.params.businessId;
      const { status, search, page, limit } = req.query;

      const result = await inquiryService.getBusinessInquiries(businessId, {
        status: status ? String(status) : undefined,
        search: search ? String(search) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 15,
      });

      sendSuccess(res, { inquiries: result.items }, 'Inquiries retrieved', 200, {
        total: result.total,
        totalPages: result.totalPages,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 15,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { businessId, id } = req.params;
      const validated = updateInquiryStatusSchema.parse(req.body);

      const inquiry = await inquiryService.updateInquiryStatus(id, businessId, validated);
      sendSuccess(res, { inquiry }, `Inquiry status changed to '${validated.status}'`);
    } catch (error) {
      next(error);
    }
  }

  async getMyInquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }

      const { page, limit } = req.query;
      const result = await inquiryService.getUserInquiries(req.user.userId, {
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 15,
      });

      sendSuccess(res, { inquiries: result.items }, 'Your inquiries retrieved', 200, {
        total: result.total,
        totalPages: result.totalPages,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 15,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const inquiry = await inquiryService.getInquiryById(
        req.params.id,
        req.user.userId,
        req.user.role
      );
      sendSuccess(res, { inquiry });
    } catch (error) {
      next(error);
    }
  }
}

export const inquiryController = new InquiryController();
