import { Router } from 'express';
import { businessController } from '../controllers/business.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { requireBusinessMember } from '../middlewares/business-auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// 1. My Businesses (Authenticated)
router.get('/my-businesses', authenticate, asyncHandler((req, res, next) => businessController.getMyBusinesses(req, res, next)));

// 2. Create Business (Authenticated)
router.post('/', authenticate, asyncHandler((req, res, next) => businessController.create(req, res, next)));

// 3. Public / Public Slug view (Optionally Authenticated to view pending)
router.get('/slug/:slug', asyncHandler((req, res, next) => businessController.getBySlug(req, res, next)));
router.get('/:id', asyncHandler((req, res, next) => businessController.getById(req, res, next)));

// 4. Update Business (Authenticated + requires 'manager' role or above)
router.put('/:id', authenticate, requireBusinessMember('manager'), asyncHandler((req, res, next) => businessController.update(req, res, next)));

// 5. Admin Business Status Moderation (Approve, Reject, Suspend)
router.patch('/:id/status', authenticate, requireRole('admin'), asyncHandler((req, res, next) => businessController.updateStatus(req, res, next)));

// 6. Business Members Management
router.get('/:id/members', authenticate, requireBusinessMember('manager'), asyncHandler((req, res, next) => businessController.getMembers(req, res, next)));
router.post('/:id/members', authenticate, requireBusinessMember('owner'), asyncHandler((req, res, next) => businessController.addMember(req, res, next)));
router.delete('/:id/members/:userId', authenticate, requireBusinessMember('owner'), asyncHandler((req, res, next) => businessController.removeMember(req, res, next)));

export default router;
