import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireBusinessMember } from '../middlewares/business-auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Featured services for homepage
router.get('/featured', asyncHandler((req, res, next) => serviceController.getFeatured(req, res, next)));

// Business specific services
router.get('/business/:businessId', asyncHandler((req, res, next) => serviceController.getBusinessServices(req, res, next)));
router.post(
  '/business/:businessId',
  authenticate,
  requireBusinessMember('staff'),
  asyncHandler((req, res, next) => serviceController.create(req, res, next))
);

// Individual service endpoints
router.get('/:id', asyncHandler((req, res, next) => serviceController.getById(req, res, next)));
router.put(
  '/:id',
  authenticate,
  asyncHandler((req, res, next) => serviceController.update(req, res, next))
);
router.delete(
  '/:id',
  authenticate,
  asyncHandler((req, res, next) => serviceController.delete(req, res, next))
);

export default router;
