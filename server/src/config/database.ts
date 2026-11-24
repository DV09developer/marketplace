import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';

const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  max: env.DB_MAX_CONNECTIONS,
  idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: 5000,
};

// If SSL is enabled or database URL points to Supabase / remote cloud
if (env.DB_SSL || env.DATABASE_URL.includes('supabase.co') || env.DATABASE_URL.includes('pooler.supabase.com')) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export interface DatabaseHealthStatus {
  connected: boolean;
  message: string;
  details?: {
    serverTime?: string;
    version?: string;
    databaseName?: string;
  };
}

/**
 * Execute a parameterized SQL query
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (env.NODE_ENV === 'development') {
      // debug logging can be placed here if desired
    }
    return res;
  } catch (error) {
    console.error('Database query execution error:', { text, error });
    throw error;
  }
}

/**
 * Checks PostgreSQL connection and returns detailed status
 */
export async function checkDatabaseConnection(): Promise<DatabaseHealthStatus> {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW() as current_time, version(), current_database() as db_name');
      return {
        connected: true,
        message: 'Successfully connected to PostgreSQL database.',
        details: {
          serverTime: result.rows[0]?.current_time,
          version: result.rows[0]?.version,
          databaseName: result.rows[0]?.db_name,
        },
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    let errText = err?.message;
    if (!errText && err?.code) {
      errText = `Connection failed (${err.code})`;
    } else if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
      errText = err.errors.map((e: any) => e.message || e.code).join(', ');
    } else if (!errText) {
      errText = String(err);
    }

    return {
      connected: false,
      message: `Database connection unavailable: ${errText}. Please configure valid DATABASE_URL in server/.env`,
    };
  }
}
