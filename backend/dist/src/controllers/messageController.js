"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.deleteMessage = exports.markAsRead = exports.sendMessage = exports.getMessages = exports.getOrCreateConversation = exports.getConversations = void 0;
const database_1 = __importDefault(require("../config/database"));
const apiResponse_1 = require("../utils/apiResponse");
// Get all conversations for current user
const getConversations = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const conversations = await database_1.default.conversation.findMany({
            where: {
                members: {
                    some: {
                        userId
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
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
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        // Format conversations with last message and other user info
        const formattedConversations = conversations.map((conv) => {
            const otherMembers = conv.members.filter((m) => m.userId !== userId);
            const lastMessage = conv.messages[0] || null;
            return {
                id: conv.id,
                type: conv.type,
                members: otherMembers.map((m) => m.user),
                lastMessage,
                updatedAt: conv.updatedAt,
                createdAt: conv.createdAt
            };
        });
        (0, apiResponse_1.successResponse)(res, formattedConversations, 200, 'Conversations retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({
            message: 'Error fetching conversations',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getConversations = getConversations;
// Get or create conversation with a user
const getOrCreateConversation = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { otherUserId } = req.body;
    if (!otherUserId) {
        return res.status(400).json({ message: 'Other user ID is required' });
    }
    if (otherUserId === userId) {
        return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }
    try {
        // Check if conversation already exists
        const existingConversation = await database_1.default.conversation.findFirst({
            where: {
                type: 'DIRECT',
                AND: [
                    { members: { some: { userId } } },
                    { members: { some: { userId: otherUserId } } }
                ]
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                isOnline: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true
                            }
                        },
                        MessageReadStatus: true
                    }
                }
            }
        });
        if (existingConversation) {
            return (0, apiResponse_1.successResponse)(res, existingConversation, 200, 'Conversation found');
        }
        // Create new conversation
        const newConversation = await database_1.default.conversation.create({
            data: {
                type: 'DIRECT',
                members: {
                    create: [
                        { userId },
                        { userId: otherUserId }
                    ]
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                isOnline: true
                            }
                        }
                    }
                },
                messages: true
            }
        });
        (0, apiResponse_1.successResponse)(res, newConversation, 201, 'Conversation created successfully');
    }
    catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({
            message: 'Error creating conversation',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getOrCreateConversation = getOrCreateConversation;
// Get messages for a conversation
const getMessages = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;
    try {
        // Verify user is member of conversation
        const member = await database_1.default.conversationMember.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId
                }
            }
        });
        if (!member) {
            return res.status(403).json({ message: 'Not a member of this conversation' });
        }
        // Get messages
        const messages = await database_1.default.message.findMany({
            where: {
                conversationId,
                ...(before && { createdAt: { lt: new Date(before) } })
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
                },
                MessageReadStatus: {
                    where: { userId }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: Number(limit)
        });
        (0, apiResponse_1.successResponse)(res, messages.reverse(), 200, 'Messages retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            message: 'Error fetching messages',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getMessages = getMessages;
// Send a message
const sendMessage = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { conversationId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Message content is required' });
    }
    try {
        // Verify user is member of conversation
        const member = await database_1.default.conversationMember.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId
                }
            }
        });
        if (!member) {
            return res.status(403).json({ message: 'Not a member of this conversation' });
        }
        // Create message
        const message = await database_1.default.message.create({
            data: {
                conversationId,
                senderId: userId,
                content: content.trim()
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
        // Update conversation updatedAt
        await database_1.default.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });
        (0, apiResponse_1.successResponse)(res, message, 201, 'Message sent successfully');
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            message: 'Error sending message',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.sendMessage = sendMessage;
// Mark messages as read
const markAsRead = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { conversationId } = req.params;
    try {
        // Verify user is member
        const member = await database_1.default.conversationMember.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId
                }
            }
        });
        if (!member) {
            return res.status(403).json({ message: 'Not a member of this conversation' });
        }
        // Update lastReadAt
        await database_1.default.conversationMember.update({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId
                }
            },
            data: {
                lastReadAt: new Date()
            }
        });
        // Get unread messages
        const unreadMessages = await database_1.default.message.findMany({
            where: {
                conversationId,
                senderId: { not: userId },
                createdAt: { gt: member.lastReadAt || new Date(0) }
            },
            select: { id: true }
        });
        // Create read status for unread messages
        if (unreadMessages.length > 0) {
            await database_1.default.messageReadStatus.createMany({
                data: unreadMessages.map((msg) => ({
                    id: `${msg.id}_${userId}`,
                    messageId: msg.id,
                    userId,
                    readAt: new Date()
                })),
                skipDuplicates: true
            });
        }
        (0, apiResponse_1.successResponse)(res, { count: unreadMessages.length }, 200, 'Messages marked as read');
    }
    catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            message: 'Error marking messages as read',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.markAsRead = markAsRead;
// Delete a message
const deleteMessage = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { messageId } = req.params;
    try {
        const message = await database_1.default.message.findUnique({
            where: { id: messageId }
        });
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        if (message.senderId !== userId) {
            return res.status(403).json({ message: 'Can only delete your own messages' });
        }
        await database_1.default.message.delete({
            where: { id: messageId }
        });
        (0, apiResponse_1.successResponse)(res, null, 200, 'Message deleted successfully');
    }
    catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            message: 'Error deleting message',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.deleteMessage = deleteMessage;
// Get unread message count
const getUnreadCount = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const conversations = await database_1.default.conversationMember.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        messages: {
                            where: {
                                senderId: { not: userId },
                                createdAt: { gt: database_1.default.conversationMember.fields.lastReadAt }
                            }
                        }
                    }
                }
            }
        });
        const totalUnread = conversations.reduce((sum, conv) => {
            const unreadInConv = conv.conversation.messages.filter((msg) => !conv.lastReadAt || msg.createdAt > conv.lastReadAt).length;
            return sum + unreadInConv;
        }, 0);
        (0, apiResponse_1.successResponse)(res, { count: totalUnread }, 200, 'Unread count retrieved');
    }
    catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            message: 'Error getting unread count',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getUnreadCount = getUnreadCount;
