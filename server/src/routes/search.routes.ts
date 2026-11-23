import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Public multi-entity search endpoint
router.get('/', asyncHandler((req, res, next) => searchController.search(req, res, next)));

export default router;
