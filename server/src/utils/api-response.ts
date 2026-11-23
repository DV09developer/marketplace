import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode = 200,
  meta?: ApiResponse['meta']
): Response {
  const responsePayload: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(responsePayload);
}

export function sendError(
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  error?: string,
  errors?: Record<string, string[]>
): Response {
  const responsePayload: ApiResponse = {
    success: false,
    message,
    error,
    errors,
  };
  return res.status(statusCode).json(responsePayload);
}
