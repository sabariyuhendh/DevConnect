"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = exports.dynamicRateLimiter = exports.uploadRateLimiter = exports.sensitiveRateLimiter = exports.apiRateLimiter = exports.authRateLimiter = exports.globalRateLimiter = void 0;
const apiResponse_1 = require("../utils/apiResponse");
// Rate limiting options
const createRateLimiter = (windowMs, max, message) => {
    return {
        windowMs, // Time window in milliseconds
        max, // Max requests per windowMs per IP
        message: { message },
        handler: (req, res, next) => {
            return (0, apiResponse_1.errorResponse)(res, message, 429);
        },
    };
};
// Apply rate limiting to all requests
exports.globalRateLimiter = createRateLimiter(15 * 60 * 1000, // 15 minutes
100, // Limit each IP to 100 requests per windowMs
'Too many requests from this IP, please try again after 15 minutes');
// Stricter rate limiting for auth routes
exports.authRateLimiter = createRateLimiter(15 * 60 * 1000, // 15 minutes
20, // Limit each IP to 20 requests per windowMs
'Too many login attempts from this IP, please try again after 15 minutes');
// Stricter rate limiting for public APIs
exports.apiRateLimiter = createRateLimiter(15 * 60 * 1000, // 15 minutes
200, // Limit each IP to 200 requests per windowMs
'Too many API requests from this IP, please try again after 15 minutes');
// Rate limiting for password reset and similar sensitive operations
exports.sensitiveRateLimiter = createRateLimiter(60 * 60 * 1000, // 1 hour
5, // Limit each IP to 5 requests per windowMs
'Too many attempts, please try again after an hour');
// Rate limiting for file uploads
exports.uploadRateLimiter = createRateLimiter(60 * 60 * 1000, // 1 hour
10, // Limit each IP to 10 uploads per hour
'Too many uploads from this IP, please try again later');
// Apply rate limiting based on the request path
const dynamicRateLimiter = (req, res, next) => {
    const path = req.path;
    // Apply different rate limits based on the path
    if (path.startsWith('/api/v1/auth')) {
        return exports.authRateLimiter.handler(req, res, next);
    }
    if (path.startsWith('/api/v1/upload')) {
        return exports.uploadRateLimiter.handler(req, res, next);
    }
    if (path.startsWith('/api/v1')) {
        return exports.apiRateLimiter.handler(req, res, next);
    }
    // Default rate limiter for all other routes
    return exports.globalRateLimiter.handler(req, res, next);
};
exports.dynamicRateLimiter = dynamicRateLimiter;
// Implementation removed — rate limit middleware to be reimplemented by the user.
const rateLimit = (_req, _res, next) => next();
exports.rateLimit = rateLimit;
