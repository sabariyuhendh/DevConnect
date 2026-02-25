import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse';

// Rate limiting options
const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return {
    windowMs, // Time window in milliseconds
    max, // Max requests per windowMs per IP
    message: { message },
    handler: (req: Request, res: Response, next: NextFunction) => {
      return errorResponse(res, message, 429);
    },
  };
};

// Apply rate limiting to all requests
export const globalRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // Limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again after 15 minutes'
);

// Stricter rate limiting for auth routes
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  20, // Limit each IP to 20 requests per windowMs
  'Too many login attempts from this IP, please try again after 15 minutes'
);

// Stricter rate limiting for public APIs
export const apiRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  200, // Limit each IP to 200 requests per windowMs
  'Too many API requests from this IP, please try again after 15 minutes'
);

// Rate limiting for password reset and similar sensitive operations
export const sensitiveRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // Limit each IP to 5 requests per windowMs
  'Too many attempts, please try again after an hour'
);

// Rate limiting for file uploads
export const uploadRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // Limit each IP to 10 uploads per hour
  'Too many uploads from this IP, please try again later'
);

// Apply rate limiting based on the request path
export const dynamicRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
  
  // Apply different rate limits based on the path
  if (path.startsWith('/api/v1/auth')) {
    return authRateLimiter.handler(req, res, next);
  }
  
  if (path.startsWith('/api/v1/upload')) {
    return uploadRateLimiter.handler(req, res, next);
  }
  
  if (path.startsWith('/api/v1')) {
    return apiRateLimiter.handler(req, res, next);
  }
  
  // Default rate limiter for all other routes
  return globalRateLimiter.handler(req, res, next);
};

// Implementation removed — rate limit middleware to be reimplemented by the user.

export const rateLimit = (_req: any, _res: any, next: any) => next();
