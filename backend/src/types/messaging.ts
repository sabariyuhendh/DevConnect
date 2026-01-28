export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'code';
  metadata?: MessageMetadata;
  createdAt: Date;
  editedAt?: Date;
}

export interface MessageMetadata {
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  codeLanguage?: string;
}

export interface ConversationWithMetadata {
  id: string;
  type: 'DIRECT' | 'GROUP';
  unreadCount: number;
  lastMessage?: MessageData;
  participants: ParticipantInfo[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ParticipantInfo {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface UnreadCounts {
  total: number;
  conversations: Record<string, number>;
}

export interface SearchResult {
  messageId: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: Date;
  context?: {
    before?: string;
    after?: string;
  };
}

export interface CreateConversationData {
  participants: string[];
  type: 'DIRECT' | 'GROUP';
  name?: string;
  description?: string;
}

export interface SendMessageData {
  conversationId: string;
  senderId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'code';
  metadata?: MessageMetadata;
}

export interface MessageServiceInterface {
  // Conversation management
  createConversation(data: CreateConversationData): Promise<ConversationWithMetadata>;
  getConversations(userId: string, pagination?: PaginationOptions): Promise<{
    conversations: ConversationWithMetadata[];
    meta: PaginationMeta;
  }>;
  getConversation(conversationId: string, userId: string): Promise<ConversationWithMetadata | null>;
  
  // Message operations
  sendMessage(data: SendMessageData): Promise<MessageData>;
  getMessages(
    conversationId: string, 
    userId: string, 
    pagination?: PaginationOptions
  ): Promise<{
    messages: MessageData[];
    meta: PaginationMeta;
  }>;
  markAsRead(conversationId: string, userId: string): Promise<void>;
  
  // Unread counts
  getUnreadCounts(userId: string): Promise<UnreadCounts>;
  getConversationUnreadCount(conversationId: string, userId: string): Promise<number>;
  
  // Search functionality
  searchMessages(userId: string, query: string, pagination?: PaginationOptions): Promise<{
    results: SearchResult[];
    meta: PaginationMeta;
  }>;
  
  // Utility methods
  isUserInConversation(conversationId: string, userId: string): Promise<boolean>;
  getConversationParticipants(conversationId: string): Promise<ParticipantInfo[]>;
}