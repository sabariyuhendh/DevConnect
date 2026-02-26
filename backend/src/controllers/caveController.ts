import { Request, Response } from 'express';
import prisma from '../../prisma/client';
import { successResponse, errorResponse } from '../utils/apiResponse';

// Focus Sessions
export const startFocusSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { mode, duration } = req.body;

    const session = await prisma.caveFocusSession.create({
      data: {
        userId,
        mode: mode || 'POMODORO',
        duration: duration || 1500, // 25 minutes default
        completed: false,
      },
    });

    return successResponse(res, session, 'Focus session started');
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

export const completeFocusSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;

    const session = await prisma.caveFocusSession.update({
      where: { id: sessionId },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });

    // Update reputation
    await updateReputation(userId, 'focus_completed');

    return successResponse(res, session, 'Focus session completed');
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

export const getFocusSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = 10 } = req.query;

    const sessions = await prisma.caveFocusSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: Number(limit),
    });

    return successResponse(res, sessions);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

// Tasks
export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, priority, dueDate } = req.body;

    const task = await prisma.caveTask.create({
      data: {
        userId,
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return successResponse(res, task, 201, 'Task created');
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    const where: any = { userId };
    if (status) where.status = status;

    const tasks = await prisma.caveTask.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return successResponse(res, tasks);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, status, dueDate } = req.body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (priority !== undefined) data.priority = priority;
    if (status !== undefined) {
      data.status = status;
      if (status === 'COMPLETED') {
        data.completedAt = new Date();
        // Update reputation
        await updateReputation(req.user?.id, 'task_completed');
      }
    }
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.caveTask.update({
      where: { id: taskId },
      data,
    });

    return successResponse(res, task, 200, 'Task updated');
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    await prisma.caveTask.delete({
      where: { id: taskId },
    });

    return successResponse(res, null, 200, 'Task deleted');
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

// Notes
export const createNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, content } = req.body;

    const note = await prisma.caveNote.create({
      data: {
        userId,
        title,
        content,
      },
    });

    return successResponse(res, note, 201, 'Note created');
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

export const getNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const notes = await prisma.caveNote.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return successResponse(res, notes);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const { title, content } = req.body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;

    const note = await prisma.caveNote.update({
      where: { id: noteId },
      data,
    });

    return successResponse(res, note, 200, 'Note updated');
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;

    await prisma.caveNote.delete({
      where: { id: noteId },
    });

    return successResponse(res, null, 200, 'Note deleted');
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

// Chat Rooms
export const getChatRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.caveChatRoom.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { members: true, messages: true },
        },
      },
    });

    return successResponse(res, rooms);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

export const createChatRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, description } = req.body;

    // Ensure name starts with #
    const roomName = name.startsWith('#') ? name : `#${name}`;

    const room = await prisma.caveChatRoom.create({
      data: {
        name: roomName,
        description,
        createdById: userId,
      },
    });

    // Auto-join creator
    await prisma.caveRoomMember.create({
      data: {
        roomId: room.id,
        userId,
      },
    });

    return successResponse(res, room, 201, 'Room created');
  } catch (error: any) {
    if (error.code === 'P2002') {
      return errorResponse(res, 'Room name already exists', 400);
    }
    return errorResponse(res, error.message, 500);
  }
};

export const joinChatRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { roomId } = req.params;

    const member = await prisma.caveRoomMember.create({
      data: {
        roomId,
        userId,
      },
    });

    return successResponse(res, member, 200, 'Joined room');
  } catch (error: any) {
    if (error.code === 'P2002') {
      return errorResponse(res, 'Already a member', 400);
    }
    return errorResponse(res, error.message, 500);
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    const where: any = { roomId };
    if (before) {
      where.createdAt = { lt: new Date(before as string) };
    }

    const messages = await prisma.caveChatMessage.findMany({
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

    return successResponse(res, messages.reverse());
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

// Trends
export const getTrendArticles = async (req: Request, res: Response) => {
  try {
    const { tag, sort = 'trending', limit = 20 } = req.query;
    const userId = req.user?.id;

    const where: any = {};
    if (tag) {
      where.tags = { has: tag as string };
    }

    let orderBy: any = {};
    if (sort === 'trending') {
      orderBy = { bookmarkCount: 'desc' };
    } else if (sort === 'latest') {
      orderBy = { publishedAt: 'desc' };
    }

    const articles = await prisma.caveTrendArticle.findMany({
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

    return successResponse(res, articlesWithBookmark);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

export const toggleBookmark = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { articleId } = req.params;

    const existing = await prisma.caveArticleBookmark.findUnique({
      where: {
        userId_articleId: { userId, articleId },
      },
    });

    if (existing) {
      await prisma.caveArticleBookmark.delete({
        where: { id: existing.id },
      });
      await prisma.caveTrendArticle.update({
        where: { id: articleId },
        data: { bookmarkCount: { decrement: 1 } },
      });
      return successResponse(res, { bookmarked: false }, 200, 'Bookmark removed');
    } else {
      await prisma.caveArticleBookmark.create({
        data: { userId, articleId },
      });
      await prisma.caveTrendArticle.update({
        where: { id: articleId },
        data: { bookmarkCount: { increment: 1 } },
      });
      return successResponse(res, { bookmarked: true }, 200, 'Article bookmarked');
    }
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

export const incrementReadCount = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;

    await prisma.caveTrendArticle.update({
      where: { id: articleId },
      data: { readCount: { increment: 1 } },
    });

    return successResponse(res, null, 200, 'Read count updated');
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

// Reputation
export const getReputation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    let reputation = await prisma.caveReputation.findUnique({
      where: { userId },
    });

    if (!reputation) {
      reputation = await prisma.caveReputation.create({
        data: { userId },
      });
    }

    return successResponse(res, reputation);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

// Helper function to update reputation
async function updateReputation(userId: string, action: string) {
  let reputation = await prisma.caveReputation.findUnique({
    where: { userId },
  });

  if (!reputation) {
    reputation = await prisma.caveReputation.create({
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
      const lastFocus = reputation.lastFocusDate?.toDateString();
      if (lastFocus === today) {
        // Already focused today
      } else {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (lastFocus === yesterday) {
          // Streak continues
          await prisma.caveReputation.update({
            where: { userId },
            data: {
              focusStreak: { increment: 1 },
              lastFocusDate: new Date(),
            },
          });
        } else {
          // Streak broken
          await prisma.caveReputation.update({
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
  if (newPoints >= 2001) newLevel = 'System Master';
  else if (newPoints >= 1001) newLevel = 'Architect';
  else if (newPoints >= 501) newLevel = 'Builder';
  else newLevel = 'Explorer';

  // Badge logic
  if (newPoints >= 100 && !badges.includes('Early Adopter')) {
    badges.push('Early Adopter');
  }
  if (reputation.focusStreak >= 7 && !badges.includes('Focused')) {
    badges.push('Focused');
  }

  await prisma.caveReputation.update({
    where: { userId },
    data: {
      points: newPoints,
      level: newLevel,
      badges,
    },
  });
}

// Export all controller functions
export {
  startFocusSession,
  completeFocusSession,
  getFocusSessions,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  getChatRooms,
  createChatRoom,
  joinChatRoom,
  getChatMessages,
  getTrendArticles,
  toggleBookmark,
  incrementReadCount,
  getReputation,
};
