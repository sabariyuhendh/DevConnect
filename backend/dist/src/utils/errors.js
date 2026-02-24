"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.AppError = void 0;
// Implementation removed — error helpers to be reimplemented by the user.
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
const globalErrorHandler = (err, _req, res, _next) => {
    // placeholder error handler
    res.status((err === null || err === void 0 ? void 0 : err.statusCode) || 500).json({ status: 'error', message: (err === null || err === void 0 ? void 0 : err.message) || 'Internal server error' });
};
exports.globalErrorHandler = globalErrorHandler;
