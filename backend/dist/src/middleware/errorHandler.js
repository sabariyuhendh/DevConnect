"use strict";
// Implementation removed — error handler middleware to be reimplemented by the user.
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    // placeholder
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    });
};
exports.errorHandler = errorHandler;
