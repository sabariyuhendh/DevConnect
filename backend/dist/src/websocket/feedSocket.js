"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastPostDelete = exports.broadcastPostUpdate = exports.broadcastNewPost = exports.setupFeedSocket = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const setupFeedSocket = (io) => {
    // Create a namespace for feed updates
    const feedNamespace = io.of('/feed');
    // Authentication middleware
    feedNamespace.use(async (socket, next) => {
        var _a;
        try {
            const token = socket.handshake.auth.token || ((_a = socket.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            socket.userId = decoded.id;
            socket.username = decoded.username;
            next();
        }
        catch (error) {
            console.error('Feed socket authentication error:', error);
            next(new Error('Authentication error: Invalid token'));
        }
    });
    feedNamespace.on('connection', (socket) => {
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
exports.setupFeedSocket = setupFeedSocket;
// Helper function to broadcast new post to followers
const broadcastNewPost = (io, post, followerIds) => {
    const feedNamespace = io.of('/feed');
    // Broadcast to all followers
    followerIds.forEach(followerId => {
        feedNamespace.to(`user:${followerId}`).emit('new_post', post);
    });
    console.log(`📢 Broadcasted new post ${post.id} to ${followerIds.length} followers`);
};
exports.broadcastNewPost = broadcastNewPost;
// Helper function to broadcast post update
const broadcastPostUpdate = (io, post) => {
    const feedNamespace = io.of('/feed');
    feedNamespace.emit('post_updated', post);
    console.log(`📢 Broadcasted post update: ${post.id}`);
};
exports.broadcastPostUpdate = broadcastPostUpdate;
// Helper function to broadcast post deletion
const broadcastPostDelete = (io, postId) => {
    const feedNamespace = io.of('/feed');
    feedNamespace.emit('post_deleted', { postId });
    console.log(`📢 Broadcasted post deletion: ${postId}`);
};
exports.broadcastPostDelete = broadcastPostDelete;
