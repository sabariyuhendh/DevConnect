import { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  statusCode: number;
  constructor(message?: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Global Error Handler]', err);
  
  const statusCode = err?.statusCode || err?.status || 500;
  const message = err?.message || 'Internal server error';
  
  res.status(statusCode).json({ 
    status: 'error', 
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err?.stack })
  });
};
