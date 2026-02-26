import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { CORS_ORIGIN, NODE_ENV, PORT } from './src/config/env';
import { AppError, globalErrorHandler } from './src/utils/errors';
import { setupCaveSocket } from './src/websocket/caveSocket';
import { setupFeedSocket } from './src/websocket/feedSocket';

// Import routes
import authRoutes from './src/routes/authRoutes';
import postRoutes from './src/routes/postRoutes';
import profileRoutes from './src/routes/profileRoutes';
import jobRoutes from './src/routes/jobRoutes';
import eventRoutes from './src/routes/eventRoutes';
import caveRoutes from './src/routes/caveRoutes';

const app = express();
const httpServer = createServer(app);

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: NODE_ENV === 'development' ? '*' : CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
});

// Setup Cave WebSocket namespace
setupCaveSocket(io);

// Setup Feed WebSocket namespace
setupFeedSocket(io);

// Make io available globally for broadcasting
app.set('io', io);

// Development logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS configuration - allow all origins in development
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    console.log('🔍 CORS: Request from origin:', origin);
    
    // In development, allow ALL origins
    if (NODE_ENV === 'development') {
      console.log('✅ CORS: Allowing origin (development mode)');
      return callback(null, true);
    }
    
    // In production, check against CORS_ORIGIN
    if (CORS_ORIGIN === '*') {
      console.log('✅ CORS: Allowing all origins (CORS_ORIGIN=*)');
      return callback(null, true);
    }
    
    if (origin === CORS_ORIGIN) {
      console.log('✅ CORS: Allowing origin (matches CORS_ORIGIN)');
      return callback(null, true);
    }
    
    console.log('❌ CORS: Blocking origin');
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Username'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
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
app.use('/api/cave', caveRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler - catch all unmatched routes
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

const port = Number(PORT) || 3001;
httpServer.listen(port, () => {
  if (NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`✅ DevConnect backend running on http://localhost:${port}`);
    console.log(`🔌 WebSocket server ready on ws://localhost:${port}`);
  }
});
