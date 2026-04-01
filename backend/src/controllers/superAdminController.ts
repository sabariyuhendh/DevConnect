import { RequestHandler } from 'express';
import prisma from '../config/database';
import { successResponse } from '../utils/apiResponse';
import { AppError } from '../utils/errors';
import { getParamAsString } from '../utils/helpers';

// Get all admins
export const getAllAdmins: RequestHandler = async (req, res, next) => {
  try {
    const admins = await prisma.user.findMany({
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

    return successResponse(res, admins, 200, 'Admins retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

// Bulk update user roles
export const bulkUpdateRoles: RequestHandler = async (req, res, next) => {
  try {
    const { userIds, role } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return next(new AppError('User IDs array is required', 400));
    }

    const validRoles = ['USER', 'COMPANY_HR', 'EVENT_HOST', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(role)) {
      return next(new AppError('Invalid role', 400));
    }

    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: { role },
    });

    return successResponse(
      res,
      { updated: result.count },
      200,
      `${result.count} users updated to ${role}`
    );
  } catch (error) {
    return next(error);
  }
};

// Delete user permanently
export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = getParamAsString(req.params.userId);

    // Prevent deleting super admins
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, username: true },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'SUPER_ADMIN') {
      return next(new AppError('Cannot delete super admin users', 403));
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return successResponse(res, null, 200, `User ${user.username} deleted successfully`);
  } catch (error) {
    return next(error);
  }
};

// Get system statistics
export const getSystemStats: RequestHandler = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalPosts,
      totalJobs,
      pendingJobs,
      approvedJobs,
      rejectedJobs,
      totalApplications,
      usersByRole,
      recentSignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.post.count(),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'PENDING' } }),
      prisma.job.count({ where: { status: 'APPROVED' } }),
      prisma.job.count({ where: { status: 'REJECTED' } }),
      prisma.jobApplication.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      prisma.user.count({
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
        byRole: usersByRole.reduce((acc: any, item: any) => {
          acc[item.role] = item._count;
          return acc;
        }, {} as Record<string, number>),
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

    return successResponse(res, stats, 200, 'System statistics retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

// Bulk delete users
export const bulkDeleteUsers: RequestHandler = async (req, res, next) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return next(new AppError('User IDs array is required', 400));
    }

    // Check if any super admins in the list
    const superAdmins = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        role: 'SUPER_ADMIN',
      },
      select: { id: true },
    });

    if (superAdmins.length > 0) {
      return next(new AppError('Cannot delete super admin users', 403));
    }

    const result = await prisma.user.deleteMany({
      where: {
        id: { in: userIds },
        role: { not: 'SUPER_ADMIN' },
      },
    });

    return successResponse(
      res,
      { deleted: result.count },
      200,
      `${result.count} users deleted successfully`
    );
  } catch (error) {
    return next(error);
  }
};

// Get all jobs (including rejected and expired)
export const getAllJobs: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
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
      prisma.job.count({ where }),
    ]);

    return successResponse(
      res,
      {
        jobs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      200,
      'Jobs retrieved successfully'
    );
  } catch (error) {
    return next(error);
  }
};

// Delete job
export const deleteJob: RequestHandler = async (req, res, next) => {
  try {
    const jobId = getParamAsString(req.params.jobId);

    await prisma.job.delete({
      where: { id: jobId },
    });

    return successResponse(res, null, 200, 'Job deleted successfully');
  } catch (error) {
    return next(error);
  }
};

// Bulk delete jobs
export const bulkDeleteJobs: RequestHandler = async (req, res, next) => {
  try {
    const { jobIds } = req.body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return next(new AppError('Job IDs array is required', 400));
    }

    const result = await prisma.job.deleteMany({
      where: {
        id: { in: jobIds },
      },
    });

    return successResponse(
      res,
      { deleted: result.count },
      200,
      `${result.count} jobs deleted successfully`
    );
  } catch (error) {
    return next(error);
  }
};

// Get platform analytics
export const getPlatformAnalytics: RequestHandler = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      newUsers,
      newPosts,
      newJobs,
      newApplications,
      activeUsers,
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: true,
      }),
      prisma.post.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: true,
      }),
      prisma.job.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: true,
      }),
      prisma.jobApplication.groupBy({
        by: ['appliedAt'],
        where: {
          appliedAt: { gte: startDate },
        },
        _count: true,
      }),
      prisma.user.count({
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

    return successResponse(res, analytics, 200, 'Platform analytics retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

// Clear activity logs
export const clearActivityLogs: RequestHandler = async (req, res, next) => {
  try {
    const { olderThan } = req.body; // days

    const days = parseInt(olderThan) || 90;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await prisma.userActivityLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return successResponse(
      res,
      { deleted: result.count },
      200,
      `Deleted ${result.count} activity logs older than ${days} days`
    );
  } catch (error) {
    return next(error);
  }
};

// Get user details with full information
export const getUserDetails: RequestHandler = async (req, res, next) => {
  try {
    const userId = getParamAsString(req.params.userId);

    const user = await prisma.user.findUnique({
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
      return next(new AppError('User not found', 404));
    }

    return successResponse(res, user, 200, 'User details retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

// Verify or unverify user
export const toggleUserVerification: RequestHandler = async (req, res, next) => {
  try {
    const userId = getParamAsString(req.params.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isVerified: !user.isVerified },
      select: {
        id: true,
        username: true,
        email: true,
        isVerified: true,
      },
    });

    return successResponse(
      res,
      updatedUser,
      200,
      `User ${updatedUser.isVerified ? 'verified' : 'unverified'} successfully`
    );
  } catch (error) {
    return next(error);
  }
};

// Get database statistics
export const getDatabaseStats: RequestHandler = async (req, res, next) => {
  try {
    const [
      userCount,
      postCount,
      commentCount,
      jobCount,
      applicationCount,
      messageCount,
      conversationCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.job.count(),
      prisma.jobApplication.count(),
      prisma.message.count(),
      prisma.conversation.count(),
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

    return successResponse(res, stats, 200, 'Database statistics retrieved successfully');
  } catch (error) {
    return next(error);
  }
};
