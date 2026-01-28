import { PrismaClient } from '@prisma/client';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

const prisma = new PrismaClient();

describe('User Management Tables Migration', () => {
  let testUser1: any;
  let testUser2: any;

  beforeAll(async () => {
    // Create test users
    testUser1 = await prisma.user.create({
      data: {
        email: 'test1@example.com',
        username: 'testuser1',
        firstName: 'Test',
        lastName: 'User1'
      }
    });

    testUser2 = await prisma.user.create({
      data: {
        email: 'test2@example.com',
        username: 'testuser2',
        firstName: 'Test',
        lastName: 'User2'
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.userConnection.deleteMany({});
    await prisma.userActivityLog.deleteMany({});
    await prisma.userReport.deleteMany({});
    await prisma.userSkill.deleteMany({});
    await prisma.userExperience.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        id: { in: [testUser1.id, testUser2.id] }
      }
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up between tests
    await prisma.userConnection.deleteMany({});
    await prisma.userActivityLog.deleteMany({});
    await prisma.userReport.deleteMany({});
    await prisma.userSkill.deleteMany({});
    await prisma.userExperience.deleteMany({});
  });

  describe('UserConnection table', () => {
    it('should create a connection request', async () => {
      const connection = await prisma.userConnection.create({
        data: {
          requesterId: testUser1.id,
          addresseeId: testUser2.id,
          status: 'PENDING'
        }
      });

      expect(connection).toBeDefined();
      expect(connection.requesterId).toBe(testUser1.id);
      expect(connection.addresseeId).toBe(testUser2.id);
      expect(connection.status).toBe('PENDING');
    });

    it('should enforce unique constraint on requester-addressee pair', async () => {
      await prisma.userConnection.create({
        data: {
          requesterId: testUser1.id,
          addresseeId: testUser2.id,
          status: 'PENDING'
        }
      });

      await expect(
        prisma.userConnection.create({
          data: {
            requesterId: testUser1.id,
            addresseeId: testUser2.id,
            status: 'PENDING'
          }
        })
      ).rejects.toThrow();
    });
  });

  describe('UserActivityLog table', () => {
    it('should create an activity log entry', async () => {
      const log = await prisma.userActivityLog.create({
        data: {
          userId: testUser1.id,
          action: 'LOGIN',
          details: { ip: '127.0.0.1' },
          ipAddress: '127.0.0.1',
          userAgent: 'Test Browser'
        }
      });

      expect(log).toBeDefined();
      expect(log.userId).toBe(testUser1.id);
      expect(log.action).toBe('LOGIN');
      expect(log.details).toEqual({ ip: '127.0.0.1' });
    });
  });

  describe('UserReport table', () => {
    it('should create a user report', async () => {
      const report = await prisma.userReport.create({
        data: {
          reporterId: testUser1.id,
          reportedId: testUser2.id,
          reason: 'Spam',
          description: 'User is sending spam messages',
          status: 'PENDING'
        }
      });

      expect(report).toBeDefined();
      expect(report.reporterId).toBe(testUser1.id);
      expect(report.reportedId).toBe(testUser2.id);
      expect(report.reason).toBe('Spam');
      expect(report.status).toBe('PENDING');
    });
  });

  describe('UserSkill table', () => {
    it('should create a user skill', async () => {
      const skill = await prisma.userSkill.create({
        data: {
          userId: testUser1.id,
          skillName: 'TypeScript',
          proficiencyLevel: 'ADVANCED',
          yearsExperience: 3
        }
      });

      expect(skill).toBeDefined();
      expect(skill.userId).toBe(testUser1.id);
      expect(skill.skillName).toBe('TypeScript');
      expect(skill.proficiencyLevel).toBe('ADVANCED');
      expect(skill.yearsExperience).toBe(3);
    });
  });

  describe('UserExperience table', () => {
    it('should create a user experience entry', async () => {
      const experience = await prisma.userExperience.create({
        data: {
          userId: testUser1.id,
          company: 'Tech Corp',
          position: 'Senior Developer',
          description: 'Full-stack development',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2023-01-01'),
          isCurrent: false
        }
      });

      expect(experience).toBeDefined();
      expect(experience.userId).toBe(testUser1.id);
      expect(experience.company).toBe('Tech Corp');
      expect(experience.position).toBe('Senior Developer');
      expect(experience.isCurrent).toBe(false);
    });

    it('should handle current position', async () => {
      const experience = await prisma.userExperience.create({
        data: {
          userId: testUser1.id,
          company: 'Current Corp',
          position: 'Lead Developer',
          isCurrent: true
        }
      });

      expect(experience.isCurrent).toBe(true);
      expect(experience.endDate).toBeNull();
    });
  });

  describe('Foreign key relationships', () => {
    it('should cascade delete user connections when user is deleted', async () => {
      const tempUser = await prisma.user.create({
        data: {
          email: 'temp@example.com',
          username: 'tempuser'
        }
      });

      await prisma.userConnection.create({
        data: {
          requesterId: tempUser.id,
          addresseeId: testUser1.id,
          status: 'PENDING'
        }
      });

      await prisma.user.delete({
        where: { id: tempUser.id }
      });

      const connections = await prisma.userConnection.findMany({
        where: { requesterId: tempUser.id }
      });

      expect(connections).toHaveLength(0);
    });
  });

  describe('Indexes and performance', () => {
    it('should efficiently query connections by status', async () => {
      // Create multiple connections with different statuses
      await prisma.userConnection.createMany({
        data: [
          { requesterId: testUser1.id, addresseeId: testUser2.id, status: 'PENDING' },
          { requesterId: testUser2.id, addresseeId: testUser1.id, status: 'ACCEPTED' }
        ]
      });

      const pendingConnections = await prisma.userConnection.findMany({
        where: { status: 'PENDING' }
      });

      expect(pendingConnections).toHaveLength(1);
      expect(pendingConnections[0].status).toBe('PENDING');
    });

    it('should efficiently query activity logs by user and date', async () => {
      const now = new Date();
      await prisma.userActivityLog.create({
        data: {
          userId: testUser1.id,
          action: 'LOGIN',
          createdAt: now
        }
      });

      const logs = await prisma.userActivityLog.findMany({
        where: {
          userId: testUser1.id,
          createdAt: { gte: new Date(now.getTime() - 1000) }
        },
        orderBy: { createdAt: 'desc' }
      });

      expect(logs).toHaveLength(1);
    });
  });
});