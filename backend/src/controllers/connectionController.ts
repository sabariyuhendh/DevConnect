import { RequestHandler } from 'express';
import prisma from '../config/database';
import { successResponse } from '../utils/apiResponse';
import { AppError } from '../utils/errors';
import { getParamAsString } from '../utils/helpers';

// Send connection request
export const sendConnectionRequest: RequestHandler = async (req, res, next) => {
  try {
    const requesterId = req.user!.id;
    const addresseeId = getParamAsString(req.params.userId);

    if (requesterId === addresseeId) {
      return next(new AppError('Cannot send connection request to yourself', 400));
    }

    // Check if addressee exists
    const addressee = await prisma.user.findUnique({
      where: { id: addresseeId },
      select: { id: true, username: true }
    });

    if (!addressee) {
      return next(new AppError('User not found', 404));
    }

    // Check if connection already exists
    const existingConnection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId }
        ]
      }
    });

    if (existingConnection) {
      return next(new AppError('Connection request already exists', 400));
    }

    // Create connection request
    const connection = await prisma.userConnection.create({
      data: {
        requesterId,
        addresseeId,
        status: 'PENDING'
      },
      include: {
        User_UserConnection_addresseeIdToUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      }
    });

    return successResponse(res, connection, 201, 'Connection request sent successfully');
  } catch (error) {
    return next(error);
  }
};

// Accept connection request
export const acceptConnectionRequest: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const connectionId = getParamAsString(req.params.connectionId);

    const connection = await prisma.userConnection.findUnique({
      where: { id: connectionId },
      include: {
        User_UserConnection_requesterIdToUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      }
    });

    if (!connection) {
      return next(new AppError('Connection request not found', 404));
    }

    if (connection.addresseeId !== userId) {
      return next(new AppError('Unauthorized to accept this connection request', 403));
    }

    if (connection.status !== 'PENDING') {
      return next(new AppError('Connection request is not pending', 400));
    }

    const updatedConnection = await prisma.userConnection.update({
      where: { id: connectionId },
      data: { status: 'ACCEPTED' },
      include: {
        User_UserConnection_requesterIdToUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      }
    });

    return successResponse(res, updatedConnection, 200, 'Connection request accepted');
  } catch (error) {
    return next(error);
  }
};

// Decline connection request
export const declineConnectionRequest: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const connectionId = getParamAsString(req.params.connectionId);

    const connection = await prisma.userConnection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return next(new AppError('Connection request not found', 404));
    }

    if (connection.addresseeId !== userId) {
      return next(new AppError('Unauthorized to decline this connection request', 403));
    }

    if (connection.status !== 'PENDING') {
      return next(new AppError('Connection request is not pending', 400));
    }

    await prisma.userConnection.update({
      where: { id: connectionId },
      data: { status: 'DECLINED' }
    });

    return successResponse(res, null, 200, 'Connection request declined');
  } catch (error) {
    return next(error);
  }
};

// Remove connection
export const removeConnection: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const connectionId = getParamAsString(req.params.connectionId);

    const connection = await prisma.userConnection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return next(new AppError('Connection not found', 404));
    }

    if (connection.requesterId !== userId && connection.addresseeId !== userId) {
      return next(new AppError('Unauthorized to remove this connection', 403));
    }

    await prisma.userConnection.delete({
      where: { id: connectionId }
    });

    return successResponse(res, null, 200, 'Connection removed successfully');
  } catch (error) {
    return next(error);
  }
};

// Get user's connections
export const getUserConnections: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string || 'ACCEPTED';

    const where = {
      OR: [
        { requesterId: userId },
        { addresseeId: userId }
      ],
      status: status as any
    };

    const [connections, total] = await Promise.all([
      prisma.userConnection.findMany({
        where,
        include: {
          User_UserConnection_requesterIdToUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              title: true,
              company: true,
              isOnline: true,
              lastSeen: true
            }
          },
          User_UserConnection_addresseeIdToUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              title: true,
              company: true,
              isOnline: true,
              lastSeen: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userConnection.count({ where })
    ]);

    // Transform connections to show the other user
    const transformedConnections = connections.map(connection => {
      const otherUser = connection.requesterId === userId 
        ? connection.User_UserConnection_addresseeIdToUser
        : connection.User_UserConnection_requesterIdToUser;

      return {
        id: connection.id,
        status: connection.status,
        createdAt: connection.createdAt,
        user: otherUser
      };
    });

    return successResponse(res, {
      connections: transformedConnections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, 200, 'Connections retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

// Get pending connection requests (received)
export const getPendingRequests: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const pendingRequests = await prisma.userConnection.findMany({
      where: {
        addresseeId: userId,
        status: 'PENDING'
      },
      include: {
        User_UserConnection_requesterIdToUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            title: true,
            company: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transformedRequests = pendingRequests.map(request => ({
      id: request.id,
      createdAt: request.createdAt,
      user: request.User_UserConnection_requesterIdToUser
    }));

    return successResponse(res, transformedRequests, 200, 'Pending requests retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

// Get sent connection requests
export const getSentRequests: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const sentRequests = await prisma.userConnection.findMany({
      where: {
        requesterId: userId,
        status: 'PENDING'
      },
      include: {
        User_UserConnection_addresseeIdToUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            title: true,
            company: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transformedRequests = sentRequests.map(request => ({
      id: request.id,
      createdAt: request.createdAt,
      user: request.User_UserConnection_addresseeIdToUser
    }));

    return successResponse(res, transformedRequests, 200, 'Sent requests retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

// Get connection status between two users
export const getConnectionStatus: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const otherUserId = getParamAsString(req.params.userId);

    if (userId === otherUserId) {
      return successResponse(res, { status: 'SELF' }, 200, 'Connection status retrieved');
    }

    const connection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: otherUserId },
          { requesterId: otherUserId, addresseeId: userId }
        ]
      }
    });

    if (!connection) {
      return successResponse(res, { status: 'NONE' }, 200, 'No connection found');
    }

    const status = {
      status: connection.status,
      isRequester: connection.requesterId === userId,
      connectionId: connection.id,
      createdAt: connection.createdAt
    };

    return successResponse(res, status, 200, 'Connection status retrieved');
  } catch (error) {
    return next(error);
  }
};

// Search for users to connect with
export const searchUsers: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const search = req.query.search as string || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!search.trim()) {
      return next(new AppError('Search query is required', 400));
    }

    // Get users excluding current user and existing connections
    const existingConnections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { addresseeId: userId }
        ]
      },
      select: {
        requesterId: true,
        addresseeId: true
      }
    });

    const excludeUserIds = [userId];
    existingConnections.forEach(conn => {
      if (conn.requesterId !== userId) excludeUserIds.push(conn.requesterId);
      if (conn.addresseeId !== userId) excludeUserIds.push(conn.addresseeId);
    });

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          AND: [
            { id: { notIn: excludeUserIds } },
            { isActive: true },
            {
              OR: [
                { username: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          title: true,
          company: true,
          location: true,
          isOnline: true,
          lastSeen: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({
        where: {
          AND: [
            { id: { notIn: excludeUserIds } },
            { isActive: true },
            {
              OR: [
                { username: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } }
              ]
            }
          ]
        }
      })
    ]);

    return successResponse(res, {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, 200, 'Users found successfully');
  } catch (error) {
    return next(error);
  }
};