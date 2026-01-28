import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';
import { MessageService } from './messageService';
import { CORS_ORIGIN } from '../config/env';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
  socketId: string;
}

export interface MessageBroadcastData {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
}

export class WebSocketService {
  private io: SocketIOServer;
  private prisma: PrismaClient;
  private messageService: MessageService;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(server: HTTPServer, prisma: PrismaClient) {
    this.prisma = prisma;
    this.messageService = new MessageService(prisma);
    
    this.io = new SocketIOServer(server, {
      cors: {
        origin: CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup authentication middleware for Socket.io
   */
  private setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const payload = verifyToken(token);
        const user = await this.prisma.user.findUnique({
          where: { id: payload.id },
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            isActive: true
          }
        });

        if (!user || !user.isActive) {
          return next(new Error('Invalid or inactive user'));
        }

        socket.userId = user.id;
        socket.user = {
          id: user.id,
          username: user.username,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined
        };
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup main event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
      this.setupMessageHandlers(socket);
      this.setupPresenceHandlers(socket);
      this.setupConversationHandlers(socket);
    });
  }

  /**
   * Handle user connection
   */
  private async handleConnection(socket: AuthenticatedSocket): Promise<void> {
    if (!socket.userId) return;

    console.log(`User ${socket.userId} connected with socket ${socket.id}`);

    // Track user socket
    if (!this.userSockets.has(socket.userId)) {
      this.userSockets.set(socket.userId, new Set());
    }
    this.userSockets.get(socket.userId)!.add(socket.id);
    this.socketUsers.set(socket.id, socket.userId);

    // Update user online status
    await this.updateUserPresence(socket.userId, true);

    // Join user to their conversation rooms
    await this.joinUserConversations(socket);

    // Broadcast presence update to contacts
    await this.broadcastPresenceUpdate(socket.userId, true);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  /**
   * Handle user disconnection
   */
  private async handleDisconnection(socket: AuthenticatedSocket): Promise<void> {
    if (!socket.userId) return;

    console.log(`User ${socket.userId} disconnected from socket ${socket.id}`);

    // Remove socket tracking
    const userSockets = this.userSockets.get(socket.userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        this.userSockets.delete(socket.userId);
        // User is completely offline
        await this.updateUserPresence(socket.userId, false);
        await this.broadcastPresenceUpdate(socket.userId, false);
      }
    }
    this.socketUsers.delete(socket.id);
  }

  /**
   * Setup message-related event handlers
   */
  private setupMessageHandlers(socket: AuthenticatedSocket): void {
    // Send message
    socket.on('send_message', async (data: {
      conversationId: string;
      content: string;
    }) => {
      try {
        if (!socket.userId) return;

        const message = await this.messageService.sendMessage({
          conversationId: data.conversationId,
          senderId: socket.userId,
          content: data.content
        });

        // Broadcast message to conversation participants
        await this.broadcastToConversation(data.conversationId, 'new_message', {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt,
          sender: message.sender
        });

        // Send confirmation to sender
        socket.emit('message_sent', { messageId: message.id, success: true });

      } catch (error) {
        socket.emit('message_error', { 
          error: error instanceof Error ? error.message : 'Failed to send message' 
        });
      }
    });

    // Mark messages as read
    socket.on('mark_as_read', async (data: {
      conversationId: string;
      messageId?: string;
    }) => {
      try {
        if (!socket.userId) return;

        await this.messageService.markAsRead(data.conversationId, socket.userId, data.messageId);

        // Broadcast read status to conversation participants
        await this.broadcastToConversation(data.conversationId, 'message_read', {
          conversationId: data.conversationId,
          userId: socket.userId,
          messageId: data.messageId,
          readAt: new Date()
        });

      } catch (error) {
        socket.emit('read_error', { 
          error: error instanceof Error ? error.message : 'Failed to mark as read' 
        });
      }
    });

    // Typing indicators
    socket.on('typing_start', async (data: { conversationId: string }) => {
      if (!socket.userId) return;
      
      socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
        conversationId: data.conversationId,
        userId: socket.userId,
        username: socket.user?.username,
        isTyping: true
      });
    });

    socket.on('typing_stop', async (data: { conversationId: string }) => {
      if (!socket.userId) return;
      
      socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
        conversationId: data.conversationId,
        userId: socket.userId,
        username: socket.user?.username,
        isTyping: false
      });
    });
  }

  /**
   * Setup presence-related event handlers
   */
  private setupPresenceHandlers(socket: AuthenticatedSocket): void {
    // Get online users
    socket.on('get_online_users', async () => {
      if (!socket.userId) return;

      const onlineUsers = Array.from(this.userSockets.keys());
      socket.emit('online_users', onlineUsers);
    });

    // Check user presence
    socket.on('check_presence', async (data: { userIds: string[] }) => {
      if (!socket.userId) return;

      const presenceData = data.userIds.map(userId => ({
        userId,
        isOnline: this.userSockets.has(userId)
      }));

      socket.emit('presence_data', presenceData);
    });
  }

  /**
   * Setup conversation-related event handlers
   */
  private setupConversationHandlers(socket: AuthenticatedSocket): void {
    // Join specific conversation room
    socket.on('join_conversation', async (data: { conversationId: string }) => {
      try {
        if (!socket.userId) return;

        // Verify user is member of conversation
        const isMember = await this.messageService.isUserInConversation(data.conversationId, socket.userId);
        if (!isMember) {
          socket.emit('join_error', { error: 'Not a member of this conversation' });
          return;
        }

        socket.join(`conversation:${data.conversationId}`);
        socket.emit('joined_conversation', { conversationId: data.conversationId });

      } catch (error) {
        socket.emit('join_error', { 
          error: error instanceof Error ? error.message : 'Failed to join conversation' 
        });
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (data: { conversationId: string }) => {
      socket.leave(`conversation:${data.conversationId}`);
      socket.emit('left_conversation', { conversationId: data.conversationId });
    });
  }

  /**
   * Join user to all their conversation rooms
   */
  private async joinUserConversations(socket: AuthenticatedSocket): Promise<void> {
    if (!socket.userId) return;

    try {
      const conversations = await this.messageService.getConversations({
        userId: socket.userId,
        limit: 100 // Get all conversations
      });

      for (const conversation of conversations.conversations) {
        socket.join(`conversation:${conversation.id}`);
      }
    } catch (error) {
      console.error('Failed to join user conversations:', error);
    }
  }

  /**
   * Update user presence in database
   */
  private async updateUserPresence(userId: string, isOnline: boolean): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isOnline,
          lastSeen: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to update user presence:', error);
    }
  }

  /**
   * Broadcast presence update to user's contacts
   */
  private async broadcastPresenceUpdate(userId: string, isOnline: boolean): Promise<void> {
    try {
      // Get user's conversations to notify participants
      const conversations = await this.messageService.getConversations({
        userId,
        limit: 100
      });

      const notifiedUsers = new Set<string>();

      for (const conversation of conversations.conversations) {
        for (const member of conversation.members) {
          const participant = member.user;
          if (participant.id !== userId && !notifiedUsers.has(participant.id)) {
            notifiedUsers.add(participant.id);
            
            // Send to all sockets of this user
            const userSockets = this.userSockets.get(participant.id);
            if (userSockets) {
              for (const socketId of userSockets) {
                this.io.to(socketId).emit('presence_update', {
                  userId,
                  isOnline,
                  lastSeen: new Date()
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to broadcast presence update:', error);
    }
  }

  /**
   * Broadcast message to all participants in a conversation
   */
  public async broadcastToConversation(
    conversationId: string, 
    event: string, 
    data: any
  ): Promise<void> {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  /**
   * Send message to specific user (all their sockets)
   */
  public async sendToUser(userId: string, event: string, data: any): Promise<void> {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      for (const socketId of userSockets) {
        this.io.to(socketId).emit(event, data);
      }
    }
  }

  /**
   * Get user presence information
   */
  public getUserPresence(userId: string): UserPresence | null {
    const userSockets = this.userSockets.get(userId);
    if (!userSockets || userSockets.size === 0) {
      return null;
    }

    return {
      userId,
      isOnline: true,
      lastSeen: new Date(),
      socketId: Array.from(userSockets)[0] // Return first socket ID
    };
  }

  /**
   * Get all online users
   */
  public getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  /**
   * Get Socket.io server instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Disconnect user from all sockets
   */
  public async disconnectUser(userId: string): Promise<void> {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      for (const socketId of userSockets) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
      }
    }
  }

  /**
   * Get connection statistics
   */
  public getStats(): {
    totalConnections: number;
    uniqueUsers: number;
    averageSocketsPerUser: number;
  } {
    const totalConnections = this.socketUsers.size;
    const uniqueUsers = this.userSockets.size;
    const averageSocketsPerUser = uniqueUsers > 0 ? totalConnections / uniqueUsers : 0;

    return {
      totalConnections,
      uniqueUsers,
      averageSocketsPerUser: Math.round(averageSocketsPerUser * 100) / 100
    };
  }
}