"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReputation = exports.incrementReadCount = exports.toggleBookmark = exports.getTrendArticles = exports.getChatMessages = exports.joinChatRoom = exports.createChatRoom = exports.getChatRooms = exports.deleteNote = exports.updateNote = exports.getNotes = exports.createNote = exports.deleteTask = exports.updateTask = exports.getTasks = exports.createTask = exports.getFocusSessions = exports.completeFocusSession = exports.startFocusSession = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const apiResponse_1 = require("../utils/apiResponse");
// Focus Sessions
const startFocusSession = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { mode, duration } = req.body;
        const session = await client_1.default.caveFocusSession.create({
            data: {
                userId,
                mode: mode || 'POMODORO',
                duration: duration || 1500, // 25 minutes default
                completed: false,
            },
        });
        return (0, apiResponse_1.successResponse)(res, session, 'Focus session started');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.startFocusSession = startFocusSession;
const completeFocusSession = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { sessionId } = req.params;
        const session = await client_1.default.caveFocusSession.update({
            where: { id: sessionId },
            data: {
                completed: true,
                completedAt: new Date(),
            },
        });
        // Update reputation
        await updateReputation(userId, 'focus_completed');
        return (0, apiResponse_1.successResponse)(res, session, 'Focus session completed');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.completeFocusSession = completeFocusSession;
const getFocusSessions = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { limit = 10 } = req.query;
        const sessions = await client_1.default.caveFocusSession.findMany({
            where: { userId },
            orderBy: { startedAt: 'desc' },
            take: Number(limit),
        });
        return (0, apiResponse_1.successResponse)(res, sessions);
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.getFocusSessions = getFocusSessions;
// Tasks
const createTask = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { title, description, priority, dueDate } = req.body;
        const task = await client_1.default.caveTask.create({
            data: {
                userId,
                title,
                description,
                priority: priority || 'MEDIUM',
                dueDate: dueDate ? new Date(dueDate) : null,
            },
        });
        return (0, apiResponse_1.successResponse)(res, task, 'Task created', 201);
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.createTask = createTask;
const getTasks = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { status } = req.query;
        const where = { userId };
        if (status)
            where.status = status;
        const tasks = await client_1.default.caveTask.findMany({
            where,
            orderBy: [
                { status: 'asc' },
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
        });
        return (0, apiResponse_1.successResponse)(res, tasks);
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.getTasks = getTasks;
const updateTask = async (req, res) => {
    var _a;
    try {
        const { taskId } = req.params;
        const { title, description, priority, status, dueDate } = req.body;
        const data = {};
        if (title !== undefined)
            data.title = title;
        if (description !== undefined)
            data.description = description;
        if (priority !== undefined)
            data.priority = priority;
        if (status !== undefined) {
            data.status = status;
            if (status === 'COMPLETED') {
                data.completedAt = new Date();
                // Update reputation
                await updateReputation((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, 'task_completed');
            }
        }
        if (dueDate !== undefined)
            data.dueDate = dueDate ? new Date(dueDate) : null;
        const task = await client_1.default.caveTask.update({
            where: { id: taskId },
            data,
        });
        return (0, apiResponse_1.successResponse)(res, task, 'Task updated');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        await client_1.default.caveTask.delete({
            where: { id: taskId },
        });
        return (0, apiResponse_1.successResponse)(res, null, 'Task deleted');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.deleteTask = deleteTask;
// Notes
const createNote = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { title, content } = req.body;
        const note = await client_1.default.caveNote.create({
            data: {
                userId,
                title,
                content,
            },
        });
        return (0, apiResponse_1.successResponse)(res, note, 'Note created', 201);
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.createNote = createNote;
const getNotes = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const notes = await client_1.default.caveNote.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
        return (0, apiResponse_1.successResponse)(res, notes);
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.getNotes = getNotes;
const updateNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { title, content } = req.body;
        const data = {};
        if (title !== undefined)
            data.title = title;
        if (content !== undefined)
            data.content = content;
        const note = await client_1.default.caveNote.update({
            where: { id: noteId },
            data,
        });
        return (0, apiResponse_1.successResponse)(res, note, 'Note updated');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.updateNote = updateNote;
const deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        await client_1.default.caveNote.delete({
            where: { id: noteId },
        });
        return (0, apiResponse_1.successResponse)(res, null, 'Note deleted');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.deleteNote = deleteNote;
// Chat Rooms
const getChatRooms = async (req, res) => {
    try {
        const rooms = await client_1.default.caveChatRoom.findMany({
            orderBy: { createdAt: 'asc' },
            include: {
                _count: {
                    select: { members: true, messages: true },
                },
            },
        });
        return (0, apiResponse_1.successResponse)(res, rooms);
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.getChatRooms = getChatRooms;
const createChatRoom = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { name, description } = req.body;
        // Ensure name starts with #
        const roomName = name.startsWith('#') ? name : `#${name}`;
        const room = await client_1.default.caveChatRoom.create({
            data: {
                name: roomName,
                description,
                createdById: userId,
            },
        });
        // Auto-join creator
        await client_1.default.caveRoomMember.create({
            data: {
                roomId: room.id,
                userId,
            },
        });
        return (0, apiResponse_1.successResponse)(res, room, 'Room created', 201);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return (0, apiResponse_1.errorResponse)(res, 'Room name already exists', 400);
        }
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.createChatRoom = createChatRoom;
const joinChatRoom = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { roomId } = req.params;
        const member = await client_1.default.caveRoomMember.create({
            data: {
                roomId,
                userId,
            },
        });
        return (0, apiResponse_1.successResponse)(res, member, 'Joined room');
    }
    catch (error) {
        if (error.code === 'P2002') {
            return (0, apiResponse_1.errorResponse)(res, 'Already a member', 400);
        }
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.joinChatRoom = joinChatRoom;
const getChatMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { limit = 50, before } = req.query;
        const where = { roomId };
        if (before) {
            where.createdAt = { lt: new Date(before) };
        }
        const messages = await client_1.default.caveChatMessage.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
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
        return (0, apiResponse_1.successResponse)(res, messages.reverse());
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.getChatMessages = getChatMessages;
// Trends
const getTrendArticles = async (req, res) => {
    var _a;
    try {
        const { tag, sort = 'trending', limit = 20 } = req.query;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const where = {};
        if (tag) {
            where.tags = { has: tag };
        }
        let orderBy = {};
        if (sort === 'trending') {
            orderBy = { bookmarkCount: 'desc' };
        }
        else if (sort === 'latest') {
            orderBy = { publishedAt: 'desc' };
        }
        const articles = await client_1.default.caveTrendArticle.findMany({
            where,
            orderBy,
            take: Number(limit),
            include: {
                bookmarks: {
                    where: { userId },
                    select: { id: true },
                },
            },
        });
        const articlesWithBookmark = articles.map(article => ({
            ...article,
            isBookmarked: article.bookmarks.length > 0,
            bookmarks: undefined,
        }));
        return (0, apiResponse_1.successResponse)(res, articlesWithBookmark);
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.getTrendArticles = getTrendArticles;
const toggleBookmark = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { articleId } = req.params;
        const existing = await client_1.default.caveArticleBookmark.findUnique({
            where: {
                userId_articleId: { userId, articleId },
            },
        });
        if (existing) {
            await client_1.default.caveArticleBookmark.delete({
                where: { id: existing.id },
            });
            await client_1.default.caveTrendArticle.update({
                where: { id: articleId },
                data: { bookmarkCount: { decrement: 1 } },
            });
            return (0, apiResponse_1.successResponse)(res, { bookmarked: false }, 'Bookmark removed');
        }
        else {
            await client_1.default.caveArticleBookmark.create({
                data: { userId, articleId },
            });
            await client_1.default.caveTrendArticle.update({
                where: { id: articleId },
                data: { bookmarkCount: { increment: 1 } },
            });
            return (0, apiResponse_1.successResponse)(res, { bookmarked: true }, 'Article bookmarked');
        }
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.toggleBookmark = toggleBookmark;
const incrementReadCount = async (req, res) => {
    try {
        const { articleId } = req.params;
        await client_1.default.caveTrendArticle.update({
            where: { id: articleId },
            data: { readCount: { increment: 1 } },
        });
        return (0, apiResponse_1.successResponse)(res, null, 'Read count updated');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.incrementReadCount = incrementReadCount;
// Reputation
const getReputation = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        let reputation = await client_1.default.caveReputation.findUnique({
            where: { userId },
        });
        if (!reputation) {
            reputation = await client_1.default.caveReputation.create({
                data: { userId },
            });
        }
        return (0, apiResponse_1.successResponse)(res, reputation);
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, error.message, 500);
    }
};
exports.getReputation = getReputation;
// Helper function to update reputation
async function updateReputation(userId, action) {
    var _a;
    let reputation = await client_1.default.caveReputation.findUnique({
        where: { userId },
    });
    if (!reputation) {
        reputation = await client_1.default.caveReputation.create({
            data: { userId },
        });
    }
    let pointsToAdd = 0;
    const badges = [...reputation.badges];
    switch (action) {
        case 'focus_completed':
            pointsToAdd = 10;
            // Update focus streak
            const today = new Date().toDateString();
            const lastFocus = (_a = reputation.lastFocusDate) === null || _a === void 0 ? void 0 : _a.toDateString();
            if (lastFocus === today) {
                // Already focused today
            }
            else {
                const yesterday = new Date(Date.now() - 86400000).toDateString();
                if (lastFocus === yesterday) {
                    // Streak continues
                    await client_1.default.caveReputation.update({
                        where: { userId },
                        data: {
                            focusStreak: { increment: 1 },
                            lastFocusDate: new Date(),
                        },
                    });
                }
                else {
                    // Streak broken
                    await client_1.default.caveReputation.update({
                        where: { userId },
                        data: {
                            focusStreak: 1,
                            lastFocusDate: new Date(),
                        },
                    });
                }
            }
            break;
        case 'task_completed':
            pointsToAdd = 5;
            break;
        case 'chat_message':
            pointsToAdd = 1;
            break;
        case 'article_bookmark':
            pointsToAdd = 2;
            break;
    }
    const newPoints = reputation.points + pointsToAdd;
    let newLevel = reputation.level;
    // Level up logic
    if (newPoints >= 2001)
        newLevel = 'System Master';
    else if (newPoints >= 1001)
        newLevel = 'Architect';
    else if (newPoints >= 501)
        newLevel = 'Builder';
    else
        newLevel = 'Explorer';
    // Badge logic
    if (newPoints >= 100 && !badges.includes('Early Adopter')) {
        badges.push('Early Adopter');
    }
    if (reputation.focusStreak >= 7 && !badges.includes('Focused')) {
        badges.push('Focused');
    }
    await client_1.default.caveReputation.update({
        where: { userId },
        data: {
            points: newPoints,
            level: newLevel,
            badges,
        },
    });
}
