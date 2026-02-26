import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load env vars from either:
// - process.cwd()/.env (when running inside backend/)
// - backend/.env (when running from repo root)
const cwdEnvPath = path.resolve(process.cwd(), '.env');
const backendEnvPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: cwdEnvPath });
if (!process.env.DATABASE_URL && !process.env.JWT_SECRET) {
  dotenv.config({ path: backendEnvPath });
}

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('24h'), // Changed to accept string format like "24h", "7d", etc.
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().default('100'),
  CORS_ORIGIN: z.string().default('*'),
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
});

if (!parsed.success) {
  const missingKeys = parsed.error.issues
    .map((i) => i.path?.[0])
    .filter(Boolean)
    .join(', ');

  // eslint-disable-next-line no-console
  console.error(
    [
      '❌ Backend env validation failed.',
      `Missing/invalid: ${missingKeys || 'unknown'}`,
      `Looked for env files at:`,
      `- ${cwdEnvPath}`,
      `- ${backendEnvPath}`,
      `Create backend/.env (see backend/ENV_SETUP.md) and restart.`,
    ].join('\n')
  );

  throw parsed.error;
}

const env = parsed.data;

export const {
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  NODE_ENV,
  PORT,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  CORS_ORIGIN,
} = env;

export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_TEST = NODE_ENV === 'test';

