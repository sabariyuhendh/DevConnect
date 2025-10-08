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

// Implementation removed — auth middleware to be reimplemented by the user.

import { RequestHandler } from 'express';

export const protect: RequestHandler = (req, res, next) => next();
export const restrictTo = (..._roles: string[]) => (req: any, res: any, next: any) => next();
export const admin = restrictTo('admin');
export const isLoggedIn: RequestHandler = (req, res, next) => next();
