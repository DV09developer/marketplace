import { Request, Response, NextFunction } from 'express';
import { searchRepository } from '../repositories/search.repository';
import { sendSuccess } from '../utils/api-response';

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { keyword, city, categoryId, type, page, limit } = req.query;

      const result = await searchRepository.search({
        keyword: keyword ? String(keyword) : undefined,
        city: city ? String(city) : undefined,
        categoryId: categoryId ? String(categoryId) : undefined,
        type: (type as any) || 'all',
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 12,
      });

      sendSuccess(
        res,
        { items: result.items },
        'Search results retrieved successfully',
        200,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        }
      );
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
