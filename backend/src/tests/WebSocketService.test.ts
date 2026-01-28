import { Server as HTTPServer } from 'http';
import { PrismaClient } from '@prisma/client';
import { WebSocketService } from '../services/WebSocketService';
import * as jwt from '../utils/jwt';

// Mock dependencies
jest.mock('../utils/jwt');
jest.mock('../config/env', () => ({
  CORS_ORIGIN: 'http://localhost:3000'
}));

const mockJwt = jwt as jest.Mocked<typeof jwt>;

// Create a proper Prisma mock
const createMockPrisma = () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  conversationMember: {
    findFirst: jest.fn()
  },
  conversation: {
    findMany: jest.fn()
  },
  $connect: jest.fn(),
  $disconnect: jest.fn()
});

describe('WebSocketService', () => {
  let httpServer: HTTPServer;
  let webSocketService: WebSocketService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    isActive: true
  };

  beforeEach(() => {
    // Create HTTP server
    httpServer = new HTTPServer();
    
    // Mock Prisma
    mockPrisma = createMockPrisma();

    // Mock JWT verification
    mockJwt.verifyToken.mockReturnValue({ id: mockUser.id } as any);

    // Mock Prisma user lookup
    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
    mockPrisma.user.update.mockResolvedValue(mockUser as any);

    // Create WebSocket service
    webSocketService = new WebSocketService(httpServer, mockPrisma as any);
  });

  afterEach(() => {
    if (httpServer) {
      httpServer.close();
    }
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should initialize WebSocket service with proper configuration', () => {
      expect(webSocketService).toBeDefined();
      expect(webSocketService.getIO()).toBeDefined();
      expect(webSocketService.getOnlineUsers()).toEqual([]);
    });

    it('should provide connection statistics', () => {
      const stats = webSocketService.getStats();
      expect(stats).toEqual({
        totalConnections: 0,
        uniqueUsers: 0,
        averageSocketsPerUser: 0
      });
    });
  });

  describe('User Presence Management', () => {
    it('should return null for offline user presence', () => {
      const presence = webSocketService.getUserPresence('non-existent-user');
      expect(presence).toBeNull();
    });

    it('should return empty array for online users when no connections', () => {
      const onlineUsers = webSocketService.getOnlineUsers();
      expect(onlineUsers).toEqual([]);
    });

    it('should handle user disconnection gracefully', async () => {
      await expect(webSocketService.disconnectUser('user-123')).resolves.not.toThrow();
    });
  });
});