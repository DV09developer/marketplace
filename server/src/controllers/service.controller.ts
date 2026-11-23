import { Request, Response, NextFunction } from 'express';
import { serviceService } from '../services/service.service';
import { createServiceSchema, updateServiceSchema } from '../validators/service.validator';
import { sendSuccess } from '../utils/api-response';

export class ServiceController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = req.params.businessId || req.body.businessId;
      const validated = createServiceSchema.parse(req.body);
      const service = await serviceService.createService(businessId, validated);
      sendSuccess(res, { service }, 'Service published successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getBusinessServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await serviceService.getBusinessServices(req.params.businessId);
      sendSuccess(res, { services }, 'Business services retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = await serviceService.getServiceById(req.params.id);
      sendSuccess(res, { service });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateServiceSchema.parse(req.body);
      const service = await serviceService.updateService(req.params.id, validated);
      sendSuccess(res, { service }, 'Service updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await serviceService.deleteService(req.params.id);
      sendSuccess(res, null, 'Service deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
      const services = await serviceService.getFeaturedServices(limit);
      sendSuccess(res, { services }, 'Featured services retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const serviceController = new ServiceController();
