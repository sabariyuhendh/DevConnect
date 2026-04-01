import { Request, Response } from 'express';
import prisma from '../config/database';
import { successResponse } from '../utils/apiResponse';
import { getParamAsString } from '../utils/helpers';

// Get all conversations for current user
export const getConversations = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    const conversations = await prisma.conversation.findMany({
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
    const formattedConversations = conversations.map((conv: any) => {
      const otherMembers = conv.members.filter((m: any) => m.userId !== userId);
      const lastMessage = conv.messages[0] || null;
      
      return {
        id: conv.id,
        type: conv.type,
        members: otherMembers.map((m: any) => m.user),
        lastMessage,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt
      };
    });

    successResponse(res, formattedConversations, 200, 'Conversations retrieved successfully');
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      message: 'Error fetching conversations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get or create conversation with a user
export const getOrCreateConversation = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { otherUserId } = req.body;

  if (!otherUserId) {
    return res.status(400).json({ message: 'Other user ID is required' });
  }

  if (otherUserId === userId) {
    return res.status(400).json({ message: 'Cannot create conversation with yourself' });
  }

  try {
    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
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
      return successResponse(res, existingConversation, 200, 'Conversation found');
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
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

    successResponse(res, newConversation, 201, 'Conversation created successfully');
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      message: 'Error creating conversation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get messages for a conversation
export const getMessages = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const conversationId = getParamAsString(req.params.conversationId);
  const { limit = 50, before } = req.query;

  try {
    // Verify user is member of conversation
    const member = await prisma.conversationMember.findUnique({
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
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(before && { createdAt: { lt: new Date(before as string) } })
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

    successResponse(res, messages.reverse(), 200, 'Messages retrieved successfully');
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      message: 'Error fetching messages',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const conversationId = getParamAsString(req.params.conversationId);
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  try {
    // Verify user is member of conversation
    const member = await prisma.conversationMember.findUnique({
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
    const message = await prisma.message.create({
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
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    successResponse(res, message, 201, 'Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      message: 'Error sending message',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Mark messages as read
export const markAsRead = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const conversationId = getParamAsString(req.params.conversationId);

  try {
    // Verify user is member
    const member = await prisma.conversationMember.findUnique({
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
    await prisma.conversationMember.update({
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
    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: userId },
        createdAt: { gt: member.lastReadAt || new Date(0) }
      },
      select: { id: true }
    });

    // Create read status for unread messages
    if (unreadMessages.length > 0) {
      await prisma.messageReadStatus.createMany({
        data: unreadMessages.map((msg: any) => ({
          id: `${msg.id}_${userId}`,
          messageId: msg.id,
          userId,
          readAt: new Date()
        })),
        skipDuplicates: true
      });
    }

    successResponse(res, { count: unreadMessages.length }, 200, 'Messages marked as read');
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      message: 'Error marking messages as read',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a message
export const deleteMessage = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const messageId = getParamAsString(req.params.messageId);

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ message: 'Can only delete your own messages' });
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    successResponse(res, null, 200, 'Message deleted successfully');
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      message: 'Error deleting message',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    const conversations = await prisma.conversationMember.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            messages: {
              where: {
                senderId: { not: userId }
              }
            }
          }
        }
      }
    });

    const totalUnread = conversations.reduce((sum: any, conv: any) => {
      const unreadInConv = conv.conversation.messages.filter((msg: any) =>
        !conv.lastReadAt || msg.createdAt > conv.lastReadAt
      ).length;
      return sum + unreadInConv;
    }, 0);

    successResponse(res, { count: totalUnread }, 200, 'Unread count retrieved');
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      message: 'Error getting unread count',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
