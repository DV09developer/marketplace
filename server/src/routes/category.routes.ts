import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Public: Get list of active categories
router.get('/', asyncHandler((req, res, next) => categoryController.getCategories(req, res, next)));

export default router;
