import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Create rate limiters
const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Global rate limiter - 100 requests per 15 minutes
export const globalRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100,
  'Too many requests from this IP, please try again later.'
);

// API rate limiter - 50 requests per 15 minutes
export const apiRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  50,
  'Too many API requests from this IP, please try again later.'
);

// Auth rate limiter - 5 attempts per 15 minutes
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5,
  'Too many authentication attempts from this IP, please try again after 15 minutes.'
);

// Upload rate limiter - 10 uploads per 15 minutes
export const uploadRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10,
  'Too many upload attempts from this IP, please try again after 15 minutes.'
);

// Security middleware configuration
export const securityMiddleware = [
  // Set security HTTP headers
  (req: Request, res: Response, next: NextFunction) => {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    
    // Set X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Set X-Frame-Options
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Set X-XSS-Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Set Referrer-Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Set Permissions-Policy
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()'
    );
    
    // Set Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; media-src 'self'; object-src 'none'; frame-src 'none';"
    );
    
    next();
  },

  // Request sanitization and validation
  (req: Request, res: Response, next: NextFunction) => {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      sanitizeObject(req.query);
    }
    
    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      sanitizeObject(req.params);
    }
    
    next();
  },
];

// Helper function to sanitize objects recursively
function sanitizeObject(obj: any): void {
  for (const key in obj) {
    // Use Object.prototype.hasOwnProperty.call instead of obj.hasOwnProperty
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        // Remove HTML tags and potentially dangerous characters
        obj[key] = obj[key]
          .replace(/<[^>]*>?/gm, '') // Remove HTML tags
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+\s*=/gi, '') // Remove event handlers
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
}

// Rate limiting and security headers for API routes
export const apiSecurity = [
  // Rate limiting
  apiRateLimiter,
  
  // Security headers
  ...securityMiddleware,
];

// Security middleware for web routes
export const webSecurity = [
  // Rate limiting
  globalRateLimiter,
  
  // Security headers
  ...securityMiddleware,
];

// Enhanced security middleware with input validation
export const security = [
  // Input size limits
  (req: Request, res: Response, next: NextFunction) => {
    // Limit request body size (already handled by express.json() but double-check)
    const contentLength = req.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      return res.status(413).json({ error: 'Request entity too large' });
    }
    
    // Limit URL length
    if (req.url.length > 2048) {
      return res.status(414).json({ error: 'Request URL too long' });
    }
    
    next();
  },
  
  // Apply security headers and sanitization
  ...securityMiddleware,
];
