import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rate-limit.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Public Authentication Endpoints (Rate Limited)
router.post('/register', authLimiter, asyncHandler((req, res, next) => authController.register(req, res, next)));
router.post('/login', authLimiter, asyncHandler((req, res, next) => authController.login(req, res, next)));
router.post('/refresh', asyncHandler((req, res, next) => authController.refresh(req, res, next)));
router.post('/logout', asyncHandler((req, res, next) => authController.logout(req, res, next)));
router.post('/forgot-password', authLimiter, asyncHandler((req, res, next) => authController.forgotPassword(req, res, next)));
router.post('/reset-password', authLimiter, asyncHandler((req, res, next) => authController.resetPassword(req, res, next)));

// Authenticated User Endpoints
router.get('/me', authenticate, asyncHandler((req, res, next) => authController.getMe(req, res, next)));
router.put('/profile', authenticate, asyncHandler((req, res, next) => authController.updateProfile(req, res, next)));

export default router;
