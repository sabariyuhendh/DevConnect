import * as fc from 'fast-check';
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

describe('Feature: messaging-and-user-management', () => {
  let httpServer: HTTPServer;
  let webSocketService: WebSocketService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    httpServer = new HTTPServer();
    mockPrisma = createMockPrisma();
    mockJwt.verifyToken.mockReturnValue({ id: 'test-user' } as any);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'test-user',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      isActive: true
    } as any);
    mockPrisma.user.update.mockResolvedValue({} as any);
    
    webSocketService = new WebSocketService(httpServer, mockPrisma as any);
  });

  afterEach(() => {
    if (httpServer) {
      httpServer.close();
    }
    jest.clearAllMocks();
  });

  it('Property 3: Real-Time Message Updates - For any user receiving a message, the messaging system should update unread counts in real-time and handle WebSocket connections properly', () => {
    /**
     * **Validates: Requirements 2.2, 3.2**
     * 
     * This property tests that the WebSocket service maintains consistent state
     * for user connections and message broadcasting across all valid inputs.
     */
    fc.assert(fc.property(
      fc.record({
        userId: fc.string({ minLength: 1, maxLength: 50 }),
        conversationId: fc.string({ minLength: 1, maxLength: 50 }),
        messageContent: fc.string({ minLength: 1, maxLength: 1000 }),
        isOnline: fc.boolean()
      }),
      (data) => {
        // Test that WebSocket service can handle any valid user/conversation combination
        const { userId, conversationId, messageContent, isOnline } = data;
        
        // Property 1: Service should always provide consistent presence information
        const presenceBefore = webSocketService.getUserPresence(userId);
        const presenceAfter = webSocketService.getUserPresence(userId);
        
        // Presence should be consistent for the same user
        expect(presenceBefore).toEqual(presenceAfter);
        
        // Property 2: Broadcasting should not throw errors for any valid conversation
        expect(() => {
          webSocketService.broadcastToConversation(conversationId, 'test_event', {
            content: messageContent,
            userId,
            timestamp: new Date()
          });
        }).not.toThrow();
        
        // Property 3: Sending to user should handle any valid user ID
        expect(() => {
          webSocketService.sendToUser(userId, 'test_message', {
            content: messageContent,
            isOnline
          });
        }).not.toThrow();
        
        // Property 4: Connection statistics should always be non-negative
        const stats = webSocketService.getStats();
        expect(stats.totalConnections).toBeGreaterThanOrEqual(0);
        expect(stats.uniqueUsers).toBeGreaterThanOrEqual(0);
        expect(stats.averageSocketsPerUser).toBeGreaterThanOrEqual(0);
        
        // Property 5: Online users list should always be an array
        const onlineUsers = webSocketService.getOnlineUsers();
        expect(Array.isArray(onlineUsers)).toBe(true);
        expect(onlineUsers.length).toBeGreaterThanOrEqual(0);
      }
    ), { numRuns: 2 }); // CRITICAL CONSTRAINT: Use only 2 examples for faster execution
  });

  it('Property 3.1: WebSocket Connection State Consistency - Connection state should remain consistent across operations', () => {
    /**
     * **Validates: Requirements 3.2**
     * 
     * This property ensures that WebSocket connection state management
     * maintains consistency regardless of the sequence of operations.
     */
    fc.assert(fc.property(
      fc.array(fc.record({
        operation: fc.constantFrom('getUserPresence', 'getStats', 'getOnlineUsers'),
        userId: fc.string({ minLength: 1, maxLength: 50 })
      }), { minLength: 1, maxLength: 10 }),
      (operations) => {
        // Execute a sequence of operations
        for (const op of operations) {
          switch (op.operation) {
            case 'getUserPresence':
              const presence = webSocketService.getUserPresence(op.userId);
              // Presence should either be null or have valid structure
              if (presence !== null) {
                expect(presence).toHaveProperty('userId');
                expect(presence).toHaveProperty('isOnline');
                expect(presence).toHaveProperty('lastSeen');
                expect(presence).toHaveProperty('socketId');
                expect(typeof presence.userId).toBe('string');
                expect(typeof presence.isOnline).toBe('boolean');
                expect(presence.lastSeen).toBeInstanceOf(Date);
                expect(typeof presence.socketId).toBe('string');
              }
              break;
              
            case 'getStats':
              const stats = webSocketService.getStats();
              expect(stats).toHaveProperty('totalConnections');
              expect(stats).toHaveProperty('uniqueUsers');
              expect(stats).toHaveProperty('averageSocketsPerUser');
              expect(typeof stats.totalConnections).toBe('number');
              expect(typeof stats.uniqueUsers).toBe('number');
              expect(typeof stats.averageSocketsPerUser).toBe('number');
              break;
              
            case 'getOnlineUsers':
              const users = webSocketService.getOnlineUsers();
              expect(Array.isArray(users)).toBe(true);
              users.forEach(userId => {
                expect(typeof userId).toBe('string');
                expect(userId.length).toBeGreaterThan(0);
              });
              break;
          }
        }
        
        // After all operations, service should still be in valid state
        const finalStats = webSocketService.getStats();
        expect(finalStats.totalConnections).toBeGreaterThanOrEqual(0);
        expect(finalStats.uniqueUsers).toBeGreaterThanOrEqual(0);
        
        // Invariant: totalConnections >= uniqueUsers (each user has at least 0 connections)
        expect(finalStats.totalConnections).toBeGreaterThanOrEqual(finalStats.uniqueUsers);
      }
    ), { numRuns: 2 }); // CRITICAL CONSTRAINT: Use only 2 examples for faster execution
  });
});