import { RequestHandler } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { verifyToken } from '../utils/jwt';

export type UserRole = 'USER' | 'COMPANY_HR' | 'EVENT_HOST' | 'ADMIN' | 'SUPER_ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  isActive: boolean;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const protect: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    console.log('[Auth] Authorization header:', header ? `${header.substring(0, 30)}...` : 'MISSING');
    
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
    
    if (!token) {
      console.log('[Auth] No token provided');
      return next(new AppError('Unauthorized', 401));
    }

    console.log('[Auth] Token extracted, length:', token.length);
    console.log('[Auth] Token preview:', token.substring(0, 20) + '...');
    
    const payload = verifyToken(token);
    console.log('[Auth] Token verified for user ID:', payload.id);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      console.log('[Auth] User not found for ID:', payload.id);
      return next(new AppError('Unauthorized', 401));
    }
    
    if (!user.isActive) {
      console.log('[Auth] User inactive:', user.username);
      return next(new AppError('Unauthorized', 401));
    }
    
    console.log('[Auth] User authenticated:', user.username, 'Role:', user.role);
    req.user = user as AuthUser;
    return next();
  } catch (error) {
    console.log('[Auth] Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return next(new AppError('Unauthorized', 401));
  }
};

export const restrictTo = (...roles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      console.log('[Auth] restrictTo: No user in request');
      return next(new AppError('Unauthorized', 401));
    }
    
    console.log('[Auth] restrictTo: Checking if role', req.user.role, 'is in', roles);
    
    if (!roles.includes(req.user.role)) {
      console.log('[Auth] restrictTo: Access denied for role', req.user.role);
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    console.log('[Auth] restrictTo: Access granted for role', req.user.role);
    return next();
  };
};

// Middleware shortcuts
export const requireAdmin = restrictTo('ADMIN', 'SUPER_ADMIN');
export const requireSuperAdmin = restrictTo('SUPER_ADMIN');
export const requireCompanyHR = restrictTo('COMPANY_HR', 'ADMIN', 'SUPER_ADMIN');
export const requireEventHost = restrictTo('EVENT_HOST', 'ADMIN', 'SUPER_ADMIN');

export const isLoggedIn: RequestHandler = (req, _res, next) => next();
