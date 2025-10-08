import { NextFunction, Request, Response } from 'express';

// Implementation removed — error helpers to be reimplemented by the user.

export class AppError extends Error {
  statusCode: number;
  constructor(message?: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export const globalErrorHandler = (err: any, _req: any, res: any, _next: any) => {
  // placeholder error handler
  res.status(err?.statusCode || 500).json({ status: 'error', message: err?.message || 'Internal server error' });
};
