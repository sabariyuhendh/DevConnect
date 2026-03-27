"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLoggedIn = exports.requireEventHost = exports.requireCompanyHR = exports.requireSuperAdmin = exports.requireAdmin = exports.restrictTo = exports.protect = void 0;
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("../utils/errors");
const jwt_1 = require("../utils/jwt");
const protect = async (req, _res, next) => {
    try {
        const header = req.headers.authorization;
        console.log('[Auth] Authorization header:', header ? 'Present (Bearer token)' : 'MISSING');
        const token = (header === null || header === void 0 ? void 0 : header.startsWith('Bearer ')) ? header.slice('Bearer '.length) : null;
        if (!token) {
            console.log('[Auth] No token provided');
            return next(new errors_1.AppError('Unauthorized', 401));
        }
        console.log('[Auth] Token extracted, length:', token.length);
        const payload = (0, jwt_1.verifyToken)(token);
        console.log('[Auth] Token verified for user ID:', payload.id);
        const user = await database_1.default.user.findUnique({
            where: { id: payload.id },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
            },
        });
        if (!user) {
            console.log('[Auth] User not found for ID:', payload.id);
            return next(new errors_1.AppError('Unauthorized', 401));
        }
        if (!user.isActive) {
            console.log('[Auth] User inactive:', user.username);
            return next(new errors_1.AppError('Unauthorized', 401));
        }
        console.log('[Auth] User authenticated:', user.username, 'Role:', user.role);
        req.user = user;
        return next();
    }
    catch (error) {
        console.log('[Auth] Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
        return next(new errors_1.AppError('Unauthorized', 401));
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            console.log('[Auth] restrictTo: No user in request');
            return next(new errors_1.AppError('Unauthorized', 401));
        }
        console.log('[Auth] restrictTo: Checking if role', req.user.role, 'is in', roles);
        if (!roles.includes(req.user.role)) {
            console.log('[Auth] restrictTo: Access denied for role', req.user.role);
            return next(new errors_1.AppError('You do not have permission to perform this action', 403));
        }
        console.log('[Auth] restrictTo: Access granted for role', req.user.role);
        return next();
    };
};
exports.restrictTo = restrictTo;
// Middleware shortcuts
exports.requireAdmin = (0, exports.restrictTo)('ADMIN', 'SUPER_ADMIN');
exports.requireSuperAdmin = (0, exports.restrictTo)('SUPER_ADMIN');
exports.requireCompanyHR = (0, exports.restrictTo)('COMPANY_HR', 'ADMIN', 'SUPER_ADMIN');
exports.requireEventHost = (0, exports.restrictTo)('EVENT_HOST', 'ADMIN', 'SUPER_ADMIN');
const isLoggedIn = (req, _res, next) => next();
exports.isLoggedIn = isLoggedIn;
