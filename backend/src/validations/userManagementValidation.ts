import { z } from 'zod';

export const searchUsersSchema = z.object({
  q: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  skills: z.string().optional(),
  location: z.string().optional(),
  experience: z.string().optional(),
  company: z.string().optional(),
});

export const sendConnectionRequestSchema = z.object({
  toUserId: z.string().min(1, 'Target user ID is required'),
});

export const respondToConnectionRequestSchema = z.object({
  response: z.enum(['accept', 'decline'], {
    errorMap: () => ({ message: 'Response must be either "accept" or "decline"' })
  }),
});

export const reportUserSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be less than 500 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

export const moderateUserSchema = z.object({
  type: z.enum(['warn', 'suspend', 'ban', 'unban'], {
    errorMap: () => ({ message: 'Type must be one of: warn, suspend, ban, unban' })
  }),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be less than 500 characters'),
  duration: z.number().min(1).max(365).optional(), // Duration in days
});

export const getUserActivitySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

export const getConnectionsSchema = z.object({
  status: z.enum(['accepted', 'pending', 'all']).optional(),
});