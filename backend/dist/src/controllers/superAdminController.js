"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseStats = exports.toggleUserVerification = exports.getUserDetails = exports.clearActivityLogs = exports.getPlatformAnalytics = exports.bulkDeleteJobs = exports.deleteJob = exports.getAllJobs = exports.bulkDeleteUsers = exports.getSystemStats = exports.deleteUser = exports.bulkUpdateRoles = exports.getAllAdmins = void 0;
const database_1 = __importDefault(require("../config/database"));
const apiResponse_1 = require("../utils/apiResponse");
const errors_1 = require("../utils/errors");
// Get all admins
const getAllAdmins = async (req, res, next) => {
    try {
        const admins = await database_1.default.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'SUPER_ADMIN'],
                },
            },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
                lastSeen: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return (0, apiResponse_1.successResponse)(res, admins, 200, 'Admins retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getAllAdmins = getAllAdmins;
// Bulk update user roles
const bulkUpdateRoles = async (req, res, next) => {
    try {
        const { userIds, role } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return next(new errors_1.AppError('User IDs array is required', 400));
        }
        const validRoles = ['USER', 'COMPANY_HR', 'EVENT_HOST', 'ADMIN', 'SUPER_ADMIN'];
        if (!validRoles.includes(role)) {
            return next(new errors_1.AppError('Invalid role', 400));
        }
        const result = await database_1.default.user.updateMany({
            where: {
                id: { in: userIds },
            },
            data: { role },
        });
        return (0, apiResponse_1.successResponse)(res, { updated: result.count }, 200, `${result.count} users updated to ${role}`);
    }
    catch (error) {
        return next(error);
    }
};
exports.bulkUpdateRoles = bulkUpdateRoles;
// Delete user permanently
const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        // Prevent deleting super admins
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { role: true, username: true },
        });
        if (!user) {
            return next(new errors_1.AppError('User not found', 404));
        }
        if (user.role === 'SUPER_ADMIN') {
            return next(new errors_1.AppError('Cannot delete super admin users', 403));
        }
        await database_1.default.user.delete({
            where: { id: userId },
        });
        return (0, apiResponse_1.successResponse)(res, null, 200, `User ${user.username} deleted successfully`);
    }
    catch (error) {
        return next(error);
    }
};
exports.deleteUser = deleteUser;
// Get system statistics
const getSystemStats = async (req, res, next) => {
    try {
        const [totalUsers, activeUsers, inactiveUsers, totalPosts, totalJobs, pendingJobs, approvedJobs, rejectedJobs, totalApplications, usersByRole, recentSignups,] = await Promise.all([
            database_1.default.user.count(),
            database_1.default.user.count({ where: { isActive: true } }),
            database_1.default.user.count({ where: { isActive: false } }),
            database_1.default.post.count(),
            database_1.default.job.count(),
            database_1.default.job.count({ where: { status: 'PENDING' } }),
            database_1.default.job.count({ where: { status: 'APPROVED' } }),
            database_1.default.job.count({ where: { status: 'REJECTED' } }),
            database_1.default.jobApplication.count(),
            database_1.default.user.groupBy({
                by: ['role'],
                _count: true,
            }),
            database_1.default.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                    },
                },
            }),
        ]);
        const stats = {
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: inactiveUsers,
                recentSignups,
                byRole: usersByRole.reduce((acc, item) => {
                    acc[item.role] = item._count;
                    return acc;
                }, {}),
            },
            content: {
                totalPosts,
            },
            jobs: {
                total: totalJobs,
                pending: pendingJobs,
                approved: approvedJobs,
                rejected: rejectedJobs,
                totalApplications,
            },
        };
        return (0, apiResponse_1.successResponse)(res, stats, 200, 'System statistics retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getSystemStats = getSystemStats;
// Bulk delete users
const bulkDeleteUsers = async (req, res, next) => {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return next(new errors_1.AppError('User IDs array is required', 400));
        }
        // Check if any super admins in the list
        const superAdmins = await database_1.default.user.findMany({
            where: {
                id: { in: userIds },
                role: 'SUPER_ADMIN',
            },
            select: { id: true },
        });
        if (superAdmins.length > 0) {
            return next(new errors_1.AppError('Cannot delete super admin users', 403));
        }
        const result = await database_1.default.user.deleteMany({
            where: {
                id: { in: userIds },
                role: { not: 'SUPER_ADMIN' },
            },
        });
        return (0, apiResponse_1.successResponse)(res, { deleted: result.count }, 200, `${result.count} users deleted successfully`);
    }
    catch (error) {
        return next(error);
    }
};
exports.bulkDeleteUsers = bulkDeleteUsers;
// Get all jobs (including rejected and expired)
const getAllJobs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const where = {};
        if (status) {
            where.status = status;
        }
        const [jobs, total] = await Promise.all([
            database_1.default.job.findMany({
                where,
                include: {
                    postedBy: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            company: true,
                        },
                    },
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_1.default.job.count({ where }),
        ]);
        return (0, apiResponse_1.successResponse)(res, {
            jobs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }, 200, 'Jobs retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getAllJobs = getAllJobs;
// Delete job
const deleteJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        await database_1.default.job.delete({
            where: { id: jobId },
        });
        return (0, apiResponse_1.successResponse)(res, null, 200, 'Job deleted successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.deleteJob = deleteJob;
// Bulk delete jobs
const bulkDeleteJobs = async (req, res, next) => {
    try {
        const { jobIds } = req.body;
        if (!Array.isArray(jobIds) || jobIds.length === 0) {
            return next(new errors_1.AppError('Job IDs array is required', 400));
        }
        const result = await database_1.default.job.deleteMany({
            where: {
                id: { in: jobIds },
            },
        });
        return (0, apiResponse_1.successResponse)(res, { deleted: result.count }, 200, `${result.count} jobs deleted successfully`);
    }
    catch (error) {
        return next(error);
    }
};
exports.bulkDeleteJobs = bulkDeleteJobs;
// Get platform analytics
const getPlatformAnalytics = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const [newUsers, newPosts, newJobs, newApplications, activeUsers,] = await Promise.all([
            database_1.default.user.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: { gte: startDate },
                },
                _count: true,
            }),
            database_1.default.post.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: { gte: startDate },
                },
                _count: true,
            }),
            database_1.default.job.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: { gte: startDate },
                },
                _count: true,
            }),
            database_1.default.jobApplication.groupBy({
                by: ['appliedAt'],
                where: {
                    appliedAt: { gte: startDate },
                },
                _count: true,
            }),
            database_1.default.user.count({
                where: {
                    lastSeen: { gte: startDate },
                },
            }),
        ]);
        const analytics = {
            period: `Last ${days} days`,
            newUsers: newUsers.length,
            newPosts: newPosts.length,
            newJobs: newJobs.length,
            newApplications: newApplications.length,
            activeUsers,
            trends: {
                users: newUsers,
                posts: newPosts,
                jobs: newJobs,
                applications: newApplications,
            },
        };
        return (0, apiResponse_1.successResponse)(res, analytics, 200, 'Platform analytics retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getPlatformAnalytics = getPlatformAnalytics;
// Clear activity logs
const clearActivityLogs = async (req, res, next) => {
    try {
        const { olderThan } = req.body; // days
        const days = parseInt(olderThan) || 90;
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const result = await database_1.default.userActivityLog.deleteMany({
            where: {
                createdAt: { lt: cutoffDate },
            },
        });
        return (0, apiResponse_1.successResponse)(res, { deleted: result.count }, 200, `Deleted ${result.count} activity logs older than ${days} days`);
    }
    catch (error) {
        return next(error);
    }
};
exports.clearActivityLogs = clearActivityLogs;
// Get user details with full information
const getUserDetails = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            include: {
                posts: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        likeCount: true,
                        commentCount: true,
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                jobPostings: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                        status: true,
                        createdAt: true,
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                jobApplications: {
                    select: {
                        id: true,
                        status: true,
                        appliedAt: true,
                        job: {
                            select: {
                                title: true,
                                company: true,
                            },
                        },
                    },
                    take: 10,
                    orderBy: { appliedAt: 'desc' },
                },
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true,
                        jobPostings: true,
                        jobApplications: true,
                    },
                },
            },
        });
        if (!user) {
            return next(new errors_1.AppError('User not found', 404));
        }
        return (0, apiResponse_1.successResponse)(res, user, 200, 'User details retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getUserDetails = getUserDetails;
// Verify or unverify user
const toggleUserVerification = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { isVerified: true },
        });
        if (!user) {
            return next(new errors_1.AppError('User not found', 404));
        }
        const updatedUser = await database_1.default.user.update({
            where: { id: userId },
            data: { isVerified: !user.isVerified },
            select: {
                id: true,
                username: true,
                email: true,
                isVerified: true,
            },
        });
        return (0, apiResponse_1.successResponse)(res, updatedUser, 200, `User ${updatedUser.isVerified ? 'verified' : 'unverified'} successfully`);
    }
    catch (error) {
        return next(error);
    }
};
exports.toggleUserVerification = toggleUserVerification;
// Get database statistics
const getDatabaseStats = async (req, res, next) => {
    try {
        const [userCount, postCount, commentCount, jobCount, applicationCount, messageCount, conversationCount,] = await Promise.all([
            database_1.default.user.count(),
            database_1.default.post.count(),
            database_1.default.comment.count(),
            database_1.default.job.count(),
            database_1.default.jobApplication.count(),
            database_1.default.message.count(),
            database_1.default.conversation.count(),
        ]);
        const stats = {
            tables: {
                users: userCount,
                posts: postCount,
                comments: commentCount,
                jobs: jobCount,
                applications: applicationCount,
                messages: messageCount,
                conversations: conversationCount,
            },
            total: userCount + postCount + commentCount + jobCount + applicationCount + messageCount + conversationCount,
        };
        return (0, apiResponse_1.successResponse)(res, stats, 200, 'Database statistics retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getDatabaseStats = getDatabaseStats;
