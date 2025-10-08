import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { AppError } from '../src/utils/errors';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any; // Consider replacing 'any' with a proper User type
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Get token and check if it exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { id: string };

    // 3) Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // Add other necessary fields
      },
    });

    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4) Check if user changed password after the token was issued
    // You can implement this if you have passwordChangedAt field in your User model

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    return next(new AppError('Invalid token. Please log in again!', 401));
  }
};

// Restrict certain routes to specific roles
export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    // roles is an array ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// Alias for admin middleware for backward compatibility
export const admin = restrictTo('admin');

// Check if user is logged in (for server-side rendering)
export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies?.token) {
    try {
      // 1) Verify token
      const decoded = jwt.verify(req.cookies.token, JWT_SECRET) as JwtPayload & { id: string };

      // 2) Check if user still exists
      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true },
      });

      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      // You can implement this if needed

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// Implementation removed — middleware to be reimplemented by the user.

import { RequestHandler } from 'express';

export const authMiddleware: RequestHandler = (req, res, next) => {
  // placeholder
  next();
};
