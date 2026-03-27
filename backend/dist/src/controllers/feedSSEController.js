"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionStats = exports.broadcastPostDelete = exports.broadcastPostUpdate = exports.broadcastNewPost = exports.feedSSE = void 0;
// Store active SSE connections
const connections = new Map();
/**
 * SSE endpoint for real-time feed updates
 * More efficient than WebSockets for one-way server→client push
 */
const feedSSE = async (req, res) => {
    const userId = req.user.id;
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
exports.feedSSE = feedSSE;
/**
 * Broadcast new post to followers via SSE
 */
const broadcastNewPost = async (post, followerIds) => {
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
            }
            catch (error) {
                console.error(`Failed to send to ${followerId}:`, error);
                connections.delete(followerId);
            }
        }
    });
    console.log(`📢 SSE: Broadcasted new post to ${sentCount}/${followerIds.length} followers`);
};
exports.broadcastNewPost = broadcastNewPost;
/**
 * Broadcast post update to all connected users
 */
const broadcastPostUpdate = (post) => {
    const message = JSON.stringify({
        type: 'post_updated',
        data: post
    });
    let sentCount = 0;
    connections.forEach((connection, userId) => {
        try {
            connection.write(`data: ${message}\n\n`);
            sentCount++;
        }
        catch (error) {
            console.error(`Failed to send to ${userId}:`, error);
            connections.delete(userId);
        }
    });
    console.log(`📢 SSE: Broadcasted post update to ${sentCount} users`);
};
exports.broadcastPostUpdate = broadcastPostUpdate;
/**
 * Broadcast post deletion to all connected users
 */
const broadcastPostDelete = (postId) => {
    const message = JSON.stringify({
        type: 'post_deleted',
        data: { postId }
    });
    let sentCount = 0;
    connections.forEach((connection, userId) => {
        try {
            connection.write(`data: ${message}\n\n`);
            sentCount++;
        }
        catch (error) {
            console.error(`Failed to send to ${userId}:`, error);
            connections.delete(userId);
        }
    });
    console.log(`📢 SSE: Broadcasted post deletion to ${sentCount} users`);
};
exports.broadcastPostDelete = broadcastPostDelete;
/**
 * Get connection stats (for monitoring)
 */
const getConnectionStats = () => {
    return {
        activeConnections: connections.size,
        connectedUsers: Array.from(connections.keys())
    };
};
exports.getConnectionStats = getConnectionStats;
