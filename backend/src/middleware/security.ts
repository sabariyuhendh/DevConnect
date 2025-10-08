import { Request, Response, NextFunction } from 'express';

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
    
    next();
  },

  // Request sanitization
  (req: Request, res: Response, next: NextFunction) => {
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          // Basic XSS protection
          req.body[key] = req.body[key].replace(/<[^>]*>?/gm, '');
        }
      });
    }
    
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = (req.query[key] as string).replace(/<[^>]*>?/gm, '');
        }
      });
    }
    
    next();
  },
];

// Rate limiting and security headers for API routes
export const apiSecurity = [
  // Rate limiting
  // dynamicRateLimiter, // Implementation removed — security middleware to be reimplemented by the user.
  
  // Security headers
  ...securityMiddleware,
];

// Security middleware for web routes
export const webSecurity = [
  // Rate limiting
  // globalRateLimiter, // Implementation removed — security middleware to be reimplemented by the user.
  
  // Security headers
  ...securityMiddleware,
];

// Placeholder security middleware
export const security: RequestHandler = (req, res, next) => {
  // placeholder
  next();
};
