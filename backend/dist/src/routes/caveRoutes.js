"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const caveController = __importStar(require("../controllers/caveController"));
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.protect);
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
exports.default = router;
