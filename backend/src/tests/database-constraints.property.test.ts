import * as fc from 'fast-check';
import { PrismaClient } from '@prisma/client';

/**
 * Property-Based Test for Database Constraint Enforcement
 * **Validates: Requirements 6.4**
 * 
 * This test validates that the database properly enforces:
 * - Foreign key constraints
 * - Unique constraints
 * - Cascade deletes
 * - Data integrity rules
 */

describe('Feature: messaging-and-user-management', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Use test database
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/devconnect_test'
        }
      }
    });
    
    await prisma.$connect();
    
    // Clean up any existing test data
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  async function cleanupTestData() {
    // Clean up in reverse dependency order
    await prisma.messageReadStatus.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.conversationMember.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.groupMessage.deleteMany({});
    await prisma.groupMember.deleteMany({});
    await prisma.group.deleteMany({});
    await prisma.follow.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.like.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});
  }

  it('Property 21: Database Constraint Enforcement', async () => {
    await fc.assert(fc.asyncProperty(
      // Generate test data
      fc.record({
        validUser: fc.record({
          email: fc.emailAddress(),
          username: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
          firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          lastName: fc.option(fc.string({ minLength: 1, maxLength: 50 }))
        }),
        invalidUserId: fc.string({ minLength: 10, maxLength: 30 }),
        messageContent: fc.string({ minLength: 1, maxLength: 1000 })
      }),
      async (testData) => {
        try {
          // Test 1: Foreign Key Constraint Enforcement
          // Create a valid user first
          const user = await prisma.user.create({
            data: {
              email: testData.validUser.email,
              username: testData.validUser.username,
              firstName: testData.validUser.firstName,
              lastName: testData.validUser.lastName
            }
          });

          // Test 2: Unique Constraint Enforcement
          // Attempt to create duplicate email should fail
          let duplicateEmailFailed = false;
          try {
            await prisma.user.create({
              data: {
                email: testData.validUser.email, // Same email
                username: testData.validUser.username + '_2'
              }
            });
          } catch (error: any) {
            duplicateEmailFailed = error.code === 'P2002'; // Unique constraint violation
          }
          expect(duplicateEmailFailed).toBe(true);

          // Test 3: Unique Constraint Enforcement for username
          let duplicateUsernameFailed = false;
          try {
            await prisma.user.create({
              data: {
                email: 'different_' + testData.validUser.email,
                username: testData.validUser.username // Same username
              }
            });
          } catch (error: any) {
            duplicateUsernameFailed = error.code === 'P2002';
          }
          expect(duplicateUsernameFailed).toBe(true);

          // Test 4: Foreign Key Constraint - Invalid User ID
          let invalidForeignKeyFailed = false;
          try {
            await prisma.conversation.create({
              data: {
                type: 'DIRECT',
                members: {
                  create: {
                    userId: testData.invalidUserId // Non-existent user ID
                  }
                }
              }
            });
          } catch (error: any) {
            invalidForeignKeyFailed = error.code === 'P2003'; // Foreign key constraint violation
          }
          expect(invalidForeignKeyFailed).toBe(true);

          // Test 5: Valid Foreign Key Relationships
          const conversation = await prisma.conversation.create({
            data: {
              type: 'DIRECT',
              members: {
                create: {
                  userId: user.id // Valid user ID
                }
              }
            }
          });

          const message = await prisma.message.create({
            data: {
              conversationId: conversation.id,
              senderId: user.id,
              content: testData.messageContent
            }
          });

          // Test 6: Cascade Delete Behavior
          // Delete user should cascade to related records
          await prisma.user.delete({
            where: { id: user.id }
          });

          // Verify cascade deletes worked
          const remainingMembers = await prisma.conversationMember.findMany({
            where: { userId: user.id }
          });
          expect(remainingMembers).toHaveLength(0);

          const remainingMessages = await prisma.message.findMany({
            where: { senderId: user.id }
          });
          expect(remainingMessages).toHaveLength(0);

          // Test 7: Orphaned conversation should still exist (no cascade from user to conversation)
          const remainingConversation = await prisma.conversation.findUnique({
            where: { id: conversation.id }
          });
          expect(remainingConversation).toBeTruthy();

          // Clean up
          await prisma.conversation.delete({
            where: { id: conversation.id }
          });

        } catch (error) {
          console.error('Test execution error:', error);
          throw error;
        }
      }
    ), { numRuns: 2 }); // Run only 2 examples for faster execution
  });
});