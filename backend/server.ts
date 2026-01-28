import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { CORS_ORIGIN, NODE_ENV, PORT } from './src/config/env';
import { AppError, globalErrorHandler } from './src/utils/errors';
import { WebSocketService } from './src/services/WebSocketService';
import prisma from './src/config/database';

// Import routes
import authRoutes from './src/routes/authRoutes';
import postRoutes from './src/routes/postRoutes';
import profileRoutes from './src/routes/profileRoutes';
import jobRoutes from './src/routes/jobRoutes';
import eventRoutes from './src/routes/eventRoutes';
import messagingRoutes from './src/routes/messagingRoutes';
import userManagementRoutes from './src/routes/userManagement';

const app = express();
const server = createServer(app);

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
app.use('/api', messagingRoutes);
app.use('/api/users', userManagementRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

// Initialize WebSocket service
const webSocketService = new WebSocketService(server, prisma);

const port = Number(PORT) || 3001;
server.listen(port, () => {
  if (NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`✅ DevConnect backend running on http://localhost:${port}`);
    console.log(`✅ WebSocket server ready for connections`);
  }
});

// Export WebSocket service for use in other modules
export { webSocketService };
