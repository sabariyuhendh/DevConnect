import { Server, Socket } from 'socket.io';
import prisma from '../../prisma/client';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export const setupCaveSocket = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Fetch user details from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, firstName: true, lastName: true }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.username = user.username || `${user.firstName} ${user.lastName}`;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.username} (${socket.userId})`);

    // Join room
    socket.on('join_room', async (roomId: string) => {
      try {
        socket.join(roomId);
        console.log(`🚪 ${socket.username} joined room: ${roomId}`);
        
        // Notify room
        socket.to(roomId).emit('user_joined', {
          userId: socket.userId,
          username: socket.username,
          timestamp: new Date().toISOString()
        });

        // Send message history
        const messages = await prisma.caveChatMessage.findMany({
          where: { roomId },
          orderBy: { createdAt: 'asc' },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        });

        const formattedMessages = messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          userId: msg.userId,
          username: msg.user.username || `${msg.user.firstName} ${msg.user.lastName}`,
          timestamp: msg.createdAt.toISOString(),
          roomId: msg.roomId
        }));

        socket.emit('message_history', formattedMessages);

      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave room
    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`🚪 ${socket.username} left room: ${roomId}`);
      
      socket.to(roomId).emit('user_left', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date().toISOString()
      });
    });

    // Send message
    socket.on('send_message', async (data: { roomId: string; content: string }) => {
      try {
        const { roomId, content } = data;

        if (!content || !content.trim()) {
          return socket.emit('error', { message: 'Message content is required' });
        }

        // Save message to database
        const message = await prisma.caveChatMessage.create({
          data: {
            roomId,
            userId: socket.userId!,
            content: content.trim()
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        });

        // Format message
        const formattedMessage = {
          id: message.id,
          content: message.content,
          userId: message.userId,
          username: message.user.username || `${message.user.firstName} ${message.user.lastName}`,
          timestamp: message.createdAt.toISOString(),
          roomId: message.roomId
        };

        // Broadcast to room (including sender)
        io.to(roomId).emit('message', formattedMessage);
        console.log(`📨 Message sent in ${roomId} by ${socket.username}`);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing_start', (roomId: string) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        username: socket.username
      });
    });

    socket.on('typing_stop', (roomId: string) => {
      socket.to(roomId).emit('user_stopped_typing', {
        userId: socket.userId
      });
    });

    // Disconnect
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.username} (${reason})`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error from ${socket.username}:`, error);
    });
  });

  return io;
};
