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
const feedSocket_1 = require("./src/websocket/feedSocket");
const messageSocket_1 = require("./src/websocket/messageSocket");
// Import routes
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const postRoutes_1 = __importDefault(require("./src/routes/postRoutes"));
const profileRoutes_1 = __importDefault(require("./src/routes/profileRoutes"));
const jobRoutes_1 = __importDefault(require("./src/routes/jobRoutes"));
const eventRoutes_1 = __importDefault(require("./src/routes/eventRoutes"));
const caveRoutes_1 = __importDefault(require("./src/routes/caveRoutes"));
const adminRoutes_1 = __importDefault(require("./src/routes/adminRoutes"));
const superAdminRoutes_1 = __importDefault(require("./src/routes/superAdminRoutes"));
const messageRoutes_1 = __importDefault(require("./src/routes/messageRoutes"));
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
// Setup Feed WebSocket namespace
(0, feedSocket_1.setupFeedSocket)(io);
// Setup Message WebSocket namespace
(0, messageSocket_1.setupMessageSocket)(io);
// Make io available globally for broadcasting
app.set('io', io);
// Development logging
if (env_1.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Middleware
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
// CORS configuration - allow all origins in development
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) {
            console.log('✅ CORS: Allowing request with no origin');
            return callback(null, true);
        }
        console.log('🔍 CORS: Request from origin:', origin);
        // In development, allow ALL origins
        if (env_1.NODE_ENV === 'development') {
            console.log('✅ CORS: Allowing origin (development mode)');
            return callback(null, true);
        }
        // In production, check against CORS_ORIGIN
        if (env_1.CORS_ORIGIN === '*') {
            console.log('✅ CORS: Allowing all origins (CORS_ORIGIN=*)');
            return callback(null, true);
        }
        if (origin === env_1.CORS_ORIGIN) {
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
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/superadmin', superAdminRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
// Health check endpoint with MCP module info
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        modules: {
            auth: { status: 'active', version: '1.0.0' },
            social: { status: 'active', version: '1.0.0', capabilities: ['feed', 'sse', 'recommendations'] },
            identity: { status: 'active', version: '1.0.0' },
            jobs: { status: 'active', version: '1.0.0' },
            events: { status: 'active', version: '1.0.0' },
            cave: { status: 'active', version: '1.0.0' },
            messaging: { status: 'active', version: '1.0.0', capabilities: ['direct-messages', 'real-time', 'markdown', 'typing-indicators', 'read-receipts'] }
        },
        architecture: 'monolith',
        mcpReady: true
    });
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
