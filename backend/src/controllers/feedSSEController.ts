import { Request, Response } from 'express';
import prisma from '../../prisma/client';

// Store active SSE connections
const connections = new Map<string, Response>();

/**
 * SSE endpoint for real-time feed updates
 * More efficient than WebSockets for one-way server→client push
 */
export const feedSSE = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

  // Store connection
  connections.set(userId, res);
  console.log(`✅ SSE: User ${userId} connected. Total connections: ${connections.size}`);

  // Heartbeat to keep connection alive (every 30 seconds)
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    connections.delete(userId);
    console.log(`❌ SSE: User ${userId} disconnected. Total connections: ${connections.size}`);
  });
};

/**
 * Broadcast new post to followers via SSE
 */
export const broadcastNewPost = async (post: any, followerIds: string[]) => {
  const message = JSON.stringify({
    type: 'new_post',
    data: post
  });

  let sentCount = 0;
  followerIds.forEach(followerId => {
    const connection = connections.get(followerId);
    if (connection) {
      try {
        connection.write(`data: ${message}\n\n`);
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${followerId}:`, error);
        connections.delete(followerId);
      }
    }
  });

  console.log(`📢 SSE: Broadcasted new post to ${sentCount}/${followerIds.length} followers`);
};

/**
 * Broadcast post update to all connected users
 */
export const broadcastPostUpdate = (post: any) => {
  const message = JSON.stringify({
    type: 'post_updated',
    data: post
  });

  let sentCount = 0;
  connections.forEach((connection, userId) => {
    try {
      connection.write(`data: ${message}\n\n`);
      sentCount++;
    } catch (error) {
      console.error(`Failed to send to ${userId}:`, error);
      connections.delete(userId);
    }
  });

  console.log(`📢 SSE: Broadcasted post update to ${sentCount} users`);
};

/**
 * Broadcast post deletion to all connected users
 */
export const broadcastPostDelete = (postId: string) => {
  const message = JSON.stringify({
    type: 'post_deleted',
    data: { postId }
  });

  let sentCount = 0;
  connections.forEach((connection, userId) => {
    try {
      connection.write(`data: ${message}\n\n`);
      sentCount++;
    } catch (error) {
      console.error(`Failed to send to ${userId}:`, error);
      connections.delete(userId);
    }
  });

  console.log(`📢 SSE: Broadcasted post deletion to ${sentCount} users`);
};

/**
 * Get connection stats (for monitoring)
 */
export const getConnectionStats = () => {
  return {
    activeConnections: connections.size,
    connectedUsers: Array.from(connections.keys())
  };
};
