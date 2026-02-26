import express from 'express';
import { protect } from '../middleware/auth';
import * as caveController from '../controllers/caveController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Focus Sessions
router.post('/focus/start', caveController.startFocusSession);
router.put('/focus/:sessionId/complete', caveController.completeFocusSession);
router.get('/focus/sessions', caveController.getFocusSessions);

// Tasks
router.post('/tasks', caveController.createTask);
router.get('/tasks', caveController.getTasks);
router.put('/tasks/:taskId', caveController.updateTask);
router.delete('/tasks/:taskId', caveController.deleteTask);

// Notes
router.post('/notes', caveController.createNote);
router.get('/notes', caveController.getNotes);
router.put('/notes/:noteId', caveController.updateNote);
router.delete('/notes/:noteId', caveController.deleteNote);

// Chat Rooms
router.get('/chat/rooms', caveController.getChatRooms);
router.post('/chat/rooms', caveController.createChatRoom);
router.post('/chat/rooms/:roomId/join', caveController.joinChatRoom);
router.get('/chat/rooms/:roomId/messages', caveController.getChatMessages);

// Trends
router.get('/trends/articles', caveController.getTrendArticles);
router.post('/trends/articles/:articleId/bookmark', caveController.toggleBookmark);
router.post('/trends/articles/:articleId/read', caveController.incrementReadCount);

// Reputation
router.get('/reputation', caveController.getReputation);

export default router;
