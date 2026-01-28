import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect as authenticate } from '../middleware/auth';
import { errorHandler } from '../middleware/errorHandler';

// Mock MessageService first
const mockMessageService = {
  sendMessage: jest.fn(),
  createConversation: jest.fn(),
  getConversations: jest.fn(),
  getMessages: jest.fn(),
  markAsRead: jest.fn(),
  getUnreadCount: jest.fn(),
  searchMessages: jest.fn()
};

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('../middleware/auth');
jest.mock('../config/database', () => ({
  default: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn()
    }
  }
}));

jest.mock('../services/messageService', () => ({
  MessageService: jest.fn().mockImplementation(() => mockMessageService)
}));

// Import routes after mocking
import messagingRoutes from '../routes/messaging';

describe('Messaging Routes', () => {
  let app: express.Application;
  const mockAuthenticate = authenticate as jest.MockedFunction<typeof authenticate>;

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com'
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware
    mockAuthenticate.mockImplementation((req: any, res: any, next: any) => {
      req.user = mockUser;
      next();
    });

    app.use('/api', messagingRoutes);
    app.use(errorHandler);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('POST /api/messages', () => {
    it('should send a message successfully', async () => {
      const mockMessage = {
        id: 'msg-123',
        conversationId: 'conv-123',
        senderId: mockUser.id,
        content: 'Hello, world!',
        createdAt: new Date(),
        sender: {
          id: mockUser.id,
          username: mockUser.username,
          firstName: 'Test',
          lastName: 'User'
        }
      };

      mockMessageService.sendMessage.mockResolvedValue(mockMessage);

      const response = await request(app)
        .post('/api/messages')
        .send({
          conversationId: 'conv-123',
          content: 'Hello, world!'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Message sent successfully');
      expect(response.body.data.id).toBe(mockMessage.id);
      expect(response.body.data.content).toBe(mockMessage.content);
      expect(response.body.data.conversationId).toBe(mockMessage.conversationId);
      expect(mockMessageService.sendMessage).toHaveBeenCalledWith({
        conversationId: 'conv-123',
        senderId: mockUser.id,
        content: 'Hello, world!'
      });
    });

    it('should handle send message errors', async () => {
      mockMessageService.sendMessage.mockRejectedValue(new Error('User is not a member of this conversation'));

      const response = await request(app)
        .post('/api/messages')
        .send({
          conversationId: 'conv-123',
          content: 'Hello, world!'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User is not a member of this conversation');
    });
  });

  describe('GET /api/conversations', () => {
    it('should get user conversations successfully', async () => {
      const mockConversations = {
        conversations: [
          {
            id: 'conv-123',
            type: 'DIRECT',
            members: [
              {
                user: {
                  id: 'user-456',
                  username: 'otheruser',
                  firstName: 'Other',
                  lastName: 'User'
                }
              }
            ],
            unreadCount: 2,
            lastMessage: {
              content: 'Latest message',
              createdAt: new Date()
            }
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      };

      mockMessageService.getConversations.mockResolvedValue(mockConversations);

      const response = await request(app)
        .get('/api/conversations')
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Conversations retrieved successfully');
      expect(response.body.data.conversations).toHaveLength(1);
      expect(response.body.data.conversations[0].id).toBe('conv-123');
      expect(mockMessageService.getConversations).toHaveBeenCalledWith({
        userId: mockUser.id,
        page: 1,
        limit: 20
      });
    });

    it('should handle get conversations errors', async () => {
      mockMessageService.getConversations.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/conversations');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Database connection failed');
    });
  });
});