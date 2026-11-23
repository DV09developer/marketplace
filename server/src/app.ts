import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import apiRoutes from './routes';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';

export function createApp() {
  const app = express();

  // Security middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Parsing middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Logging in development
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Base route for quick verification
  app.get('/', (req, res) => {
    res.json({
      name: 'Justdial-Inspired Business Discovery & Inquiry Marketplace API',
      version: '1.0.0',
      health: `${env.API_PREFIX}/health`,
      docs: `${env.API_PREFIX}/docs`,
    });
  });

  // Mount API routes
  app.use(env.API_PREFIX, apiRoutes);

  // 404 & Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
