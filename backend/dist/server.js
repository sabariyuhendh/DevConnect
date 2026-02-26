"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const env_1 = require("./src/config/env");
const errors_1 = require("./src/utils/errors");
const caveSocket_1 = require("./src/websocket/caveSocket");
// Import routes
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const postRoutes_1 = __importDefault(require("./src/routes/postRoutes"));
const profileRoutes_1 = __importDefault(require("./src/routes/profileRoutes"));
const jobRoutes_1 = __importDefault(require("./src/routes/jobRoutes"));
const eventRoutes_1 = __importDefault(require("./src/routes/eventRoutes"));
const caveRoutes_1 = __importDefault(require("./src/routes/caveRoutes"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Setup Socket.IO
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: env_1.NODE_ENV === 'development' ? '*' : env_1.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
});
// Setup Cave WebSocket namespace
(0, caveSocket_1.setupCaveSocket)(io);
// Development logging
if (env_1.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Middleware
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
// CORS configuration - allow all origins in development, specific origin in production
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // In development, allow all origins
        if (env_1.NODE_ENV === 'development') {
            return callback(null, true);
        }
        // In production, check against CORS_ORIGIN
        if (env_1.CORS_ORIGIN === '*' || origin === env_1.CORS_ORIGIN) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Username']
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
// Request logging middleware
app.use((req, res, next) => {
    if (env_1.NODE_ENV === 'development') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    }
    next();
});
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/posts', postRoutes_1.default);
app.use('/api/profiles', profileRoutes_1.default);
app.use('/api/jobs', jobRoutes_1.default);
app.use('/api/events', eventRoutes_1.default);
app.use('/api/cave', caveRoutes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 404 Handler - catch all unmatched routes
app.use((req, res, next) => {
    next(new errors_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global error handling middleware
app.use(errors_1.globalErrorHandler);
const port = Number(env_1.PORT) || 3001;
httpServer.listen(port, () => {
    if (env_1.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(`✅ DevConnect backend running on http://localhost:${port}`);
        console.log(`🔌 WebSocket server ready on ws://localhost:${port}`);
    }
});
