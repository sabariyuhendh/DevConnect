import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount
} from '../controllers/messageController';
import { protect } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(protect);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/unread-count', getUnreadCount);

// Message routes
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.post('/conversations/:conversationId/read', markAsRead);
router.delete('/messages/:messageId', deleteMessage);

export default router;
