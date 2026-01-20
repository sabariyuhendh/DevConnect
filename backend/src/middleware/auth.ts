import { RequestHandler } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { verifyToken } from '../utils/jwt';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any; // Consider replacing 'any' with a proper User type
    }
  }
}

export const protect: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
    if (!token) return next(new AppError('Unauthorized', 401));

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) return next(new AppError('Unauthorized', 401));
    (req as any).user = user;
    return next();
  } catch {
    return next(new AppError('Unauthorized', 401));
  }
};

export const restrictTo = (..._roles: string[]) => (req: any, _res: any, next: any) => next();
export const admin = restrictTo('admin');
export const isLoggedIn: RequestHandler = (req, _res, next) => next();
