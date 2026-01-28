import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserService } from '../services/userService';
import { protect as authenticate } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/apiResponse';

const router = Router();
const prisma = new PrismaClient();
const userService = new UserService(prisma);

/**
 * GET /api/users/search - Search users with filters
 */
router.get('/search', authenticate, async (req, res) => {
  try {
    const query = req.query.q as string || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const filters = {
      skills: req.query.skills ? (req.query.skills as string).split(',') : undefined,
      location: req.query.location as string,
      experience: req.query.experience as string,
      company: req.query.company as string,
    };

    const result = await userService.searchUsers(query, filters, page, limit);

    return successResponse(res, result, 200, 'Users retrieved successfully');
  } catch (error) {
    console.error('Search users error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to search users', 500);
  }
});

/**
 * GET /api/users/suggestions - Get suggested connections
 */
router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;

    const suggestions = await userService.getSuggestedConnections(userId, limit);

    return successResponse(res, suggestions, 200, 'Suggested connections retrieved successfully');
  } catch (error) {
    console.error('Get suggestions error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to get suggestions', 500);
  }
});

/**
 * POST /api/users/connections/request - Send connection request
 */
router.post('/connections/request', authenticate, async (req, res) => {
  try {
    const fromUserId = req.user!.id;
    const { toUserId } = req.body;

    if (!toUserId) {
      return errorResponse(res, 'Target user ID is required', 400);
    }

    const connectionRequest = await userService.sendConnectionRequest(fromUserId, toUserId);

    return successResponse(res, connectionRequest, 201, 'Connection request sent successfully');
  } catch (error) {
    console.error('Send connection request error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to send connection request', 400);
  }
});

/**
 * PUT /api/users/connections/:requestId/respond - Respond to connection request
 */
router.put('/connections/:requestId/respond', authenticate, async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const userId = req.user!.id;
    const { response } = req.body;

    if (!response || !['accept', 'decline'].includes(response)) {
      return errorResponse(res, 'Valid response (accept/decline) is required', 400);
    }

    await userService.respondToConnectionRequest(requestId, response, userId);

    return successResponse(res, null, 200, `Connection request ${response}ed successfully`);
  } catch (error) {
    console.error('Respond to connection request error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to respond to connection request', 400);
  }
});

/**
 * GET /api/users/connections - Get user connections
 */
router.get('/connections', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const status = req.query.status as 'accepted' | 'pending' | 'all' || 'accepted';

    const connections = await userService.getConnections(userId, status);

    return successResponse(res, connections, 200, 'Connections retrieved successfully');
  } catch (error) {
    console.error('Get connections error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to get connections', 500);
  }
});

/**
 * POST /api/users/:userId/block - Block a user
 */
router.post('/:userId/block', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const blockedUserId = req.params.userId;

    await userService.blockUser(userId, blockedUserId);

    return successResponse(res, null, 200, 'User blocked successfully');
  } catch (error) {
    console.error('Block user error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to block user', 400);
  }
});

/**
 * POST /api/users/:userId/report - Report a user
 */
router.post('/:userId/report', authenticate, async (req, res) => {
  try {
    const reporterId = req.user!.id;
    const reportedUserId = req.params.userId;
    const { reason, description } = req.body;

    if (!reason) {
      return errorResponse(res, 'Reason is required', 400);
    }

    await userService.reportUser(reporterId, reportedUserId, reason, description);

    return successResponse(res, null, 200, 'User reported successfully');
  } catch (error) {
    console.error('Report user error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to report user', 400);
  }
});

/**
 * GET /api/users/:userId/connection-status - Get connection status with another user
 */
router.get('/:userId/connection-status', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const otherUserId = req.params.userId;

    const status = await userService.getConnectionStatus(userId, otherUserId);

    return successResponse(res, { status }, 200, 'Connection status retrieved successfully');
  } catch (error) {
    console.error('Get connection status error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to get connection status', 500);
  }
});

/**
 * Admin routes
 */

/**
 * GET /api/users/:userId/activity - Get user activity logs (admin only)
 */
router.get('/:userId/activity', authenticate, async (req, res) => {
  try {
    // TODO: Add admin role check middleware
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await userService.getUserActivity(userId, page, limit);

    return successResponse(res, result, 200, 'User activity retrieved successfully');
  } catch (error) {
    console.error('Get user activity error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to get user activity', 500);
  }
});

/**
 * POST /api/users/:userId/moderate - Moderate user (admin only)
 */
router.post('/:userId/moderate', authenticate, async (req, res) => {
  try {
    // TODO: Add admin role check middleware
    const adminId = req.user!.id;
    const userId = req.params.userId;
    const { type, reason, duration } = req.body;

    if (!type || !reason) {
      return errorResponse(res, 'Moderation type and reason are required', 400);
    }

    if (!['warn', 'suspend', 'ban', 'unban'].includes(type)) {
      return errorResponse(res, 'Invalid moderation type', 400);
    }

    await userService.moderateUser(adminId, userId, { type, reason, duration });

    return successResponse(res, null, 200, `User ${type}ed successfully`);
  } catch (error) {
    console.error('Moderate user error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to moderate user', 400);
  }
});

export default router;