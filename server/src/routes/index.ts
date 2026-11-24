import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import businessRoutes from './business.routes';
import productRoutes from './product.routes';
import serviceRoutes from './service.routes';
import searchRoutes from './search.routes';
import inquiryRoutes from './inquiry.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check endpoint
router.use('/health', healthRoutes);

// Authentication & Profile endpoints
router.use('/auth', authRoutes);

// Category endpoints
router.use('/categories', categoryRoutes);

// Business Management endpoints
router.use('/businesses', businessRoutes);

// Product Catalog endpoints
router.use('/products', productRoutes);

// Service Catalog endpoints
router.use('/services', serviceRoutes);

// Unified Search endpoint
router.use('/search', searchRoutes);

// Direct Customer Inquiry endpoints
router.use('/inquiries', inquiryRoutes);

// Admin Governance & Moderation endpoints
router.use('/admin', adminRoutes);

export default router;
