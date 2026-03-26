import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import prisma from '../config/database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupMessageSocket = (io: Server) => {
  const messageNamespace = io.of('/messages');

  // Authentication middleware
  messageNamespace.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      socket.userId = decoded.id;

      // Update user online status
      await prisma.user.update({
        where: { id: decoded.id },
        data: { isOnline: true, lastSeen: new Date() }
      });

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  messageNamespace.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User ${socket.userId} connected to messages`);

    // Join user's personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Join conversation rooms
    socket.on('join:conversation', async (conversationId: string) => {
      try {
        // Verify user is member of conversation
        const member = await prisma.conversationMember.findUnique({
          where: {
            conversationId_userId: {
              conversationId,
              userId: socket.userId!
            }
          }
        });

        if (member) {
          socket.join(`conversation:${conversationId}`);
          console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        }
      } catch (error) {
        console.error('Error joining conversation:', error);
      }
    });

    // Leave conversation room
    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Send message
    socket.on('message:send', async (data: {
      conversationId: string;
      content: string;
    }) => {
      try {
        // Verify user is member
        const member = await prisma.conversationMember.findUnique({
          where: {
            conversationId_userId: {
              conversationId: data.conversationId,
              userId: socket.userId!
            }
          }
        });

        if (!member) {
          socket.emit('error', { message: 'Not a member of this conversation' });
          return;
        }

        // Create message
        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            senderId: socket.userId!,
            content: data.content.trim()
          },
          include: {
            sender: {
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

        // Update conversation
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: { updatedAt: new Date() }
        });

        // Emit to all members in the conversation
        messageNamespace.to(`conversation:${data.conversationId}`).emit('message:new', message);

        // Get other members for notifications
        const otherMembers = await prisma.conversationMember.findMany({
          where: {
            conversationId: data.conversationId,
            userId: { not: socket.userId }
          },
          select: { userId: true }
        });

        // Send notification to offline members
        otherMembers.forEach(member => {
          messageNamespace.to(`user:${member.userId}`).emit('message:notification', {
            conversationId: data.conversationId,
            message
          });
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:user', {
        userId: socket.userId,
        conversationId
      });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        userId: socket.userId,
        conversationId
      });
    });

    // Mark messages as read
    socket.on('messages:read', async (conversationId: string) => {
      try {
        const member = await prisma.conversationMember.findUnique({
          where: {
            conversationId_userId: {
              conversationId,
              userId: socket.userId!
            }
          }
        });

        if (member) {
          await prisma.conversationMember.update({
            where: {
              conversationId_userId: {
                conversationId,
                userId: socket.userId!
              }
            },
            data: { lastReadAt: new Date() }
          });

          // Notify other members
          socket.to(`conversation:${conversationId}`).emit('messages:read', {
            userId: socket.userId,
            conversationId,
            readAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User ${socket.userId} disconnected from messages`);
      
      try {
        // Update user offline status
        await prisma.user.update({
          where: { id: socket.userId },
          data: { isOnline: false, lastSeen: new Date() }
        });
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    });
  });

  return messageNamespace;
};
