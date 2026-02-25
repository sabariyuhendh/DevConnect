"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("./env");
// Singleton pattern: Create a single Prisma Client instance
const prisma = new client_1.PrismaClient({
    log: env_1.IS_DEVELOPMENT
        ? ['query', 'error', 'warn'] // Detailed logging in development
        : ['error'], // Only errors in production
});
exports.prisma = prisma;
// Connection lifecycle handling
// Handle graceful shutdown
const gracefulShutdown = async () => {
    try {
        await prisma.$disconnect();
        console.log('Prisma Client disconnected gracefully');
        process.exit(0);
    }
    catch (error) {
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
    if (env_1.IS_DEVELOPMENT) {
        console.log('✅ Database connection established');
    }
})
    .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
});
exports.default = prisma;
