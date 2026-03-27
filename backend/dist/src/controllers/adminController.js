"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityLogs = exports.updateJobStatus = exports.getPendingJobs = exports.toggleUserStatus = exports.updateUserRole = exports.getUsers = exports.getDashboardStats = void 0;
const database_1 = __importDefault(require("../config/database"));
const apiResponse_1 = require("../utils/apiResponse");
const errors_1 = require("../utils/errors");
const helpers_1 = require("../utils/helpers");
// Get dashboard stats
const getDashboardStats = async (req, res, next) => {
    try {
        const [totalUsers, totalPosts, totalJobs, totalEvents, pendingJobs, activeUsers,] = await Promise.all([
            database_1.default.user.count(),
            database_1.default.post.count(),
            database_1.default.job.count(),
            database_1.default.$queryRaw `SELECT COUNT(*) as count FROM "User" WHERE "lastSeen" > NOW() - INTERVAL '7 days'`,
            database_1.default.job.count({ where: { status: 'PENDING' } }),
            database_1.default.user.count({ where: { isOnline: true } }),
        ]);
        const stats = {
            totalUsers,
            totalPosts,
            totalJobs,
            totalEvents: 0, // Add event count when event model is available
            pendingJobs,
            activeUsers: activeUsers || 0,
        };
        return (0, apiResponse_1.successResponse)(res, stats, 200, 'Dashboard stats retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
// Get all users with pagination
const getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const role = req.query.role;
        const where = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) {
            where.role = role;
        }
        const [users, total] = await Promise.all([
            database_1.default.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    isVerified: true,
                    createdAt: true,
                    lastSeen: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_1.default.user.count({ where }),
        ]);
        return (0, apiResponse_1.successResponse)(res, {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }, 200, 'Users retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getUsers = getUsers;
// Update user role
const updateUserRole = async (req, res, next) => {
    var _a;
    try {
        const userId = (0, helpers_1.getStringParam)(req.params.userId);
        const { role } = req.body;
        const validRoles = ['USER', 'COMPANY_HR', 'EVENT_HOST', 'ADMIN', 'SUPER_ADMIN'];
        if (!validRoles.includes(role)) {
            return next(new errors_1.AppError('Invalid role', 400));
        }
        // Only super admin can assign SUPER_ADMIN role
        if (role === 'SUPER_ADMIN' && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'SUPER_ADMIN') {
            return next(new errors_1.AppError('Only super admin can assign super admin role', 403));
        }
        const user = await database_1.default.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
            },
        });
        return (0, apiResponse_1.successResponse)(res, user, 200, 'User role updated successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.updateUserRole = updateUserRole;
// Toggle user active status
const toggleUserStatus = async (req, res, next) => {
    try {
        const userId = (0, helpers_1.getStringParam)(req.params.userId);
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { isActive: true },
        });
        if (!user) {
            return next(new errors_1.AppError('User not found', 404));
        }
        const updatedUser = await database_1.default.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive },
            select: {
                id: true,
                email: true,
                username: true,
                isActive: true,
            },
        });
        return (0, apiResponse_1.successResponse)(res, updatedUser, 200, 'User status updated successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.toggleUserStatus = toggleUserStatus;
// Get pending jobs for approval
const getPendingJobs = async (req, res, next) => {
    try {
        const jobs = await database_1.default.job.findMany({
            where: { status: 'PENDING' },
            include: {
                postedBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        company: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return (0, apiResponse_1.successResponse)(res, jobs, 200, 'Pending jobs retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getPendingJobs = getPendingJobs;
// Approve or reject job
const updateJobStatus = async (req, res, next) => {
    var _a;
    try {
        const jobId = (0, helpers_1.getStringParam)(req.params.jobId);
        const { status } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return next(new errors_1.AppError('Invalid status', 400));
        }
        const job = await database_1.default.job.update({
            where: { id: jobId },
            data: {
                status,
                verifiedAt: status === 'APPROVED' ? new Date() : null,
                verifiedBy: status === 'APPROVED' ? (_a = req.user) === null || _a === void 0 ? void 0 : _a.id : null,
                isVerified: status === 'APPROVED',
            },
            include: {
                postedBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
        return (0, apiResponse_1.successResponse)(res, job, 200, `Job ${status.toLowerCase()} successfully`);
    }
    catch (error) {
        return next(error);
    }
};
exports.updateJobStatus = updateJobStatus;
// Get system activity logs
const getActivityLogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const [logs, total] = await Promise.all([
            database_1.default.userActivityLog.findMany({
                include: {
                    User: {
                        select: {
                            username: true,
                            email: true,
                        },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_1.default.userActivityLog.count(),
        ]);
        return (0, apiResponse_1.successResponse)(res, {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }, 200, 'Activity logs retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getActivityLogs = getActivityLogs;
