import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  reconnectionAttempts?: number;
}

interface WebSocketMessage {
  conversationId: string;
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
}

interface TypingIndicator {
  conversationId: string;
  userId: string;
  username?: string;
  isTyping: boolean;
}

interface PresenceUpdate {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
}

export const useWebSocket = (token: string | null, options: UseWebSocketOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(new Map());

  const {
    url = import.meta.env.VITE_API_URL || 'http://localhost:3000',
    autoConnect = true,
    reconnection = true,
    reconnectionDelay = 1000,
    reconnectionDelayMax = 5000,
    reconnectionAttempts = 5
  } = options;

  // Initialize WebSocket connection
  useEffect(() => {
    if (!token || !autoConnect) return;

    setIsConnecting(true);

    try {
      socketRef.current = io(url, {
        auth: {
          token
        },
        reconnection,
        reconnectionDelay,
        reconnectionDelayMax,
        reconnectionAttempts,
        transports: ['websocket', 'polling']
      });

      // Connection events
      socketRef.current.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
      });

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (err: Error) => {
        console.error('WebSocket connection error:', err);
        setError(err.message);
        setIsConnecting(false);
      });

      socketRef.current.on('error', (err: any) => {
        console.error('WebSocket error:', err);
        setError(typeof err === 'string' ? err : err?.message || 'Unknown error');
      });

      // Presence events
      socketRef.current.on('online_users', (users: string[]) => {
        setOnlineUsers(users);
      });

      socketRef.current.on('presence_update', (data: PresenceUpdate) => {
        // Handle presence updates
        console.log('Presence update:', data);
      });

      // Typing indicators
      socketRef.current.on('user_typing', (data: TypingIndicator) => {
        setTypingUsers(prev => {
          const updated = new Map(prev);
          if (data.isTyping) {
            updated.set(`${data.conversationId}:${data.userId}`, data);
          } else {
            updated.delete(`${data.conversationId}:${data.userId}`);
          }
          return updated;
        });
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      setIsConnecting(false);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, url, autoConnect, reconnection, reconnectionDelay, reconnectionDelayMax, reconnectionAttempts]);

  // Send message
  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (!socketRef.current?.connected) {
      setError('WebSocket not connected');
      return;
    }

    socketRef.current.emit('send_message', {
      conversationId,
      content
    });
  }, []);

  // Mark as read
  const markAsRead = useCallback((conversationId: string, messageId?: string) => {
    if (!socketRef.current?.connected) {
      setError('WebSocket not connected');
      return;
    }

    socketRef.current.emit('mark_as_read', {
      conversationId,
      messageId
    });
  }, []);

  // Join conversation
  const joinConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      setError('WebSocket not connected');
      return;
    }

    socketRef.current.emit('join_conversation', {
      conversationId
    });
  }, []);

  // Leave conversation
  const leaveConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      setError('WebSocket not connected');
      return;
    }

    socketRef.current.emit('leave_conversation', {
      conversationId
    });
  }, []);

  // Start typing
  const startTyping = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit('typing_start', {
      conversationId
    });
  }, []);

  // Stop typing
  const stopTyping = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit('typing_stop', {
      conversationId
    });
  }, []);

  // Get online users
  const getOnlineUsers = useCallback(() => {
    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit('get_online_users');
  }, []);

  // Check presence
  const checkPresence = useCallback((userIds: string[]) => {
    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit('check_presence', {
      userIds
    });
  }, []);

  // Listen to event
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on(event, callback);
  }, []);

  // Remove event listener
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (!socketRef.current) return;
    socketRef.current.off(event, callback);
  }, []);

  // Emit custom event
  const emit = useCallback((event: string, data?: any) => {
    if (!socketRef.current?.connected) {
      setError('WebSocket not connected');
      return;
    }

    socketRef.current.emit(event, data);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    onlineUsers,
    typingUsers,
    sendMessage,
    markAsRead,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    getOnlineUsers,
    checkPresence,
    on,
    off,
    emit
  };
};
