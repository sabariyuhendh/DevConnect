// Implementation removed — error handler middleware to be reimplemented by the user.

import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // placeholder
  next(err);
};
