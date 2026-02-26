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
  type: 'connected' | 'new_post' | 'post_updated' | 'post_deleted';
  data?: any;
  userId?: string;
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
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
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

    // Create EventSource with auth token in query parameter
    // Note: EventSource doesn't support custom headers, so we pass token via URL
    const url = `${API_BASE}/api/posts/feed/stream?token=${encodeURIComponent(user.token)}`;
    const eventSource = new EventSource(url);

    eventSourceRef.current = eventSource;

    // Connection opened
    eventSource.onopen = () => {
      console.log('✅ SSE: Feed stream connected');
      setIsConnected(true);
    };

    // Handle messages
    eventSource.onmessage = (event) => {
      try {
        const message: SSEMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'connected':
            console.log('✅ SSE: Connection confirmed for user', message.userId);
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
        }
      } catch (error) {
        console.error('❌ SSE: Failed to parse message:', error);
      }
    };

    // Handle errors
    eventSource.onerror = (error) => {
      console.error('❌ SSE: Connection error:', error);
      setIsConnected(false);
      
      // EventSource automatically reconnects, but we can add custom logic here
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('🔄 SSE: Connection closed, will retry...');
      }
    };

    // Cleanup
    return () => {
      console.log('🔌 SSE: Closing feed stream');
      eventSource.close();
      setIsConnected(false);
    };
  }, [user?.token]);

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
