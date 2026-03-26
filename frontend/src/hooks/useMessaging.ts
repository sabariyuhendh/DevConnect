import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiRequest } from '@/config/api';

export interface User {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: User;
  MessageReadStatus?: any[];
}

export interface Conversation {
  id: string;
  type: string;
  members: User[];
  lastMessage: Message | null;
  updatedAt: string;
  createdAt: string;
}

export const useMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem('dc_user');
    if (!token) return;

    const userData = JSON.parse(token);
    const socket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/messages`, {
      auth: { token: userData.token }
    });

    socket.on('connect', () => {
      console.log('✅ Connected to messaging server');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from messaging server');
      setConnected(false);
    });

    socket.on('message:new', (message: Message) => {
      console.log('📨 New message received:', message);
      setMessages(prev => [...prev, message]);
      
      // Update conversation last message
      setConversations(prev => prev.map(conv => 
        conv.id === message.conversationId
          ? { ...conv, lastMessage: message, updatedAt: new Date().toISOString() }
          : conv
      ));
    });

    socket.on('message:notification', ({ conversationId, message }) => {
      console.log('🔔 Message notification:', conversationId);
      // Update unread count
      fetchUnreadCount();
    });

    socket.on('typing:user', ({ userId, conversationId }) => {
      if (currentConversation?.id === conversationId) {
        setTypingUsers(prev => new Set(prev).add(userId));
      }
    });

    socket.on('typing:stop', ({ userId }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socket.on('messages:read', ({ userId, conversationId }) => {
      console.log(`✓ Messages read by ${userId} in ${conversationId}`);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/api/messages/conversations', {
        method: 'GET'
      });
      setConversations(response.data || response);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get or create conversation
  const getOrCreateConversation = useCallback(async (otherUserId: string) => {
    try {
      const response = await apiRequest('/api/messages/conversations', {
        method: 'POST',
        body: { otherUserId }
      });
      const conversation = response.data || response;
      setCurrentConversation(conversation);
      setMessages(conversation.messages || []);
      
      // Join conversation room
      if (socketRef.current) {
        socketRef.current.emit('join:conversation', conversation.id);
      }
      
      return conversation;
    } catch (error) {
      console.error('Failed to get/create conversation:', error);
      throw error;
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    try {
      const response = await apiRequest(`/api/messages/conversations/${conversationId}/messages`, {
        method: 'GET'
      });
      setMessages(response.data || response);
      
      // Join conversation room
      if (socketRef.current) {
        socketRef.current.emit('join:conversation', conversationId);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message via Socket.IO
  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (!socketRef.current || !content.trim()) return;

    socketRef.current.emit('message:send', {
      conversationId,
      content: content.trim()
    });
  }, []);

  // Send typing indicator
  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (!socketRef.current) return;

    if (isTyping) {
      socketRef.current.emit('typing:start', conversationId);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing:stop', conversationId);
      }, 3000);
    } else {
      socketRef.current.emit('typing:stop', conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await apiRequest(`/api/messages/conversations/${conversationId}/read`, {
        method: 'POST'
      });
      
      if (socketRef.current) {
        socketRef.current.emit('messages:read', conversationId);
      }
      
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await apiRequest(`/api/messages/messages/${messageId}`, {
        method: 'DELETE'
      });
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiRequest('/api/messages/conversations/unread-count', {
        method: 'GET'
      });
      setUnreadCount(response.data?.count || response.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  // Select conversation
  const selectConversation = useCallback((conversation: Conversation) => {
    // Leave previous conversation room
    if (currentConversation && socketRef.current) {
      socketRef.current.emit('leave:conversation', currentConversation.id);
    }
    
    setCurrentConversation(conversation);
    fetchMessages(conversation.id);
    markAsRead(conversation.id);
  }, [currentConversation, fetchMessages, markAsRead]);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    connected,
    typingUsers,
    unreadCount,
    fetchConversations,
    getOrCreateConversation,
    selectConversation,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    deleteMessage,
    fetchUnreadCount
  };
};
