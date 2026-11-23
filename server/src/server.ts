import { createApp } from './app';
import { env } from './config/env';
import { pool, checkDatabaseConnection } from './config/database';

async function startServer() {
  const app = createApp();

  const server = app.listen(env.PORT, async () => {
    console.log(`=======================================================`);
    console.log(`🚀 Marketplace Server is running on port ${env.PORT}`);
    console.log(`🌐 Base URL: http://localhost:${env.PORT}`);
    console.log(`🩺 Health check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
    console.log(`=======================================================`);

    // Verify DB connectivity on boot
    const dbStatus = await checkDatabaseConnection();
    if (dbStatus.connected) {
      console.log(`✅ [Database] Connected successfully to PostgreSQL.`);
    } else {
      console.warn(`⚠️ [Database] ${dbStatus.message}`);
    }
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await pool.end();
        console.log('Database pool closed cleanly.');
      } catch (err) {
        console.error('Error closing database pool:', err);
      }
      process.exit(0);
    });

    // Force close if hung
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
