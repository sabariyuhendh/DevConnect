// Implementation removed — error handler middleware to be reimplemented by the user.

import { RequestHandler } from 'express';

export const errorHandler: RequestHandler = (err, req, res, next) => {
  // placeholder
  next(err);
};
