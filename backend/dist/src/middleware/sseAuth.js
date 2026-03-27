"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateSSE = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
/**
 * SSE Authentication Middleware
 * EventSource doesn't support custom headers, so we accept token via query parameter
 */
const authenticateSSE = (req, res, next) => {
    try {
        // Get token from query parameter (EventSource limitation)
        const token = req.query.token;
        console.log('🔐 SSE Auth: Checking token...', token ? 'Token present' : 'No token');
        if (!token) {
            console.error('❌ SSE Auth: No token provided');
            // Set SSE headers before sending error
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.write(`data: ${JSON.stringify({ type: 'error', message: 'No authentication token provided' })}\n\n`);
            res.end();
            return;
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        console.log('✅ SSE Auth: Token verified for user', decoded.id);
        // Attach user to request (partial user object for SSE)
        req.user = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
            firstName: decoded.firstName || null,
            lastName: decoded.lastName || null,
            role: decoded.role || 'USER',
            isActive: true
        };
        next();
    }
    catch (error) {
        console.error('❌ SSE Auth: Token verification failed:', error.message);
        // For SSE, we need to send error as SSE event, not JSON
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Authentication failed: ' + error.message })}\n\n`);
        res.end();
    }
};
exports.authenticateSSE = authenticateSSE;
