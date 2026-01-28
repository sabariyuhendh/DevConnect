import { PrismaClient } from '@prisma/client';

export interface SendMessageInput {
  conversationId: string;
  senderId: string;
  content: string;
}

export interface CreateConversationInput {
  type: 'DIRECT';
  memberIds: string[];
}

export interface GetMessagesInput {
  conversationId: string;
  userId: string;
  page?: number;
  limit?: number;
}

export interface GetConversationsInput {
  userId: string;
  page?: number;
  limit?: number;
}

export class MessageService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Send a message in a conversation
   */
  async sendMessage(input: SendMessageInput) {
    const { conversationId, senderId, content } = input;

    // Validate that sender is a member of the conversation
    const membership = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: senderId
      }
    });

    if (!membership) {
      throw new Error('User is not a member of this conversation');
    }

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content
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

    // Update conversation's updatedAt timestamp
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return message;
  }

  /**
   * Get messages from a conversation with pagination
   */
  async getMessages(input: GetMessagesInput) {
    const { conversationId, userId, page = 1, limit = 50 } = input;

    // Validate that user is a member of the conversation
    const membership = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId
      }
    });

    if (!membership) {
      throw new Error('User is not a member of this conversation');
    }

    const skip = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
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
        readStatus: {
          where: { userId },
          select: { readAt: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await this.prisma.message.count({
      where: { conversationId }
    });

    return {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Create a new conversation
   */
  async createConversation(input: CreateConversationInput) {
    const { type, memberIds } = input;

    if (memberIds.length < 2) {
      throw new Error('Conversation must have at least 2 members');
    }

    // For direct conversations, check if one already exists
    if (type === 'DIRECT' && memberIds.length === 2) {
      const existingConversation = await this.prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          members: {
            every: {
              userId: { in: memberIds }
            }
          }
        },
        include: {
          members: true
        }
      });

      if (existingConversation && existingConversation.members.length === 2) {
        return existingConversation;
      }
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        type,
        members: {
          create: memberIds.map(userId => ({
            userId
          }))
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
                profilePicture: true
              }
            }
          }
        }
      }
    });

    return conversation;
  }

  /**
   * Get user's conversations with unread counts
   */
  async getConversations(input: GetConversationsInput) {
    const { userId, page = 1, limit = 20 } = input;
    const skip = (page - 1) * limit;

    const conversations = await this.prisma.conversation.findMany({
      where: {
        members: {
          some: { userId }
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
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit
    });

    // Calculate unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await this.getUnreadCount(conversation.id, userId);
        
        return {
          ...conversation,
          unreadCount,
          lastMessage: conversation.messages[0] || null
        };
      })
    );

    const total = await this.prisma.conversation.count({
      where: {
        members: {
          some: { userId }
        }
      }
    });

    return {
      conversations: conversationsWithUnread,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, userId: string, messageId?: string) {
    // Validate that user is a member of the conversation
    const membership = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId
      }
    });

    if (!membership) {
      throw new Error('User is not a member of this conversation');
    }

    if (messageId) {
      // Mark specific message as read
      await this.prisma.messageReadStatus.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId
          }
        },
        create: {
          messageId,
          userId
        },
        update: {
          readAt: new Date()
        }
      });
    } else {
      // Mark all messages in conversation as read
      const messages = await this.prisma.message.findMany({
        where: { conversationId },
        select: { id: true }
      });

      await Promise.all(
        messages.map(message =>
          this.prisma.messageReadStatus.upsert({
            where: {
              messageId_userId: {
                messageId: message.id,
                userId
              }
            },
            create: {
              messageId: message.id,
              userId
            },
            update: {
              readAt: new Date()
            }
          })
        )
      );

      // Update user's lastReadAt for this conversation
      await this.prisma.conversationMember.update({
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
    }
  }

  /**
   * Get unread message count for a conversation
   */
  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const totalMessages = await this.prisma.message.count({
      where: { conversationId }
    });

    const readMessages = await this.prisma.messageReadStatus.count({
      where: {
        userId,
        message: {
          conversationId
        }
      }
    });

    return totalMessages - readMessages;
  }

  /**
   * Check if user is a member of a conversation
   */
  async isUserInConversation(conversationId: string, userId: string): Promise<boolean> {
    const membership = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId
      }
    });

    return !!membership;
  }
  async searchMessages(userId: string, query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Get conversations user is a member of
    const userConversations = await this.prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true }
    });

    const conversationIds = userConversations.map(c => c.conversationId);

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId: { in: conversationIds },
        content: {
          contains: query,
          mode: 'insensitive'
        }
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
        conversation: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await this.prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        content: {
          contains: query,
          mode: 'insensitive'
        }
      }
    });

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}