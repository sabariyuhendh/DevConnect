import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/config/api';

export interface ProfileUser {
  id: string;
  username: string;
  email?: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  twitter?: string | null;
  phone?: string | null;
  profilePicture: string | null;
  coverPicture: string | null;
  isOnline: boolean;
  lastSeen: Date | null;
  profileViews: number;
  createdAt: string;
  provider: string | null;
  isVerified?: boolean;
  skills?: string[];
  isFollowing?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface ProfileData {
  user: ProfileUser;
}

export const useProfile = (username?: string) => {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!username) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<ProfileData>(`/api/profile/${username}`, {
        method: 'GET'
      });

      setProfile(response.user);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const followUser = async () => {
    if (!username) return;

    try {
      await apiRequest(`/api/profile/${username}/follow`, {
        method: 'POST'
      });

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        isFollowing: true,
        followersCount: prev.followersCount + 1
      } : null);
    } catch (err: any) {
      console.error('Failed to follow user:', err);
      throw err;
    }
  };

  const unfollowUser = async () => {
    if (!username) return;

    try {
      await apiRequest(`/api/profile/${username}/follow`, {
        method: 'DELETE'
      });

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        isFollowing: false,
        followersCount: Math.max(0, prev.followersCount - 1)
      } : null);
    } catch (err: any) {
      console.error('Failed to unfollow user:', err);
      throw err;
    }
  };

  const toggleFollow = async () => {
    if (!profile) return;

    if (profile.isFollowing) {
      await unfollowUser();
    } else {
      await followUser();
    }
  };

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    followUser,
    unfollowUser,
    toggleFollow
  };
};

// Hook for current user's profile
export const useMyProfile = () => {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<ProfileData>('/api/profile/me', {
        method: 'GET'
      });

      setProfile(response.user);
    } catch (err: any) {
      console.error('Failed to fetch my profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  const updateProfile = async (data: Partial<ProfileUser>) => {
    try {
      const response = await apiRequest<ProfileData>('/api/profile/me', {
        method: 'PUT',
        body: data
      });

      setProfile(response.user);
      return response.user;
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    refetch: fetchMyProfile,
    updateProfile
  };
};
