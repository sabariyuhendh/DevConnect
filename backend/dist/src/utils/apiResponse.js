"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.serverErrorResponse = exports.validationErrorResponse = exports.forbiddenResponse = exports.unauthorizedResponse = exports.notFoundResponse = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data, statusCode = 200, message = 'Operation successful', meta) => {
    const response = { status: 'success', data, message };
    if (meta) {
        response.meta = meta;
    }
    return res.status(statusCode).json(response);
};
exports.successResponse = successResponse;
const errorResponse = (res, message, statusCode = 400, error, errors) => {
    const response = { status: 'error', message };
    if (error && process.env.NODE_ENV === 'development') {
        response.error = error;
    }
    if (errors) {
        response.errors = errors;
    }
    return res.status(statusCode).json(response);
};
exports.errorResponse = errorResponse;
const notFoundResponse = (res, message = 'Resource not found') => {
    return (0, exports.errorResponse)(res, message, 404);
};
exports.notFoundResponse = notFoundResponse;
const unauthorizedResponse = (res, message = 'Not authorized to access this resource') => {
    return (0, exports.errorResponse)(res, message, 401);
};
exports.unauthorizedResponse = unauthorizedResponse;
const forbiddenResponse = (res, message = 'Access forbidden') => {
    return (0, exports.errorResponse)(res, message, 403);
};
exports.forbiddenResponse = forbiddenResponse;
const validationErrorResponse = (res, errors, message = 'Validation failed') => {
    return (0, exports.errorResponse)(res, message, 400, undefined, errors);
};
exports.validationErrorResponse = validationErrorResponse;
const serverErrorResponse = (res, error) => {
    console.error('Server Error:', error);
    return (0, exports.errorResponse)(res, 'An unexpected error occurred', 500, process.env.NODE_ENV === 'development' ? error : undefined);
};
exports.serverErrorResponse = serverErrorResponse;
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.asyncHandler = asyncHandler;
