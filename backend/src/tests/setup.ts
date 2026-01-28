import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Ensure we have a test database URL
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set, using default test database');
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/devconnect_test';
}

// Set test timeout
jest.setTimeout(30000);