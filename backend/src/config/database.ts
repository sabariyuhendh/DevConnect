import { PrismaClient } from '@prisma/client';
import { IS_DEVELOPMENT, IS_PRODUCTION } from './env';

// Singleton pattern: Create a single Prisma Client instance
const prisma = new PrismaClient({
  log: IS_DEVELOPMENT 
    ? ['query', 'error', 'warn']  // Detailed logging in development
    : ['error'],                    // Only errors in production
});

// Connection lifecycle handling
// Handle graceful shutdown
const gracefulShutdown = async () => {
  try {
    await prisma.$disconnect();
    console.log('Prisma Client disconnected gracefully');
    process.exit(0);
  } catch (error) {
    console.error('Error disconnecting Prisma Client:', error);
    process.exit(1);
  }
};

// Listen for process termination signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', async (error) => {
  console.error('Unhandled rejection:', error);
  await gracefulShutdown();
});

// Test database connection on startup (optional but recommended)
prisma.$connect()
  .then(() => {
    if (IS_DEVELOPMENT) {
      console.log('✅ Database connection established');
    }
  })
  .catch((error: unknown) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Export the singleton instance
export { prisma };
export default prisma;