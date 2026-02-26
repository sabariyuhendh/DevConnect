import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/config/api';

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

interface ConnectionRecommendation {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  title?: string;
  company?: string;
  mutualConnections: number;
  sharedInterests: number;
}

export function useFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [recommendations, setRecommendations] = useState<ConnectionRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch feed
  const fetchFeed = useCallback(async (filter: string = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest(`/api/posts/feed?filter=${filter}`, {
        method: 'GET'
      });
      setPosts(response.data || response);
    } catch (err: any) {
      console.error('❌ Failed to fetch feed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch connection recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await apiRequest('/api/posts/recommendations/connections', {
        method: 'GET'
      });
      setRecommendations(response.data || response);
    } catch (err: any) {
      console.error('❌ Failed to fetch recommendations:', err);
    }
  }, []);

  // Create post
  const createPost = useCallback(async (content: string, mediaUrls: string[] = [], tags: string[] = [], isDraft: boolean = false) => {
    try {
      const response = await apiRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          content,
          mediaUrls,
          tags,
          isDraft
        })
      });
      
      const post = response.data || response;
      
      if (!isDraft) {
        setPosts(prev => [post, ...prev]);
      }
      
      return post;
    } catch (err: any) {
      console.error('❌ Failed to create post:', err);
      throw err;
    }
  }, []);

  // Update post
  const updatePost = useCallback(async (id: string, content: string, mediaUrls: string[] = [], tags: string[] = [], isDraft: boolean = false) => {
    try {
      const response = await apiRequest(`/api/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          content,
          mediaUrls,
          tags,
          isDraft
        })
      });
      
      const post = response.data || response;
      setPosts(prev => prev.map(p => p.id === id ? post : p));
      return post;
    } catch (err: any) {
      console.error('❌ Failed to update post:', err);
      throw err;
    }
  }, []);

  // Delete post
  const deletePost = useCallback(async (id: string) => {
    try {
      await apiRequest(`/api/posts/${id}`, {
        method: 'DELETE'
      });
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('❌ Failed to delete post:', err);
      throw err;
    }
  }, []);

  // Like/unlike post
  const toggleLike = useCallback(async (id: string) => {
    try {
      const response = await apiRequest(`/api/posts/${id}/like`, {
        method: 'POST'
      });
      
      const result = response.data || response;
      
      setPosts(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            isLiked: result.liked,
            likeCount: result.liked ? p.likeCount + 1 : p.likeCount - 1
          };
        }
        return p;
      }));
    } catch (err: any) {
      console.error('❌ Failed to toggle like:', err);
      throw err;
    }
  }, []);

  // Bookmark/unbookmark post
  const toggleBookmark = useCallback(async (id: string) => {
    try {
      const response = await apiRequest(`/api/posts/${id}/bookmark`, {
        method: 'POST'
      });
      
      const result = response.data || response;
      
      setPosts(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            isBookmarked: result.bookmarked
          };
        }
        return p;
      }));
    } catch (err: any) {
      console.error('❌ Failed to toggle bookmark:', err);
      throw err;
    }
  }, []);

  // Add new post from socket
  const addPost = useCallback((post: Post) => {
    setPosts(prev => {
      // Check if post already exists
      if (prev.some(p => p.id === post.id)) {
        return prev;
      }
      return [post, ...prev];
    });
  }, []);

  // Update post from socket
  const updatePostFromSocket = useCallback((post: Post) => {
    setPosts(prev => prev.map(p => p.id === post.id ? post : p));
  }, []);

  // Remove post from socket
  const removePost = useCallback((postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }, []);

  return {
    posts,
    recommendations,
    loading,
    error,
    fetchFeed,
    fetchRecommendations,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    toggleBookmark,
    addPost,
    updatePostFromSocket,
    removePost
  };
}
