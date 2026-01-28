import { PrismaClient, User } from '@prisma/client';

export interface UserSearchFilters {
  skills?: string[];
  location?: string;
  experience?: string;
  company?: string;
}

export interface ConnectionRequest {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
  createdAt: Date;
  updatedAt: Date;
  requester?: User;
  addressee?: User;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ModerationAction {
  type: 'warn' | 'suspend' | 'ban' | 'unban';
  reason: string;
  duration?: number; // in days
}

export class UserService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Search users with filters
   */
  async searchUsers(query: string, filters: UserSearchFilters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Build where clause for search
    const whereClause: any = {
      isActive: true,
      OR: [
        {
          firstName: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          lastName: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          username: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          bio: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ]
    };

    // Add skill filter
    if (filters.skills && filters.skills.length > 0) {
      whereClause.skills = {
        some: {
          skillName: {
            in: filters.skills,
            mode: 'insensitive'
          }
        }
      };
    }

    // Add location filter
    if (filters.location) {
      whereClause.location = {
        contains: filters.location,
        mode: 'insensitive'
      };
    }

    // Add experience filter
    if (filters.experience) {
      whereClause.experience = {
        some: {
          position: {
            contains: filters.experience,
            mode: 'insensitive'
          }
        }
      };
    }

    // Add company filter
    if (filters.company) {
      whereClause.experience = {
        some: {
          company: {
            contains: filters.company,
            mode: 'insensitive'
          }
        }
      };
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        profilePicture: true,
        location: true,
        isOnline: true,
        lastSeen: true,
        skills: {
          select: {
            skillName: true,
            proficiencyLevel: true,
            yearsExperience: true
          }
        },
        experience: {
          select: {
            company: true,
            position: true,
            isCurrent: true
          },
          where: {
            isCurrent: true
          },
          take: 1
        }
      },
      skip,
      take: limit,
      orderBy: [
        { isOnline: 'desc' },
        { lastSeen: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    const total = await this.prisma.user.count({
      where: whereClause
    });

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get suggested connections based on shared interests and activity
   */
  async getSuggestedConnections(userId: string, limit = 10) {
    // Get user's skills and connections
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: true,
        connectionRequests: {
          select: { addresseeId: true }
        },
        connectionReceived: {
          select: { requesterId: true }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get IDs of users already connected or with pending requests
    const connectedUserIds = [
      ...user.connectionRequests.map(c => c.addresseeId),
      ...user.connectionReceived.map(c => c.requesterId),
      userId // exclude self
    ];

    const userSkills = user.skills.map(s => s.skillName);

    // Find users with similar skills
    const suggestedUsers = await this.prisma.user.findMany({
      where: {
        id: {
          notIn: connectedUserIds
        },
        isActive: true,
        skills: userSkills.length > 0 ? {
          some: {
            skillName: {
              in: userSkills,
              mode: 'insensitive'
            }
          }
        } : undefined
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        profilePicture: true,
        location: true,
        isOnline: true,
        lastSeen: true,
        skills: {
          select: {
            skillName: true,
            proficiencyLevel: true
          }
        },
        experience: {
          select: {
            company: true,
            position: true
          },
          where: {
            isCurrent: true
          },
          take: 1
        }
      },
      take: limit,
      orderBy: [
        { isOnline: 'desc' },
        { lastSeen: 'desc' }
      ]
    });

    return suggestedUsers;
  }

  /**
   * Send connection request
   */
  async sendConnectionRequest(fromUserId: string, toUserId: string): Promise<ConnectionRequest> {
    if (fromUserId === toUserId) {
      throw new Error('Cannot send connection request to yourself');
    }

    // Check if users exist
    const [fromUser, toUser] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: fromUserId } }),
      this.prisma.user.findUnique({ where: { id: toUserId } })
    ]);

    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }

    // Check if connection already exists
    const existingConnection = await this.prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: fromUserId, addresseeId: toUserId },
          { requesterId: toUserId, addresseeId: fromUserId }
        ]
      }
    });

    if (existingConnection) {
      if (existingConnection.status === 'BLOCKED') {
        throw new Error('Cannot send connection request to blocked user');
      }
      if (existingConnection.status === 'PENDING') {
        throw new Error('Connection request already pending');
      }
      if (existingConnection.status === 'ACCEPTED') {
        throw new Error('Users are already connected');
      }
    }

    // Create connection request
    const connection = await this.prisma.userConnection.create({
      data: {
        requesterId: fromUserId,
        addresseeId: toUserId,
        status: 'PENDING'
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        },
        addressee: {
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

    // Log activity
    await this.logUserActivity(fromUserId, 'connection_request_sent', {
      targetUserId: toUserId,
      connectionId: connection.id
    });

    return connection as ConnectionRequest;
  }

  /**
   * Respond to connection request
   */
  async respondToConnectionRequest(requestId: string, response: 'accept' | 'decline', userId: string): Promise<void> {
    const connection = await this.prisma.userConnection.findUnique({
      where: { id: requestId }
    });

    if (!connection) {
      throw new Error('Connection request not found');
    }

    if (connection.addresseeId !== userId) {
      throw new Error('Not authorized to respond to this connection request');
    }

    if (connection.status !== 'PENDING') {
      throw new Error('Connection request is not pending');
    }

    const newStatus = response === 'accept' ? 'ACCEPTED' : 'DECLINED';

    await this.prisma.userConnection.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });

    // Log activity
    await this.logUserActivity(userId, `connection_request_${response}ed`, {
      requesterId: connection.requesterId,
      connectionId: requestId
    });
  }

  /**
   * Get user connections
   */
  async getConnections(userId: string, status: 'accepted' | 'pending' | 'all' = 'accepted') {
    const whereClause: any = {
      OR: [
        { requesterId: userId },
        { addresseeId: userId }
      ]
    };

    if (status !== 'all') {
      const statusEnum = status === 'accepted' ? 'ACCEPTED' : 'PENDING';
      whereClause.status = statusEnum;
    }

    const connections = await this.prisma.userConnection.findMany({
      where: whereClause,
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            isOnline: true,
            lastSeen: true
          }
        },
        addressee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            isOnline: true,
            lastSeen: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Transform to show the other user in the connection
    return connections.map(connection => ({
      ...connection,
      otherUser: connection.requesterId === userId ? connection.addressee : connection.requester
    }));
  }

  /**
   * Block user
   */
  async blockUser(userId: string, blockedUserId: string): Promise<void> {
    if (userId === blockedUserId) {
      throw new Error('Cannot block yourself');
    }

    // Check if users exist
    const [user, blockedUser] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.user.findUnique({ where: { id: blockedUserId } })
    ]);

    if (!user || !blockedUser) {
      throw new Error('User not found');
    }

    // Check if connection exists
    const existingConnection = await this.prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: blockedUserId },
          { requesterId: blockedUserId, addresseeId: userId }
        ]
      }
    });

    if (existingConnection) {
      // Update existing connection to blocked
      await this.prisma.userConnection.update({
        where: { id: existingConnection.id },
        data: {
          status: 'BLOCKED',
          updatedAt: new Date()
        }
      });
    } else {
      // Create new blocked connection
      await this.prisma.userConnection.create({
        data: {
          requesterId: userId,
          addresseeId: blockedUserId,
          status: 'BLOCKED'
        }
      });
    }

    // Log activity
    await this.logUserActivity(userId, 'user_blocked', {
      blockedUserId,
      reason: 'User blocked'
    });
  }

  /**
   * Report user
   */
  async reportUser(reporterId: string, reportedUserId: string, reason: string, description?: string): Promise<void> {
    if (reporterId === reportedUserId) {
      throw new Error('Cannot report yourself');
    }

    // Check if users exist
    const [reporter, reportedUser] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: reporterId } }),
      this.prisma.user.findUnique({ where: { id: reportedUserId } })
    ]);

    if (!reporter || !reportedUser) {
      throw new Error('User not found');
    }

    // Create report
    await this.prisma.userReport.create({
      data: {
        reporterId,
        reportedId: reportedUserId,
        reason,
        description,
        status: 'PENDING'
      }
    });

    // Log activity
    await this.logUserActivity(reporterId, 'user_reported', {
      reportedUserId,
      reason,
      description
    });
  }

  /**
   * Get user activity logs (admin function)
   */
  async getUserActivity(userId: string, page = 1, limit = 50): Promise<{ activities: UserActivity[], pagination: any }> {
    const skip = (page - 1) * limit;

    const activities = await this.prisma.userActivityLog.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await this.prisma.userActivityLog.count({
      where: { userId }
    });

    return {
      activities: activities as UserActivity[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Moderate user (admin function)
   */
  async moderateUser(adminId: string, userId: string, action: ModerationAction): Promise<void> {
    // Check if admin exists and has admin privileges
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new Error('Admin user not found');
    }

    // Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      throw new Error('Target user not found');
    }

    // Apply moderation action
    let updateData: any = {};

    switch (action.type) {
      case 'suspend':
        updateData = {
          isActive: false,
          suspendedUntil: new Date(Date.now() + (action.duration || 7) * 24 * 60 * 60 * 1000)
        };
        break;
      case 'ban':
        updateData = {
          isActive: false,
          isBanned: true
        };
        break;
      case 'unban':
        updateData = {
          isActive: true,
          isBanned: false,
          suspendedUntil: null
        };
        break;
      case 'warn':
        // Just log the warning, no user update needed
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: updateData
      });
    }

    // Log moderation action
    await this.logUserActivity(adminId, `moderation_${action.type}`, {
      targetUserId: userId,
      reason: action.reason,
      duration: action.duration
    });

    // Log activity for target user
    await this.logUserActivity(userId, `moderated_${action.type}`, {
      moderatorId: adminId,
      reason: action.reason,
      duration: action.duration
    });
  }

  /**
   * Log user activity
   */
  private async logUserActivity(userId: string, action: string, details: any, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.prisma.userActivityLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
        userAgent
      }
    });
  }

  /**
   * Check if user is blocked by another user
   */
  async isUserBlocked(userId: string, otherUserId: string): Promise<boolean> {
    const blockedConnection = await this.prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: otherUserId, status: 'BLOCKED' },
          { requesterId: otherUserId, addresseeId: userId, status: 'BLOCKED' }
        ]
      }
    });

    return !!blockedConnection;
  }

  /**
   * Get connection status between two users
   */
  async getConnectionStatus(userId: string, otherUserId: string): Promise<string> {
    if (userId === otherUserId) {
      return 'self';
    }

    const connection = await this.prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: otherUserId },
          { requesterId: otherUserId, addresseeId: userId }
        ]
      }
    });

    if (!connection) {
      return 'none';
    }

    return connection.status;
  }
}