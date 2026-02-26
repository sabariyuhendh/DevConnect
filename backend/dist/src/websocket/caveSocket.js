"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCaveSocket = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const setupCaveSocket = (io) => {
    const caveNamespace = io.of('/cave');
    // Authentication middleware
    caveNamespace.use(async (socket, next) => {
        var _a;
        try {
            const token = socket.handshake.auth.token || ((_a = socket.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            socket.userId = decoded.userId;
            socket.username = decoded.username;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    caveNamespace.on('connection', (socket) => {
        console.log(`User ${socket.userId} connected to Cave`);
        // Join room
        socket.on('join_room', async (roomId) => {
            try {
                // Verify user is member or auto-join
                let member = await client_1.default.caveRoomMember.findUnique({
                    where: {
                        roomId_userId: {
                            roomId,
                            userId: socket.userId,
                        },
                    },
                });
                if (!member) {
                    // Auto-join user to room
                    member = await client_1.default.caveRoomMember.create({
                        data: {
                            roomId,
                            userId: socket.userId,
                        },
                    });
                }
                socket.join(roomId);
                // Notify room
                caveNamespace.to(roomId).emit('user_joined', {
                    userId: socket.userId,
                    username: socket.username,
                    timestamp: new Date(),
                });
                // Get online users count
                const socketsInRoom = await caveNamespace.in(roomId).fetchSockets();
                caveNamespace.to(roomId).emit('room_stats', {
                    onlineCount: socketsInRoom.length,
                });
            }
            catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });
        // Leave room
        socket.on('leave_room', async (roomId) => {
            socket.leave(roomId);
            caveNamespace.to(roomId).emit('user_left', {
                userId: socket.userId,
                username: socket.username,
                timestamp: new Date(),
            });
            // Update online count
            const socketsInRoom = await caveNamespace.in(roomId).fetchSockets();
            caveNamespace.to(roomId).emit('room_stats', {
                onlineCount: socketsInRoom.length,
            });
        });
        // Send message
        socket.on('send_message', async (data) => {
            try {
                const { roomId, content } = data;
                // Save message to database
                const message = await client_1.default.caveChatMessage.create({
                    data: {
                        roomId,
                        userId: socket.userId,
                        content,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                            },
                        },
                    },
                });
                // Broadcast to room
                caveNamespace.to(roomId).emit('new_message', message);
                // Update reputation (async, don't wait)
                updateReputation(socket.userId, 'chat_message').catch(console.error);
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
                username: socket.username,
            });
        });
        socket.on('typing_stop', (roomId) => {
            socket.to(roomId).emit('user_stopped_typing', {
                userId: socket.userId,
            });
        });
        // Mark messages as read
        socket.on('mark_read', async (data) => {
            try {
                await client_1.default.caveRoomMember.update({
                    where: {
                        roomId_userId: {
                            roomId: data.roomId,
                            userId: socket.userId,
                        },
                    },
                    data: {
                        lastReadAt: new Date(),
                    },
                });
            }
            catch (error) {
                console.error('Error marking as read:', error);
            }
        });
        // Focus session events
        socket.on('focus_started', (data) => {
            socket.broadcast.emit('user_focusing', {
                userId: socket.userId,
                username: socket.username,
                duration: data.duration,
            });
        });
        socket.on('focus_completed', (data) => {
            socket.broadcast.emit('user_completed_focus', {
                userId: socket.userId,
                username: socket.username,
            });
        });
        // Disconnect
        socket.on('disconnect', async () => {
            console.log(`User ${socket.userId} disconnected from Cave`);
            // Get all rooms user was in
            const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
            // Notify each room
            for (const roomId of rooms) {
                caveNamespace.to(roomId).emit('user_left', {
                    userId: socket.userId,
                    username: socket.username,
                    timestamp: new Date(),
                });
                // Update online count
                const socketsInRoom = await caveNamespace.in(roomId).fetchSockets();
                caveNamespace.to(roomId).emit('room_stats', {
                    onlineCount: socketsInRoom.length,
                });
            }
        });
    });
    return caveNamespace;
};
exports.setupCaveSocket = setupCaveSocket;
// Helper function
async function updateReputation(userId, action) {
    let reputation = await client_1.default.caveReputation.findUnique({
        where: { userId },
    });
    if (!reputation) {
        reputation = await client_1.default.caveReputation.create({
            data: { userId },
        });
    }
    let pointsToAdd = 0;
    if (action === 'chat_message')
        pointsToAdd = 1;
    await client_1.default.caveReputation.update({
        where: { userId },
        data: {
            points: { increment: pointsToAdd },
        },
    });
}
