import { Router } from 'express';
import { inquiryController } from '../controllers/inquiry.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';
import { requireBusinessMember } from '../middlewares/business-auth.middleware';
import { inquiryLimiter } from '../middlewares/rate-limit.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// 1. Submit Inquiry (Public / Guest & Authenticated with Rate Limiting)
router.post(
  '/',
  inquiryLimiter,
  optionalAuthenticate,
  asyncHandler((req, res, next) => inquiryController.submit(req, res, next))
);

// 2. Customer Inquiries History (Authenticated)
router.get(
  '/my-inquiries',
  authenticate,
  asyncHandler((req, res, next) => inquiryController.getMyInquiries(req, res, next))
);

// 3. Business Inquiries Inbox (Authenticated + requires 'staff' role or above)
router.get(
  '/business/:businessId',
  authenticate,
  requireBusinessMember('staff'),
  asyncHandler((req, res, next) => inquiryController.getBusinessInquiries(req, res, next))
);

// 4. Update Business Inquiry Status (Authenticated + requires 'staff' role or above)
router.patch(
  '/business/:businessId/:id/status',
  authenticate,
  requireBusinessMember('staff'),
  asyncHandler((req, res, next) => inquiryController.updateStatus(req, res, next))
);

// 5. Single Inquiry Details
router.get(
  '/:id',
  authenticate,
  asyncHandler((req, res, next) => inquiryController.getById(req, res, next))
);

export default router;
