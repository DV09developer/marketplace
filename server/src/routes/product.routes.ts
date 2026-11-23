import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireBusinessMember } from '../middlewares/business-auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Featured products for homepage
router.get('/featured', asyncHandler((req, res, next) => productController.getFeatured(req, res, next)));

// Business specific products
router.get('/business/:businessId', asyncHandler((req, res, next) => productController.getBusinessProducts(req, res, next)));
router.post(
  '/business/:businessId',
  authenticate,
  requireBusinessMember('staff'),
  asyncHandler((req, res, next) => productController.create(req, res, next))
);

// Individual product endpoints
router.get('/:id', asyncHandler((req, res, next) => productController.getById(req, res, next)));
router.put(
  '/:id',
  authenticate,
  asyncHandler((req, res, next) => productController.update(req, res, next))
);
router.delete(
  '/:id',
  authenticate,
  asyncHandler((req, res, next) => productController.delete(req, res, next))
);

export default router;
