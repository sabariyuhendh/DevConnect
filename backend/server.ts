import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { NODE_ENV, CORS_ORIGIN } from './config/env';
import { AppError } from './src/utils/errors';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

// Import routes
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import profileRoutes from './routes/profileRoutes';
import jobRoutes from './routes/jobRoutes';
import eventRoutes from './routes/eventRoutes';

const app = express();

// Development logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(helmet());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
import { globalErrorHandler } from './src/utils/errors';
app.use(globalErrorHandler);

// Implementation removed — server bootstrap will be reimplemented by the user.
