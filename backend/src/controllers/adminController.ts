import { RequestHandler } from 'express';
import prisma from '../config/database';
import { successResponse } from '../utils/apiResponse';
import { AppError } from '../utils/errors';

// Get dashboard stats
export const getDashboardStats: RequestHandler = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalJobs,
      totalEvents,
      pendingJobs,
      activeUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.job.count(),
      prisma.$queryRaw`SELECT COUNT(*) as count FROM "User" WHERE "lastSeen" > NOW() - INTERVAL '7 days'`,
      prisma.job.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { isOnline: true } }),
    ]);

    const stats = {
      totalUsers,
      totalPosts,
      totalJobs,
      totalEvents: 0, // Add event count when event model is available
      pendingJobs,
      activeUsers: activeUsers || 0,
    };

    return successResponse(res, stats, 'Dashboard stats retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

// Get all users with pagination
export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const where: any = {};
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
      prisma.user.findMany({
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
      prisma.user.count({ where }),
    ]);

    return successResponse(res, {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, 'Users retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

// Update user role
export const updateUserRole: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['USER', 'COMPANY_HR', 'EVENT_HOST', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(role)) {
      return next(new AppError('Invalid role', 400));
    }

    // Only super admin can assign SUPER_ADMIN role
    if (role === 'SUPER_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return next(new AppError('Only super admin can assign super admin role', 403));
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    return successResponse(res, user, 'User role updated successfully');
  } catch (error) {
    return next(error);
  }
};

// Toggle user active status
export const toggleUserStatus: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
      },
    });

    return successResponse(res, updatedUser, 'User status updated successfully');
  } catch (error) {
    return next(error);
  }
};

// Get pending jobs for approval
export const getPendingJobs: RequestHandler = async (req, res, next) => {
  try {
    const jobs = await prisma.job.findMany({
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

    return successResponse(res, jobs, 'Pending jobs retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

// Approve or reject job
export const updateJobStatus: RequestHandler = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        status,
        verifiedAt: status === 'APPROVED' ? new Date() : null,
        verifiedBy: status === 'APPROVED' ? req.user?.id : null,
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

    return successResponse(res, job, `Job ${status.toLowerCase()} successfully`);
  } catch (error) {
    return next(error);
  }
};

// Get system activity logs
export const getActivityLogs: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const [logs, total] = await Promise.all([
      prisma.userActivityLog.findMany({
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
      prisma.userActivityLog.count(),
    ]);

    return successResponse(res, {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, 'Activity logs retrieved successfully');
  } catch (error) {
    return next(error);
  }
};
