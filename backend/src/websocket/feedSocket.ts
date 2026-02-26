import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export const setupFeedSocket = (io: Server) => {
  // Create a namespace for feed updates
  const feedNamespace = io.of('/feed');

  // Authentication middleware
  feedNamespace.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.id;
      socket.username = decoded.username;
      
      next();
    } catch (error) {
      console.error('Feed socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  feedNamespace.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected to feed: ${socket.username} (${socket.userId})`);

    // Join user's personal feed room
    socket.join(`user:${socket.userId}`);

    // Disconnect
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected from feed: ${socket.username} (${reason})`);
    });
  });

  return feedNamespace;
};

// Helper function to broadcast new post to followers
export const broadcastNewPost = (io: Server, post: any, followerIds: string[]) => {
  const feedNamespace = io.of('/feed');
  
  // Broadcast to all followers
  followerIds.forEach(followerId => {
    feedNamespace.to(`user:${followerId}`).emit('new_post', post);
  });

  console.log(`📢 Broadcasted new post ${post.id} to ${followerIds.length} followers`);
};

// Helper function to broadcast post update
export const broadcastPostUpdate = (io: Server, post: any) => {
  const feedNamespace = io.of('/feed');
  feedNamespace.emit('post_updated', post);
  console.log(`📢 Broadcasted post update: ${post.id}`);
};

// Helper function to broadcast post deletion
export const broadcastPostDelete = (io: Server, postId: string) => {
  const feedNamespace = io.of('/feed');
  feedNamespace.emit('post_deleted', { postId });
  console.log(`📢 Broadcasted post deletion: ${postId}`);
};
