import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

/**
 * SSE Authentication Middleware
 * EventSource doesn't support custom headers, so we accept token via query parameter
 */
export const authenticateSSE = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from query parameter (EventSource limitation)
    const token = req.query.token as string;

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
    const decoded = jwt.verify(token, JWT_SECRET) as any;
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
    } as any;

    next();
  } catch (error: any) {
    console.error('❌ SSE Auth: Token verification failed:', error.message);
    // For SSE, we need to send error as SSE event, not JSON
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Authentication failed: ' + error.message })}\n\n`);
    res.end();
  }
};
