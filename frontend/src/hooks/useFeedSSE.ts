import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/config/api';

interface Post {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  mediaUrls: string[];
  tags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface SSEMessage {
  type: 'connected' | 'new_post' | 'post_updated' | 'post_deleted' | 'error';
  data?: any;
  userId?: string;
  message?: string;
}

interface FeedSSEHook {
  isConnected: boolean;
  onNewPost: (callback: (post: Post) => void) => void;
  onPostUpdate: (callback: (post: Post) => void) => void;
  onPostDelete: (callback: (postId: string) => void) => void;
}

/**
 * Server-Sent Events (SSE) hook for real-time feed updates
 * More efficient than WebSockets for one-way server→client push
 * 
 * Benefits over WebSocket:
 * - Simpler implementation
 * - Better proxy/firewall compatibility (uses standard HTTP)
 * - Automatic reconnection built-in
 * - Lower overhead for one-way communication
 * - Stateless and easier to scale
 */
export function useFeedSSE(): FeedSSEHook {
  const { user, logout } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;
  const callbacksRef = useRef<{
    newPost: ((post: Post) => void)[];
    postUpdate: ((post: Post) => void)[];
    postDelete: ((postId: string) => void)[];
  }>({
    newPost: [],
    postUpdate: [],
    postDelete: []
  });

  useEffect(() => {
    if (!user?.token) {
      console.log('⏭️ No user token - skipping SSE connection');
      return;
    }

    console.log('🔌 SSE: Attempting to connect...');
    console.log('🔌 SSE: API_BASE:', API_BASE);

    // Create EventSource with auth token in query parameter
    const url = `${API_BASE}/api/posts/feed/stream?token=${encodeURIComponent(user.token)}`;
    console.log('🔌 SSE: Connecting to:', url.replace(user.token, 'TOKEN_HIDDEN'));
    
    const eventSource = new EventSource(url);

    eventSourceRef.current = eventSource;

    // Connection opened
    eventSource.onopen = () => {
      console.log('✅ SSE: Feed stream connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0; // Reset on successful connection
    };

    // Handle messages
    eventSource.onmessage = (event) => {
      try {
        console.log('📨 SSE: Raw message:', event.data);
        const message: SSEMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'connected':
            console.log('✅ SSE: Connection confirmed for user', message.userId);
            break;
            
          case 'error':
            console.error('❌ SSE: Server error:', message);
            
            // Check if it's an auth error
            if (message.message?.includes('expired') || message.message?.includes('Authentication failed')) {
              console.error('🔐 SSE: Token expired - logging out');
              eventSource.close();
              setIsConnected(false);
              
              // Logout user
              setTimeout(() => {
                logout();
              }, 100);
              return;
            }
            
            setIsConnected(false);
            break;
            
          case 'new_post':
            console.log('📨 SSE: New post received:', message.data.id);
            callbacksRef.current.newPost.forEach(cb => cb(message.data));
            break;
            
          case 'post_updated':
            console.log('📝 SSE: Post updated:', message.data.id);
            callbacksRef.current.postUpdate.forEach(cb => cb(message.data));
            break;
            
          case 'post_deleted':
            console.log('🗑️ SSE: Post deleted:', message.data.postId);
            callbacksRef.current.postDelete.forEach(cb => cb(message.data.postId));
            break;
            
          default:
            console.warn('⚠️ SSE: Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('❌ SSE: Failed to parse message:', error);
        console.error('❌ SSE: Raw data:', event.data);
      }
    };

    // Handle errors
    eventSource.onerror = (error) => {
      console.error('❌ SSE: Connection error:', error);
      console.error('❌ SSE: ReadyState:', eventSource.readyState);
      setIsConnected(false);
      
      // Increment reconnect attempts
      reconnectAttemptsRef.current += 1;
      
      // If too many reconnect attempts, close connection
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.error('❌ SSE: Max reconnect attempts reached, closing connection');
        eventSource.close();
        return;
      }
      
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('🔄 SSE: Connection closed');
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        console.log('🔄 SSE: Reconnecting... (attempt', reconnectAttemptsRef.current, '/', maxReconnectAttempts, ')');
      }
    };

    // Cleanup
    return () => {
      console.log('🔌 SSE: Closing feed stream');
      eventSource.close();
      setIsConnected(false);
      reconnectAttemptsRef.current = 0;
    };
  }, [user?.token, logout]);

  const onNewPost = useCallback((callback: (post: Post) => void) => {
    callbacksRef.current.newPost.push(callback);
  }, []);

  const onPostUpdate = useCallback((callback: (post: Post) => void) => {
    callbacksRef.current.postUpdate.push(callback);
  }, []);

  const onPostDelete = useCallback((callback: (postId: string) => void) => {
    callbacksRef.current.postDelete.push(callback);
  }, []);

  return {
    isConnected,
    onNewPost,
    onPostUpdate,
    onPostDelete
  };
}
