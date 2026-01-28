import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { MessageService } from '../services/messageService';
import { protect as authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { 
  sendMessageSchema, 
  createConversationSchema, 
  getMessagesSchema, 
  markAsReadSchema,
  searchMessagesSchema 
} from '../validations/messagingValidation';

const router = Router();
const prisma = new PrismaClient();
const messageService = new MessageService(prisma);

/**
 * POST /api/messages - Send a message
 */
router.post('/messages', authenticate, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user!.id;

    const message = await messageService.sendMessage({
      conversationId,
      senderId,
      content
    });

    return successResponse(res, message, 201, 'Message sent successfully');
  } catch (error) {
    console.error('Send message error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to send message', 400);
  }
});

/**
 * POST /api/conversations - Create a new conversation
 */
router.post('/conversations', authenticate, async (req, res) => {
  try {
    const { type, memberIds } = req.body;
    const userId = req.user!.id;

    // Ensure current user is included in the conversation
    const allMemberIds = Array.from(new Set([userId, ...memberIds]));

    const conversation = await messageService.createConversation({
      type,
      memberIds: allMemberIds
    });

    return successResponse(res, conversation, 201, 'Conversation created successfully');
  } catch (error) {
    console.error('Create conversation error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to create conversation', 400);
  }
});

/**
 * GET /api/conversations - Get user's conversations
 */
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await messageService.getConversations({
      userId,
      page,
      limit
    });

    return successResponse(res, result, 200, 'Conversations retrieved successfully');
  } catch (error) {
    console.error('Get conversations error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to get conversations', 500);
  }
});

/**
 * GET /api/conversations/:id/messages - Get message history for a conversation
 */
router.get('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await messageService.getMessages({
      conversationId,
      userId,
      page,
      limit
    });

    return successResponse(res, result, 200, 'Messages retrieved successfully');
  } catch (error) {
    console.error('Get messages error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to get messages', 400);
  }
});

/**
 * PUT /api/conversations/:id/read - Mark messages as read
 */
router.put('/conversations/:id/read', authenticate, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user!.id;
    const { messageId } = req.body;

    await messageService.markAsRead(conversationId, userId, messageId);

    return successResponse(res, null, 200, 'Messages marked as read successfully');
  } catch (error) {
    console.error('Mark as read error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to mark messages as read', 400);
  }
});

/**
 * GET /api/conversations/:id/unread-count - Get unread message count
 */
router.get('/conversations/:id/unread-count', authenticate, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user!.id;

    const unreadCount = await messageService.getUnreadCount(conversationId, userId);

    return successResponse(res, { unreadCount }, 200, 'Unread count retrieved successfully');
  } catch (error) {
    console.error('Get unread count error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to get unread count', 400);
  }
});

/**
 * GET /api/search/messages - Search messages across conversations
 */
router.get('/search/messages', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query || query.trim().length === 0) {
      return errorResponse(res, 'Search query is required', 400);
    }

    const result = await messageService.searchMessages(userId, query, page, limit);

    return successResponse(res, result, 200, 'Messages searched successfully');
  } catch (error) {
    console.error('Search messages error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Failed to search messages', 500);
  }
});

export default router;