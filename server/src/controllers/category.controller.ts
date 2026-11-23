import { Request, Response, NextFunction } from 'express';
import { categoryRepository } from '../repositories/category.repository';
import { sendSuccess } from '../utils/api-response';

export class CategoryController {
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryRepository.findAllActive();
      sendSuccess(res, { categories }, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
