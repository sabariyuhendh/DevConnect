"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.protect);
// Conversation routes
router.get('/conversations', messageController_1.getConversations);
router.post('/conversations', messageController_1.getOrCreateConversation);
router.get('/conversations/unread-count', messageController_1.getUnreadCount);
// Message routes
router.get('/conversations/:conversationId/messages', messageController_1.getMessages);
router.post('/conversations/:conversationId/messages', messageController_1.sendMessage);
router.post('/conversations/:conversationId/read', messageController_1.markAsRead);
router.delete('/messages/:messageId', messageController_1.deleteMessage);
exports.default = router;
