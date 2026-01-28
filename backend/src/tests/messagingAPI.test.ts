import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { globalErrorHandler } from '../utils/errors';
import * as fc from 'fast-check';

// Mock Prisma before importing routes
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  conversationMember: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  message: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  conversation: {
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  messageReadStatus: {
    upsert: jest.fn(),
    count: jest.fn(),
  },
} as unknown as PrismaClient;

// Mock the database import
jest.mock('../config/database', () => mockPrisma);

// Mock MessageService
const mockMessageService = {
  sendMessage: jest.fn(),
  getConversations: jest.fn(),
  searchMessages: jest.fn(),
  isUserMemberOfConversation: jest.fn(),
};

jest.mock('../services/messageService', () => ({
  MessageService: jest.fn().mockImplementation(() => mockMessageService),
}));

// Mock JWT verification
jest.mock('../utils/jwt', () => ({
  verifyToken: jest.fn(() => ({ id: 'user1' })),
}));

// Import routes after mocking
import messagingRoutes from '../routes/messaging';

const app = express();
app.use(express.json());
app.use('/api', messagingRoutes);
app.use(globalErrorHandler);

describe('Messaging API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated user
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user1',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
    });
  });

  describe('POST /api/messages - Send Message', () => {
    it('should successfully send a message when user is conversation member', async () => {
      // Mock message service response
      mockMessageService.sendMessage.mockResolvedValue({
        id: 'msg1',
        conversationId: 'conv1',
        senderId: 'user1',
        content: 'Hello world',
        createdAt: new Date(),
        sender: {
          id: 'user1',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          profilePicture: null,
        },
      });

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', 'Bearer valid-token')
        .send({
          conversationId: 'conv1',
          content: 'Hello world',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.content).toBe('Hello world');
      expect(mockMessageService.sendMessage).toHaveBeenCalledWith({
        conversationId: 'conv1',
        senderId: 'user1',
        content: 'Hello world',
      });
    });

    it('should return 400 when user is not a conversation member', async () => {
      // Mock service to throw error
      mockMessageService.sendMessage.mockRejectedValue(new Error('User is not a member of this conversation'));

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', 'Bearer valid-token')
        .send({
          conversationId: 'conv1',
          content: 'Hello world',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User is not a member of this conversation');
    });
  });

  describe('GET /api/conversations - Get User Conversations', () => {
    it('should successfully retrieve user conversations with unread counts', async () => {
      const mockResult = {
        conversations: [
          {
            id: 'conv1',
            type: 'DIRECT',
            createdAt: new Date(),
            updatedAt: new Date(),
            unreadCount: 2,
            members: [
              {
                user: {
                  id: 'user2',
                  username: 'user2',
                  firstName: 'User',
                  lastName: 'Two',
                  profilePicture: null,
                  isOnline: true,
                  lastSeen: new Date(),
                },
              },
            ],
            lastMessage: {
              id: 'msg1',
              content: 'Latest message',
              createdAt: new Date(),
              sender: {
                id: 'user2',
                username: 'user2',
                firstName: 'User',
                lastName: 'Two',
              },
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockMessageService.getConversations.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/conversations')
        .set('Authorization', 'Bearer valid-token')
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.conversations).toHaveLength(1);
      expect(response.body.data.conversations[0].unreadCount).toBe(2);
      expect(response.body.data.pagination.total).toBe(1);
      expect(response.body.data.pagination.page).toBe(1);
    });

    it('should handle empty conversations list', async () => {
      const mockResult = {
        conversations: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      mockMessageService.getConversations.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/conversations')
        .set('Authorization', 'Bearer valid-token')
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.conversations).toHaveLength(0);
      expect(response.body.data.pagination.total).toBe(0);
    });
  });

  describe('GET /api/search/messages - Search Messages', () => {
    it('should successfully search messages with valid query', async () => {
      const mockResult = {
        messages: [
          {
            id: 'msg1',
            content: 'Hello world test message',
            createdAt: new Date(),
            sender: {
              id: 'user2',
              username: 'user2',
              firstName: 'User',
              lastName: 'Two',
              profilePicture: null,
            },
            conversation: {
              id: 'conv1',
              members: [
                {
                  user: {
                    id: 'user1',
                    username: 'testuser',
                    firstName: 'Test',
                    lastName: 'User',
                  },
                },
              ],
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockMessageService.searchMessages.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/search/messages')
        .set('Authorization', 'Bearer valid-token')
        .query({ q: 'test', page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.messages).toHaveLength(1);
      expect(response.body.data.messages[0].content).toContain('test');
      expect(response.body.data.pagination.total).toBe(1);
    });

    it('should return 400 when search query is empty', async () => {
      const response = await request(app)
        .get('/api/search/messages')
        .set('Authorization', 'Bearer valid-token')
        .query({ q: '', page: 1, limit: 20 });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Search query is required');
    });
  });

  describe('Feature: messaging-and-user-management', () => {
    it('Property 7: Search Functionality Consistency', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          query: fc.string({ minLength: 1, maxLength: 100 }),
          page: fc.integer({ min: 1, max: 10 }),
          limit: fc.integer({ min: 1, max: 50 })
        }),
        async (searchParams) => {
          // Mock search results that match the query
          const mockResult = {
            messages: [
              {
                id: 'msg1',
                content: `Message containing ${searchParams.query}`,
                createdAt: new Date(),
                sender: {
                  id: 'user2',
                  username: 'user2',
                  firstName: 'User',
                  lastName: 'Two',
                  profilePicture: null,
                },
                conversation: {
                  id: 'conv1',
                  members: [
                    {
                      user: {
                        id: 'user1',
                        username: 'testuser',
                        firstName: 'Test',
                        lastName: 'User',
                      },
                    },
                  ],
                },
              },
            ],
            pagination: {
              page: searchParams.page,
              limit: searchParams.limit,
              total: 1,
              totalPages: 1,
            },
          };

          mockMessageService.searchMessages.mockResolvedValue(mockResult);

          const response = await request(app)
            .get('/api/search/messages')
            .set('Authorization', 'Bearer valid-token')
            .query({
              q: searchParams.query,
              page: searchParams.page,
              limit: searchParams.limit
            });

          // Property: Search should always return valid response structure
          expect(response.status).toBe(200);
          expect(response.body.status).toBe('success');
          expect(response.body.data).toHaveProperty('messages');
          expect(response.body.data).toHaveProperty('pagination');
          expect(Array.isArray(response.body.data.messages)).toBe(true);
          
          // Property: Pagination should be consistent
          expect(response.body.data.pagination.page).toBe(searchParams.page);
          expect(response.body.data.pagination.limit).toBe(searchParams.limit);
          expect(typeof response.body.data.pagination.total).toBe('number');
          expect(typeof response.body.data.pagination.totalPages).toBe('number');
          
          // Property: All returned messages should contain the search query (case insensitive)
          response.body.data.messages.forEach((message: any) => {
            expect(message.content.toLowerCase()).toContain(searchParams.query.toLowerCase());
          });
        }
      ), { numRuns: 2 });
    });
  });
});