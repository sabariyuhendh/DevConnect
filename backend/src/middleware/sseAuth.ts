import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { AppError } from '../utils/errors';

/**
 * SSE Authentication Middleware
 * EventSource doesn't support custom headers, so we accept token via query parameter
 */
export const authenticateSSE = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from query parameter (EventSource limitation)
    const token = req.query.token as string;

    if (!token) {
      throw new AppError('No authentication token provided', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username
    };

    next();
  } catch (error) {
    // For SSE, we need to send error as SSE event, not JSON
    res.setHeader('Content-Type', 'text/event-stream');
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Authentication failed' })}\n\n`);
    res.end();
  }
};
