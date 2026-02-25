import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/errors';

// Get user profile by username
export const getProfile = async (req: Request, res: Response) => {
  const { username } = req.params;
  const currentUserId = (req as any).user?.id;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Invalid username' });
  }

  try {
    // Single optimized query with all data
    const [user, userSkills, isFollowingRecord] = await Promise.all([
      prisma.user.findUnique({
        where: { username: username as string },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          bio: true,
          title: true,
          company: true,
          location: true,
          website: true,
          github: true,
          linkedin: true,
          profilePicture: true,
          coverPicture: true,
          isOnline: true,
          lastSeen: true,
          profileViews: true,
          createdAt: true,
          provider: true,
          _count: {
            select: {
              followers: true,
              following: true,
              posts: true
            }
          }
        }
      }),
      // Fetch skills in parallel
      prisma.userSkill.findMany({
        where: { 
          User: { username: username as string }
        },
        select: { skillName: true },
        take: 20 // Limit to 20 skills
      }),
      // Check follow status in parallel (only if authenticated)
      currentUserId ? prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: username as string // This will be replaced after we get user.id
          }
        },
        select: { id: true }
      }).catch(() => null) : Promise.resolve(null)
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check follow status with correct user ID
    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id
          }
        }
      });
      isFollowing = !!follow;

      // Increment profile views asynchronously (don't wait)
      prisma.user.update({
        where: { id: user.id },
        data: { profileViews: { increment: 1 } }
      }).catch(err => console.error('Failed to increment views:', err));
    }

    res.json({
      user: {
        ...user,
        skills: userSkills.map(s => s.skillName),
        isFollowing,
        followersCount: (user as any)._count.followers,
        followingCount: (user as any)._count.following,
        postsCount: (user as any)._count.posts
      }
    });
  } catch (error) {
    console.error('[Profile Error]', error);
    res.status(500).json({
      message: 'Error fetching profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get current user's full profile
export const getMyProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        title: true,
        company: true,
        location: true,
        website: true,
        github: true,
        linkedin: true,
        twitter: true,
        phone: true,
        profilePicture: true,
        coverPicture: true,
        skills: true,
        yearsOfExp: true,
        availability: true,
        timezone: true,
        locale: true,
        isOnline: true,
        lastSeen: true,
        profileViews: true,
        preferences: true,
        emailVerified: true,
        isVerified: true,
        createdAt: true,
        provider: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        ...user,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        postsCount: user._count.posts
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const {
    firstName,
    lastName,
    bio,
    title,
    company,
    location,
    website,
    github,
    linkedin,
    twitter,
    phone,
    skills,
    yearsOfExp,
    availability,
    timezone,
    locale
  } = req.body;

  try {
    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (title !== undefined) updateData.title = title;
    if (company !== undefined) updateData.company = company;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (github !== undefined) updateData.github = github;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (twitter !== undefined) updateData.twitter = twitter;
    if (phone !== undefined) updateData.phone = phone;
    if (skills !== undefined) updateData.skills = skills;
    if (yearsOfExp !== undefined) updateData.yearsOfExp = yearsOfExp;
    if (availability !== undefined) updateData.availability = availability;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (locale !== undefined) updateData.locale = locale;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        title: true,
        company: true,
        location: true,
        website: true,
        github: true,
        linkedin: true,
        twitter: true,
        phone: true,
        profilePicture: true,
        coverPicture: true,
        skills: true,
        yearsOfExp: true,
        availability: true,
        timezone: true,
        locale: true,
        createdAt: true
      }
    });

    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update profile picture
export const updateProfilePicture = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { profilePicture } = req.body;

  if (!profilePicture) {
    return res.status(400).json({ message: 'Profile picture URL is required' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture },
      select: { id: true, profilePicture: true }
    });

    res.json({ user, message: 'Profile picture updated successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating profile picture',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update cover picture
export const updateCoverPicture = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { coverPicture } = req.body;

  if (!coverPicture) {
    return res.status(400).json({ message: 'Cover picture URL is required' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { coverPicture },
      select: { id: true, coverPicture: true }
    });

    res.json({ user, message: 'Cover picture updated successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating cover picture',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update user preferences
export const updatePreferences = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { preferences } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { preferences },
      select: { id: true, preferences: true }
    });

    res.json({ preferences: user.preferences, message: 'Preferences updated successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating preferences',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Follow user
export const followUser = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { username } = req.params;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Invalid username' });
  }

  try {
    const userToFollow = await prisma.user.findUnique({
      where: { username: username as string },
      select: { id: true }
    });

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow.id === userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: userToFollow.id
        }
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    await prisma.follow.create({
      data: {
        followerId: userId,
        followingId: userToFollow.id
      }
    });

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error following user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Unfollow user
export const unfollowUser = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { username } = req.params;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Invalid username' });
  }

  try {
    const userToUnfollow = await prisma.user.findUnique({
      where: { username: username as string },
      select: { id: true }
    });

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: userToUnfollow.id
        }
      }
    });

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error unfollowing user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user's followers
export const getFollowers = async (req: Request, res: Response) => {
  const { username } = req.params;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Invalid username' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username as string },
      select: { id: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            title: true,
            isOnline: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ followers: followers.map(f => f.follower) });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching followers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user's following
export const getFollowing = async (req: Request, res: Response) => {
  const { username } = req.params;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Invalid username' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username as string },
      select: { id: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            title: true,
            isOnline: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ following: following.map(f => f.following) });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching following',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Search users
export const searchUsers = async (req: Request, res: Response) => {
  const { q, limit = 20 } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
          { company: { contains: q, mode: 'insensitive' } }
        ],
        isActive: true
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        title: true,
        company: true,
        location: true,
        isOnline: true
      },
      take: Number(limit),
      orderBy: { profileViews: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({
      message: 'Error searching users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
