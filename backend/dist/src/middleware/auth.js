"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLoggedIn = exports.admin = exports.restrictTo = exports.protect = void 0;
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("../utils/errors");
const jwt_1 = require("../utils/jwt");
const protect = async (req, _res, next) => {
    try {
        const header = req.headers.authorization;
        const token = (header === null || header === void 0 ? void 0 : header.startsWith('Bearer ')) ? header.slice('Bearer '.length) : null;
        if (!token)
            return next(new errors_1.AppError('Unauthorized', 401));
        const payload = (0, jwt_1.verifyToken)(token);
        const user = await database_1.default.user.findUnique({
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
        if (!user || !user.isActive)
            return next(new errors_1.AppError('Unauthorized', 401));
        req.user = user;
        return next();
    }
    catch (_a) {
        return next(new errors_1.AppError('Unauthorized', 401));
    }
};
exports.protect = protect;
const restrictTo = (..._roles) => (req, _res, next) => next();
exports.restrictTo = restrictTo;
exports.admin = (0, exports.restrictTo)('admin');
const isLoggedIn = (req, _res, next) => next();
exports.isLoggedIn = isLoggedIn;
