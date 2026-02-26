import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
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

interface FeedSocketHook {
  isConnected: boolean;
  onNewPost: (callback: (post: Post) => void) => void;
  onPostUpdate: (callback: (post: Post) => void) => void;
  onPostDelete: (callback: (postId: string) => void) => void;
}

export function useFeedSocket(): FeedSocketHook {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
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
      console.log('⏭️ No user token - skipping feed socket connection');
      return;
    }

    // Connect to Feed namespace
    const socket = io(`${API_BASE}/feed`, {
      auth: {
        token: user.token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Feed socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Feed socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Feed connection error:', error.message);
      setIsConnected(false);
    });

    // Feed events
    socket.on('new_post', (post: Post) => {
      console.log('📨 New post received:', post.id);
      callbacksRef.current.newPost.forEach(cb => cb(post));
    });

    socket.on('post_updated', (post: Post) => {
      console.log('📝 Post updated:', post.id);
      callbacksRef.current.postUpdate.forEach(cb => cb(post));
    });

    socket.on('post_deleted', (data: { postId: string }) => {
      console.log('🗑️ Post deleted:', data.postId);
      callbacksRef.current.postDelete.forEach(cb => cb(data.postId));
    });

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting feed socket');
      socket.disconnect();
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
