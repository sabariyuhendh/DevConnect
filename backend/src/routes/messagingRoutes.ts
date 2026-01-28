import { Router } from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  sendMessageSchema,
  getConversationsSchema,
  getMessagesSchema,
  searchMessagesSchema,
  createConversationSchema,
  conversationParamsSchema
} from '../validations/messagingValidation';
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  searchMessages,
  createConversation,
  getUnreadCounts
} from '../controllers/messagingController';

const router = Router();

// Apply authentication middleware to all routes
router.use(protect);

// Message routes
router.post('/messages', validate(sendMessageSchema), sendMessage);

// Conversation routes
router.get('/conversations', validate(getConversationsSchema, 'query'), getConversations);
router.post('/conversations', validate(createConversationSchema), createConversation);
router.get('/conversations/unread-counts', getUnreadCounts);
router.get('/conversations/:id/messages', 
  validate(conversationParamsSchema, 'params'),
  validate(getMessagesSchema, 'query'), 
  getMessages
);
router.put('/conversations/:id/read', 
  validate(conversationParamsSchema, 'params'),
  markAsRead
);

// Search routes
router.get('/search/messages', validate(searchMessagesSchema, 'query'), searchMessages);

export default router;