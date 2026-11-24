import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import {
  createCategorySchema,
  updateCategorySchema,
  updateUserStatusSchema,
} from '../validators/admin.validator';
import { updateBusinessStatusSchema } from '../validators/business.validator';
import { sendSuccess } from '../utils/api-response';

export class AdminController {
  async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await adminService.getMetrics();
      sendSuccess(res, { metrics }, 'Platform metrics retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getBusinesses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search, page, limit } = req.query;
      const result = await adminService.getBusinesses({
        status: status ? String(status) : undefined,
        search: search ? String(search) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 15,
      });

      sendSuccess(res, { businesses: result.items }, 'Businesses retrieved', 200, {
        total: result.total,
        totalPages: result.totalPages,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 15,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBusinessStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateBusinessStatusSchema.parse(req.body);
      const business = await adminService.updateBusinessStatus(req.params.id, validated);
      sendSuccess(res, { business }, `Business status updated to '${validated.status}'`);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, role, status, page, limit } = req.query;
      const result = await adminService.getUsers({
        search: search ? String(search) : undefined,
        role: role ? String(role) : undefined,
        status: status ? String(status) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 15,
      });

      sendSuccess(res, { users: result.items }, 'Users retrieved', 200, {
        total: result.total,
        totalPages: result.totalPages,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 15,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateUserStatusSchema.parse(req.body);
      const user = await adminService.updateUserStatus(req.params.id, validated);
      sendSuccess(res, { user }, 'User account status updated');
    } catch (error) {
      next(error);
    }
  }

  async getInquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search, page, limit } = req.query;
      const result = await adminService.getInquiries({
        status: status ? String(status) : undefined,
        search: search ? String(search) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 15,
      });

      sendSuccess(res, { inquiries: result.items }, 'Platform inquiries retrieved', 200, {
        total: result.total,
        totalPages: result.totalPages,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 15,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await adminService.getCategories();
      sendSuccess(res, { categories }, 'Categories retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createCategorySchema.parse(req.body);
      const category = await adminService.createCategory(validated);
      sendSuccess(res, { category }, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateCategorySchema.parse(req.body);
      const category = await adminService.updateCategory(req.params.id, validated);
      sendSuccess(res, { category }, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.deleteCategory(req.params.id);
      sendSuccess(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
