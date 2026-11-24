import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api'),
  CLIENT_URL: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/marketplace'),
  DB_SSL: z.string().default('false').transform((val) => val === 'true'),
  DB_MAX_CONNECTIONS: z.string().default('20').transform((val) => parseInt(val, 10)),
  DB_IDLE_TIMEOUT_MS: z.string().default('30000').transform((val) => parseInt(val, 10)),

  // Auth & JWT
  JWT_SECRET: z.string().default('super_secret_jwt_access_key_min_32_characters_long_12345'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().default('super_secret_refresh_token_key_min_32_characters_long_12345'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // Supabase Storage
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default('marketplace-assets'),

  // Admin Initial Setup
  INITIAL_ADMIN_EMAIL: z.string().email().default('admin@marketplace.com'),
  INITIAL_ADMIN_PASSWORD: z.string().default('AdminSecurePassword123!'),
  INITIAL_ADMIN_NAME: z.string().default('Super Admin'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = {
  ...parsedEnv.data,
  SUPABASE_ANON_KEY: parsedEnv.data.SUPABASE_ANON_KEY || parsedEnv.data.SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: parsedEnv.data.SUPABASE_SERVICE_ROLE_KEY || parsedEnv.data.SUPABASE_SECRET_KEY,
};
