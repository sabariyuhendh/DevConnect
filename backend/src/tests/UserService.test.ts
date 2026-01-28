import { PrismaClient } from '@prisma/client';
import { UserService } from '../services/userService';
import * as fc from 'fast-check';

const prisma = new PrismaClient();
const userService = new UserService(prisma);

describe('UserService', () => {
  let testUser1: any;
  let testUser2: any;

  beforeAll(async () => {
    // Create test users
    testUser1 = await prisma.user.create({
      data: {
        email: 'testuser1@example.com',
        username: 'testuser1',
        firstName: 'Test',
        lastName: 'User1',
        bio: 'Test user 1 bio',
        isActive: true,
      }
    });

    testUser2 = await prisma.user.create({
      data: {
        email: 'testuser2@example.com',
        username: 'testuser2',
        firstName: 'Test',
        lastName: 'User2',
        bio: 'Test user 2 bio',
        isActive: true,
      }
    });

    // Add some skills for testing
    await prisma.userSkill.createMany({
      data: [
        {
          userId: testUser1.id,
          skillName: 'JavaScript',
          proficiencyLevel: 'ADVANCED',
          yearsExperience: 5
        },
        {
          userId: testUser2.id,
          skillName: 'JavaScript',
          proficiencyLevel: 'INTERMEDIATE',
          yearsExperience: 3
        }
      ]
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.userConnection.deleteMany({
      where: {
        OR: [
          { requesterId: testUser1.id },
          { addresseeId: testUser1.id },
          { requesterId: testUser2.id },
          { addresseeId: testUser2.id }
        ]
      }
    });

    await prisma.userReport.deleteMany({
      where: {
        OR: [
          { reporterId: testUser1.id },
          { reportedId: testUser1.id },
          { reporterId: testUser2.id },
          { reportedId: testUser2.id }
        ]
      }
    });

    await prisma.userActivityLog.deleteMany({
      where: {
        OR: [
          { userId: testUser1.id },
          { userId: testUser2.id }
        ]
      }
    });

    await prisma.userSkill.deleteMany({
      where: {
        OR: [
          { userId: testUser1.id },
          { userId: testUser2.id }
        ]
      }
    });

    await prisma.user.deleteMany({
      where: {
        id: {
          in: [testUser1.id, testUser2.id]
        }
      }
    });

    await prisma.$disconnect();
  });

  describe('searchUsers', () => {
    it('should search users by name', async () => {
      const result = await userService.searchUsers('Test');
      
      expect(result.users.length).toBeGreaterThanOrEqual(2);
      expect(result.pagination.total).toBeGreaterThanOrEqual(2);
      
      const usernames = result.users.map(u => u.username);
      expect(usernames).toContain('testuser1');
      expect(usernames).toContain('testuser2');
    });

    it('should search users with skill filter', async () => {
      const result = await userService.searchUsers('', { skills: ['JavaScript'] });
      
      expect(result.users.length).toBeGreaterThanOrEqual(2);
      const usernames = result.users.map(u => u.username);
      expect(usernames).toContain('testuser1');
      expect(usernames).toContain('testuser2');
    });
  });

  describe('connection management', () => {
    it('should send and respond to connection requests', async () => {
      // Send connection request
      const connectionRequest = await userService.sendConnectionRequest(testUser1.id, testUser2.id);
      
      expect(connectionRequest.requesterId).toBe(testUser1.id);
      expect(connectionRequest.addresseeId).toBe(testUser2.id);
      expect(connectionRequest.status).toBe('PENDING');

      // Respond to connection request
      await userService.respondToConnectionRequest(connectionRequest.id, 'accept', testUser2.id);

      // Check connections
      const connections = await userService.getConnections(testUser1.id, 'accepted');
      expect(connections.length).toBe(1);
      expect(connections[0].otherUser.id).toBe(testUser2.id);
    });

    it('should prevent duplicate connection requests', async () => {
      await expect(
        userService.sendConnectionRequest(testUser1.id, testUser2.id)
      ).rejects.toThrow('Users are already connected');
    });
  });

  describe('safety features', () => {
    it('should block and report users', async () => {
      // Block user
      await userService.blockUser(testUser1.id, testUser2.id);
      
      const isBlocked = await userService.isUserBlocked(testUser1.id, testUser2.id);
      expect(isBlocked).toBe(true);

      // Report user
      await userService.reportUser(testUser1.id, testUser2.id, 'Inappropriate behavior', 'Test report');
      
      // Check activity logs
      const activity = await userService.getUserActivity(testUser1.id);
      expect(activity.activities.length).toBeGreaterThan(0);
      
      const reportActivity = activity.activities.find(a => a.action === 'user_reported');
      expect(reportActivity).toBeDefined();
    });
  });

  describe('Feature: messaging-and-user-management', () => {
    it('Property 15: User Relationship Management', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          action: fc.constantFrom('connect', 'block', 'report'),
          reason: fc.string({ minLength: 1, maxLength: 100 })
        }),
        async (testData) => {
          // Create temporary test users for property testing
          const tempUser1 = await prisma.user.create({
            data: {
              email: `temp1_${Date.now()}@example.com`,
              username: `temp1_${Date.now()}`,
              firstName: 'Temp',
              lastName: 'User1',
              isActive: true,
            }
          });

          const tempUser2 = await prisma.user.create({
            data: {
              email: `temp2_${Date.now()}@example.com`,
              username: `temp2_${Date.now()}`,
              firstName: 'Temp',
              lastName: 'User2',
              isActive: true,
            }
          });

          try {
            // Property: User relationship operations should maintain data consistency
            if (testData.action === 'connect') {
              const connectionRequest = await userService.sendConnectionRequest(tempUser1.id, tempUser2.id);
              expect(connectionRequest.requesterId).toBe(tempUser1.id);
              expect(connectionRequest.addresseeId).toBe(tempUser2.id);
              expect(connectionRequest.status).toBe('PENDING');
              
              await userService.respondToConnectionRequest(connectionRequest.id, 'accept', tempUser2.id);
              const connections = await userService.getConnections(tempUser1.id, 'accepted');
              expect(connections.length).toBeGreaterThanOrEqual(1);
            }
            
            if (testData.action === 'block') {
              await userService.blockUser(tempUser1.id, tempUser2.id);
              const isBlocked = await userService.isUserBlocked(tempUser1.id, tempUser2.id);
              expect(isBlocked).toBe(true);
            }
            
            if (testData.action === 'report') {
              await userService.reportUser(tempUser1.id, tempUser2.id, testData.reason);
              const activity = await userService.getUserActivity(tempUser1.id);
              expect(activity.activities.length).toBeGreaterThan(0);
            }

            // Property: Connection status should be consistent
            const status = await userService.getConnectionStatus(tempUser1.id, tempUser2.id);
            expect(['none', 'PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED']).toContain(status);
          } finally {
            // Clean up temporary users
            await prisma.userConnection.deleteMany({
              where: {
                OR: [
                  { requesterId: tempUser1.id },
                  { addresseeId: tempUser1.id },
                  { requesterId: tempUser2.id },
                  { addresseeId: tempUser2.id }
                ]
              }
            });

            await prisma.userReport.deleteMany({
              where: {
                OR: [
                  { reporterId: tempUser1.id },
                  { reportedId: tempUser1.id },
                  { reporterId: tempUser2.id },
                  { reportedId: tempUser2.id }
                ]
              }
            });

            await prisma.userActivityLog.deleteMany({
              where: {
                OR: [
                  { userId: tempUser1.id },
                  { userId: tempUser2.id }
                ]
              }
            });

            await prisma.user.deleteMany({
              where: {
                id: {
                  in: [tempUser1.id, tempUser2.id]
                }
              }
            });
          }
        }
      ), { numRuns: 2 });
    });

    it('Property 16: Safety Feature Implementation', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          reportReason: fc.string({ minLength: 1, maxLength: 100 }),
          reportDescription: fc.string({ minLength: 0, maxLength: 500 })
        }),
        async (testData) => {
          // Create temporary test users
          const tempUser1 = await prisma.user.create({
            data: {
              email: `safety1_${Date.now()}@example.com`,
              username: `safety1_${Date.now()}`,
              firstName: 'Safety',
              lastName: 'User1',
              isActive: true,
            }
          });

          const tempUser2 = await prisma.user.create({
            data: {
              email: `safety2_${Date.now()}@example.com`,
              username: `safety2_${Date.now()}`,
              firstName: 'Safety',
              lastName: 'User2',
              isActive: true,
            }
          });

          try {
            // Property: Safety features should prevent harmful interactions
            await userService.blockUser(tempUser1.id, tempUser2.id);
            const isBlocked = await userService.isUserBlocked(tempUser1.id, tempUser2.id);
            expect(isBlocked).toBe(true);

            // Property: Blocked users cannot send connection requests
            await expect(
              userService.sendConnectionRequest(tempUser1.id, tempUser2.id)
            ).rejects.toThrow('Cannot send connection request to blocked user');

            // Property: Reporting should create proper audit trail
            await userService.reportUser(tempUser1.id, tempUser2.id, testData.reportReason, testData.reportDescription);
            const activity = await userService.getUserActivity(tempUser1.id);
            const reportActivity = activity.activities.find(a => a.action === 'user_reported');
            expect(reportActivity).toBeDefined();
            expect(reportActivity?.details.reason).toBe(testData.reportReason);
          } finally {
            // Clean up
            await prisma.userConnection.deleteMany({
              where: {
                OR: [
                  { requesterId: tempUser1.id },
                  { addresseeId: tempUser1.id },
                  { requesterId: tempUser2.id },
                  { addresseeId: tempUser2.id }
                ]
              }
            });

            await prisma.userReport.deleteMany({
              where: {
                OR: [
                  { reporterId: tempUser1.id },
                  { reportedId: tempUser1.id },
                  { reporterId: tempUser2.id },
                  { reportedId: tempUser2.id }
                ]
              }
            });

            await prisma.userActivityLog.deleteMany({
              where: {
                OR: [
                  { userId: tempUser1.id },
                  { userId: tempUser2.id }
                ]
              }
            });

            await prisma.user.deleteMany({
              where: {
                id: {
                  in: [tempUser1.id, tempUser2.id]
                }
              }
            });
          }
        }
      ), { numRuns: 2 });
    });
  });
});