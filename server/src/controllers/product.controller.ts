import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { sendSuccess } from '../utils/api-response';

export class ProductController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = req.params.businessId || req.body.businessId;
      const validated = createProductSchema.parse(req.body);
      const product = await productService.createProduct(businessId, validated);
      sendSuccess(res, { product }, 'Product published successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getBusinessProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getBusinessProducts(req.params.businessId);
      sendSuccess(res, { products }, 'Business products retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProductById(req.params.id);
      sendSuccess(res, { product });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateProductSchema.parse(req.body);
      const product = await productService.updateProduct(req.params.id, validated);
      sendSuccess(res, { product }, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await productService.deleteProduct(req.params.id);
      sendSuccess(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
      const products = await productService.getFeaturedProducts(limit);
      sendSuccess(res, { products }, 'Featured products retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
