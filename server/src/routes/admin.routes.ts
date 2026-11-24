import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Protect ALL admin routes with Authentication and Role=admin check
router.use(authenticate, requireRole('admin'));

// Platform KPI Metrics
router.get('/metrics', asyncHandler((req, res, next) => adminController.getMetrics(req, res, next)));

// Businesses Moderation Queue
router.get('/businesses', asyncHandler((req, res, next) => adminController.getBusinesses(req, res, next)));
router.patch('/businesses/:id/status', asyncHandler((req, res, next) => adminController.updateBusinessStatus(req, res, next)));

// Users Governance
router.get('/users', asyncHandler((req, res, next) => adminController.getUsers(req, res, next)));
router.patch('/users/:id/status', asyncHandler((req, res, next) => adminController.updateUserStatus(req, res, next)));

// Platform Inquiries Audit
router.get('/inquiries', asyncHandler((req, res, next) => adminController.getInquiries(req, res, next)));

// Categories Management
router.get('/categories', asyncHandler((req, res, next) => adminController.getCategories(req, res, next)));
router.post('/categories', asyncHandler((req, res, next) => adminController.createCategory(req, res, next)));
router.put('/categories/:id', asyncHandler((req, res, next) => adminController.updateCategory(req, res, next)));
router.delete('/categories/:id', asyncHandler((req, res, next) => adminController.deleteCategory(req, res, next)));

export default router;
