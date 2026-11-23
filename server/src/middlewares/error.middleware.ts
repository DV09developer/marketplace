import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/api-response';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Unhandled Application Error:', err);

  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const field = issue.path.join('.') || 'root';
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(issue.message);
    }
    sendError(res, 'Validation failed', 400, 'ZodValidationError', formattedErrors);
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  const errorName = env.NODE_ENV === 'development' ? err.stack : err.name || 'InternalError';

  sendError(res, message, statusCode, errorName);
}
