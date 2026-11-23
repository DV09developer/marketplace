import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/database';
import { sendSuccess, sendError } from '../utils/api-response';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();

  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbStatus.connected,
      message: dbStatus.message,
      details: dbStatus.details || null,
    },
  };

  if (!dbStatus.connected) {
    return sendError(
      res,
      'Backend is running, but database connection is pending configuration.',
      503,
      undefined,
      { database: [dbStatus.message] }
    );
  }

  return sendSuccess(res, healthData, 'Marketplace Backend API is healthy and operational');
});

export default router;
