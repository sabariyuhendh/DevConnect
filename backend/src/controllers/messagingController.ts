import { Request, Response } from 'express';
import { MessageService } from '../services/messageService';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  forbiddenResponse,
  asyncHandler 
} from '../utils/apiResponse';
import prisma from '../config/database';

const messageService = new MessageService(prisma);

/**
 * Send a message
 * POST /api/messages
 */
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId, content } = req.body;
  const userId = (req as any).user.id;

  try {
    // Check if user is a member of the conversation
    const isMember = await messageService.isUserInConversation(conversationId, userId);
    if (!isMember) {
      return forbiddenResponse(res, 'You are not a member of this conversation');
    }

    const message = await messageService.sendMessage({
      conversationId,
      senderId: userId,
      content
    });

    return successResponse(res, message, 201, 'Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    return errorResponse(res, 'Failed to send message', 500);
  }
});

/**
 * Get user conversations
 * GET /api/conversations
 */
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { page, limit } = req.query;

  try {
    const result = await messageService.getConversations({
      userId,
      page: Number(page),
      limit: Number(limit)
    });

    return successResponse(
      res, 
      result.conversations, 
      200, 
      'Conversations retrieved successfully',
      result.pagination
    );
  } catch (error) {
    console.error('Error getting conversations:', error);
    return errorResponse(res, 'Failed to retrieve conversations', 500);
  }
});

/**
 * Get message history for a conversation
 * GET /api/conversations/:id/messages
 */
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { id: conversationId } = req.params;
  const userId = (req as any).user.id;
  const { page, limit } = req.query;

  try {
    // Check if user is a member of the conversation
    const isMember = await messageService.isUserInConversation(conversationId, userId);
    if (!isMember) {
      return forbiddenResponse(res, 'You are not a member of this conversation');
    }

    const result = await messageService.getMessages({
      conversationId,
      userId,
      page: Number(page),
      limit: Number(limit)
    });

    return successResponse(
      res, 
      result.messages, 
      200, 
      'Messages retrieved successfully',
      result.pagination
    );
  } catch (error) {
    console.error('Error getting messages:', error);
    return errorResponse(res, 'Failed to retrieve messages', 500);
  }
});

/**
 * Mark conversation as read
 * PUT /api/conversations/:id/read
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id: conversationId } = req.params;
  const userId = (req as any).user.id;

  try {
    // Check if user is a member of the conversation
    const isMember = await messageService.isUserInConversation(conversationId, userId);
    if (!isMember) {
      return forbiddenResponse(res, 'You are not a member of this conversation');
    }

    await messageService.markAsRead(conversationId, userId);

    return successResponse(res, null, 200, 'Conversation marked as read');
  } catch (error) {
    console.error('Error marking as read:', error);
    return errorResponse(res, 'Failed to mark conversation as read', 500);
  }
});

/**
 * Search messages
 * GET /api/search/messages
 */
export const searchMessages = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { query, page, limit } = req.query;

  try {
    const result = await messageService.searchMessages(
      userId, 
      query as string, 
      Number(page), 
      Number(limit)
    );

    return successResponse(
      res, 
      result.messages, 
      200, 
      'Messages searched successfully',
      result.pagination
    );
  } catch (error) {
    console.error('Error searching messages:', error);
    return errorResponse(res, 'Failed to search messages', 500);
  }
});

/**
 * Create a new conversation
 * POST /api/conversations
 */
export const createConversation = asyncHandler(async (req: Request, res: Response) => {
  const { participants, type } = req.body;
  const userId = (req as any).user.id;

  try {
    // Add the current user to the participants list
    const allParticipants = [userId, ...participants];

    const conversation = await messageService.createConversation({
      type,
      memberIds: allParticipants
    });

    return successResponse(res, conversation, 201, 'Conversation created successfully');
  } catch (error) {
    console.error('Error creating conversation:', error);
    return errorResponse(res, 'Failed to create conversation', 500);
  }
});

/**
 * Get unread counts for all conversations
 * GET /api/conversations/unread-counts
 */
export const getUnreadCounts = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    // Get all user conversations
    const result = await messageService.getConversations({ userId });
    
    // Extract unread counts
    const unreadCounts = result.conversations.reduce((acc, conv) => {
      acc[conv.id] = conv.unreadCount;
      return acc;
    }, {} as Record<string, number>);

    const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

    return successResponse(res, {
      total: totalUnread,
      conversations: unreadCounts
    }, 200, 'Unread counts retrieved successfully');
  } catch (error) {
    console.error('Error getting unread counts:', error);
    return errorResponse(res, 'Failed to retrieve unread counts', 500);
  }
});