import { Request, Response } from 'express';
import prisma from '../../prisma/client';
import { successResponse } from '../utils/apiResponse';
import { AppError } from '../utils/errors';
import { broadcastNewPost, broadcastPostUpdate, broadcastPostDelete } from './feedSSEController';

// Feed Algorithm: Score = (recency * 0.3) + (engagement * 0.5) + (connection * 0.2)
const calculateFeedScore = (post: any, userId: string, followingIds: string[]): number => {
  // Recency score (0-100): newer posts score higher
  const ageInHours = (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 100 - (ageInHours * 2)); // Decay over 50 hours
  
  // Engagement score (0-100): based on likes, comments, shares
  const engagementScore = Math.min(100, 
    (post.likeCount * 1) + 
    (post.commentCount * 3) + 
    (post.shareCount * 5)
  );
  
  // Connection score (0-100): higher if from followed users
  const connectionScore = followingIds.includes(post.authorId) ? 100 : 0;
  
  return (recencyScore * 0.3) + (engagementScore * 0.5) + (connectionScore * 0.2);
};

// Create post (draft or published)
export const createPost = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { content, mediaUrls, tags, isDraft } = req.body;

  if (!content || content.trim().length === 0) {
    throw new AppError('Post content is required', 400);
  }

  const post = await prisma.post.create({
    data: {
      authorId: userId,
      content: content.trim(),
      mediaUrls: mediaUrls || [],
      tags: tags || [],
      isDraft: isDraft || false,
      publishedAt: isDraft ? null : new Date()
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePicture: true
        }
      }
    }
  });

  // Broadcast to followers if published
  if (!isDraft) {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      select: { followerId: true }
    });
    const followerIds = followers.map(f => f.followerId);
    
    // Use SSE broadcast (more efficient than WebSocket for one-way push)
    await broadcastNewPost(post, followerIds);
  }

  successResponse(res, post, 201, isDraft ? 'Draft saved' : 'Post published');
};

// Update post
export const updatePost = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { content, mediaUrls, tags, isDraft } = req.body;

  const existingPost = await prisma.post.findUnique({
    where: { id }
  });

  if (!existingPost) {
    throw new AppError('Post not found', 404);
  }

  if (existingPost.authorId !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      content: content?.trim(),
      mediaUrls,
      tags,
      isDraft,
      publishedAt: isDraft === false && !existingPost.publishedAt ? new Date() : existingPost.publishedAt
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePicture: true
        }
      }
    }
  });

  // Broadcast update if published
  if (!post.isDraft) {
    broadcastPostUpdate(post);
  }

  successResponse(res, post, 200, 'Post updated');
};

// Publish draft
export const publishDraft = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const existingPost = await prisma.post.findUnique({
    where: { id }
  });

  if (!existingPost) {
    throw new AppError('Post not found', 404);
  }

  if (existingPost.authorId !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  if (!existingPost.isDraft) {
    throw new AppError('Post is already published', 400);
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      isDraft: false,
      publishedAt: new Date()
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePicture: true
        }
      }
    }
  });

  successResponse(res, post, 200, 'Post published');
};

// Get feed with algorithm
export const getFeed = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 10, filter = 'all' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  // Get user's following list
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  const followingIds = following.map(f => f.followingId);

  // Build query based on filter
  let whereClause: any = {
    isDraft: false,
    publishedAt: { not: null }
  };

  if (filter === 'following') {
    whereClause.authorId = { in: followingIds };
  }

  // Fetch posts
  const posts = await prisma.post.findMany({
    where: whereClause,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePicture: true
        }
      },
      likes: {
        where: { userId },
        select: { id: true }
      },
      bookmarks: {
        where: { userId },
        select: { id: true }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    },
    orderBy: { publishedAt: 'desc' },
    take: Number(limit) * 3, // Fetch more for scoring
    skip
  });

  // Calculate scores and sort
  const scoredPosts = posts.map(post => ({
    ...post,
    score: calculateFeedScore(post, userId, followingIds),
    isLiked: post.likes.length > 0,
    isBookmarked: post.bookmarks.length > 0,
    likeCount: post._count.likes,
    commentCount: post._count.comments
  }));

  scoredPosts.sort((a, b) => b.score - a.score);
  const finalPosts = scoredPosts.slice(0, Number(limit));

  // Remove internal fields
  const cleanPosts = finalPosts.map(({ likes, bookmarks, _count, score, ...post }) => post);

  successResponse(res, cleanPosts, 200, 'Feed fetched');
};

// Get user's drafts
export const getDrafts = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const drafts = await prisma.post.findMany({
    where: {
      authorId: userId,
      isDraft: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  successResponse(res, drafts, 200, 'Drafts fetched');
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id }
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.authorId !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  await prisma.post.delete({
    where: { id }
  });

  // Broadcast deletion via SSE
  broadcastPostDelete(id);

  successResponse(res, null, 200, 'Post deleted');
};

// Like post
export const likePost = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id }
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const existingLike = await prisma.postLike.findUnique({
    where: {
      postId_userId: {
        postId: id,
        userId
      }
    }
  });

  if (existingLike) {
    // Unlike
    await prisma.postLike.delete({
      where: { id: existingLike.id }
    });
    await prisma.post.update({
      where: { id },
      data: { likeCount: { decrement: 1 } }
    });
    successResponse(res, { liked: false }, 200, 'Post unliked');
  } else {
    // Like
    await prisma.postLike.create({
      data: {
        postId: id,
        userId
      }
    });
    await prisma.post.update({
      where: { id },
      data: { likeCount: { increment: 1 } }
    });
    successResponse(res, { liked: true }, 200, 'Post liked');
  }
};

// Bookmark post
export const bookmarkPost = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id }
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const existingBookmark = await prisma.postBookmark.findUnique({
    where: {
      postId_userId: {
        postId: id,
        userId
      }
    }
  });

  if (existingBookmark) {
    await prisma.postBookmark.delete({
      where: { id: existingBookmark.id }
    });
    successResponse(res, { bookmarked: false }, 200, 'Bookmark removed');
  } else {
    await prisma.postBookmark.create({
      data: {
        postId: id,
        userId
      }
    });
    successResponse(res, { bookmarked: true }, 200, 'Post bookmarked');
  }
};

// Get connection recommendations
export const getConnectionRecommendations = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { limit = 5 } = req.query;

  // Get user's connections
  const userConnections = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  const followingIds = userConnections.map(f => f.followingId);

  // Get user's skills/interests
  const userSkills = await prisma.userSkill.findMany({
    where: { userId },
    select: { skillName: true }
  });
  const userSkillNames = userSkills.map(s => s.skillName.toLowerCase());

  // Find users with mutual connections
  const mutualConnectionUsers = await prisma.follow.findMany({
    where: {
      followerId: { in: followingIds },
      followingId: { notIn: [...followingIds, userId] }
    },
    select: {
      followingId: true,
      following: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          bio: true,
          title: true,
          company: true
        }
      }
    },
    take: 50
  });

  // Count mutual connections and calculate scores
  const userScores = new Map<string, { user: any; mutualCount: number; sharedSkills: number }>();

  for (const connection of mutualConnectionUsers) {
    const targetUserId = connection.followingId;
    
    if (!userScores.has(targetUserId)) {
      // Get shared skills
      const targetSkills = await prisma.userSkill.findMany({
        where: { userId: targetUserId },
        select: { skillName: true }
      });
      const sharedSkills = targetSkills.filter(s => 
        userSkillNames.includes(s.skillName.toLowerCase())
      ).length;

      userScores.set(targetUserId, {
        user: connection.following,
        mutualCount: 1,
        sharedSkills
      });
    } else {
      const existing = userScores.get(targetUserId)!;
      existing.mutualCount += 1;
    }
  }

  // Calculate recommendation scores: (mutualCount * 10) + (sharedSkills * 5)
  const recommendations = Array.from(userScores.values())
    .map(({ user, mutualCount, sharedSkills }) => ({
      ...user,
      mutualConnections: mutualCount,
      sharedInterests: sharedSkills,
      score: (mutualCount * 10) + (sharedSkills * 5)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(limit));

  successResponse(res, recommendations, 200, 'Recommendations fetched');
};

export {};
