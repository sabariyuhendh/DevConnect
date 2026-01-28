import { z } from 'zod';

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// Message validation
export const sendMessageSchema = z.object({
  conversationId: z.string().cuid(),
  content: z.string().min(1).max(5000)
});

// Conversation validation
export const createConversationSchema = z.object({
  type: z.enum(['DIRECT']).default('DIRECT'),
  memberIds: z.array(z.string().cuid()).min(1).max(100)
});

// Mark as read validation
export const markAsReadSchema = z.object({
  messageId: z.string().cuid().optional()
});

// Search validation
export const searchMessagesSchema = z.object({
  q: z.string().min(1).max(200),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

// Get messages validation - query parameters
export const getMessagesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// Get conversations validation - query parameters
export const getConversationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Conversation ID param validation
export const conversationParamsSchema = z.object({
  id: z.string().cuid(),
});

// Type exports
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
export type SearchMessagesInput = z.infer<typeof searchMessagesSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type GetConversationsInput = z.infer<typeof getConversationsSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ConversationParamsInput = z.infer<typeof conversationParamsSchema>;