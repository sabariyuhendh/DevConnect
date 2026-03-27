"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCaveSocket = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const setupCaveSocket = (io) => {
    // Authentication middleware
    io.use(async (socket, next) => {
        var _a;
        try {
            const token = socket.handshake.auth.token || ((_a = socket.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            // Fetch user details from database
            const user = await client_1.default.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, username: true, firstName: true, lastName: true }
            });
            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }
            socket.userId = user.id;
            socket.username = user.username || `${user.firstName} ${user.lastName}`;
            next();
        }
        catch (error) {
            console.error('Socket authentication error:', error);
            next(new Error('Authentication error: Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.username} (${socket.userId})`);
        // Join room
        socket.on('join_room', async (roomId) => {
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
                const messages = await client_1.default.caveChatMessage.findMany({
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
                const formattedMessages = messages.map((msg) => ({
                    id: msg.id,
                    content: msg.content,
                    userId: msg.userId,
                    username: msg.user.username || `${msg.user.firstName} ${msg.user.lastName}`,
                    timestamp: msg.createdAt.toISOString(),
                    roomId: msg.roomId
                }));
                socket.emit('message_history', formattedMessages);
            }
            catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });
        // Leave room
        socket.on('leave_room', (roomId) => {
            socket.leave(roomId);
            console.log(`🚪 ${socket.username} left room: ${roomId}`);
            socket.to(roomId).emit('user_left', {
                userId: socket.userId,
                username: socket.username,
                timestamp: new Date().toISOString()
            });
        });
        // Send message
        socket.on('send_message', async (data) => {
            try {
                const { roomId, content } = data;
                if (!content || !content.trim()) {
                    return socket.emit('error', { message: 'Message content is required' });
                }
                // Save message to database
                const message = await client_1.default.caveChatMessage.create({
                    data: {
                        roomId,
                        userId: socket.userId,
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
            }
            catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        // Typing indicator
        socket.on('typing_start', (roomId) => {
            socket.to(roomId).emit('user_typing', {
                userId: socket.userId,
                username: socket.username
            });
        });
        socket.on('typing_stop', (roomId) => {
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
exports.setupCaveSocket = setupCaveSocket;
