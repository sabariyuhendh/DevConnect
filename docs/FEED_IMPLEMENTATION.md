# Feed Implementation Guide

## Overview
Complete implementation of the Feed page with real-time updates, draft/publish functionality, intelligent feed ranking algorithm, and connection recommendations.

## Features Implemented

### 1. Post Management
- **Create Posts**: Users can create posts with content, media URLs, and tags
- **Draft System**: Save posts as drafts before publishing
- **Publish**: Convert drafts to published posts
- **Update/Delete**: Full CRUD operations on posts
- **Like/Unlike**: Toggle likes on posts with real-time count updates
- **Bookmark**: Save posts for later viewing

### 2. Real-Time Updates (Socket.IO)
- **Live Feed**: New posts appear instantly without refresh
- **Post Updates**: Changes to posts broadcast to all viewers
- **Post Deletions**: Removed posts disappear from all feeds
- **Connection Status**: Visual indicator showing real-time connection status
- **Namespace**: Dedicated `/feed` namespace for feed-specific events

### 3. Feed Ranking Algorithm
Posts are scored and ranked using a weighted algorithm:

```
Score = (Recency × 0.3) + (Engagement × 0.5) + (Connection × 0.2)
```

**Components:**
- **Recency Score (0-100)**: Newer posts score higher, decays over 50 hours
- **Engagement Score (0-100)**: Based on likes (×1), comments (×3), shares (×5)
- **Connection Score (0-100)**: 100 if from followed user, 0 otherwise

**Why this works:**
- Balances fresh content with popular content
- Prioritizes meaningful engagement (comments > likes)
- Surfaces content from connections while allowing discovery
- Based on research from Instagram, Twitter, and Facebook algorithms

### 4. Connection Recommendations
Intelligent algorithm to suggest new connections:

```
Recommendation Score = (Mutual Connections × 10) + (Shared Interests × 5)
```

**Factors:**
- **Mutual Connections**: Users with 5+ mutual friends are highly recommended
- **Shared Interests**: Based on matching skills/tags in user profiles
- **Activity Patterns**: Users active in similar areas

**Why this works:**
- Mutual connections indicate shared social circles (80% of friend suggestions)
- Shared interests increase connection quality
- Based on Facebook and LinkedIn recommendation systems

## Architecture

### Backend Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── postController.ts       # Post CRUD + feed logic
│   ├── routes/
│   │   └── postRoutes.ts           # API endpoints
│   └── websocket/
│       └── feedSocket.ts           # Real-time feed updates
└── prisma/
    └── schema.prisma               # Updated Post, PostLike, PostBookmark models
```

### Frontend Structure

```
frontend/
├── src/
│   ├── hooks/
│   │   ├── useFeed.ts              # Feed API operations
│   │   └── useFeedSocket.ts        # Real-time socket connection
│   └── pages/
│       └── Feed.tsx                # Main feed UI
```

## API Endpoints

### Post Management
- `POST /api/posts` - Create post (draft or published)
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/publish` - Publish draft

### Feed
- `GET /api/posts/feed?filter=all|following` - Get ranked feed
- `GET /api/posts/drafts` - Get user's drafts

### Interactions
- `POST /api/posts/:id/like` - Toggle like
- `POST /api/posts/:id/bookmark` - Toggle bookmark

### Recommendations
- `GET /api/posts/recommendations/connections` - Get connection suggestions

## WebSocket Events

### Client → Server
- `connect` - Establish connection with auth token

### Server → Client
- `new_post` - New post published by followed user
- `post_updated` - Post content/metadata changed
- `post_deleted` - Post removed

## Database Schema

### Post Model
```prisma
model Post {
  id           String      @id @default(cuid())
  authorId     String
  content      String
  mediaUrls    String[]
  tags         String[]
  isDraft      Boolean     @default(false)
  publishedAt  DateTime?
  likeCount    Int         @default(0)
  commentCount Int         @default(0)
  shareCount   Int         @default(0)
  viewCount    Int         @default(0)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  author       User        @relation(...)
  comments     Comment[]
  likes        PostLike[]
  bookmarks    PostBookmark[]
}
```

### PostLike Model
```prisma
model PostLike {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())
  post      Post     @relation(...)
  user      User     @relation(...)
  
  @@unique([postId, userId])
}
```

### PostBookmark Model
```prisma
model PostBookmark {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())
  post      Post     @relation(...)
  user      User     @relation(...)
  
  @@unique([postId, userId])
}
```

## Usage Examples

### Creating a Post
```typescript
// Draft
await createPost("My post content", [], ["tech", "coding"], true);

// Published
await createPost("My post content", [], ["tech", "coding"], false);
```

### Real-Time Updates
```typescript
const { onNewPost, onPostUpdate, onPostDelete } = useFeedSocket();

useEffect(() => {
  onNewPost((post) => {
    // Handle new post
    addPost(post);
  });
  
  onPostUpdate((post) => {
    // Handle post update
    updatePostFromSocket(post);
  });
  
  onPostDelete((postId) => {
    // Handle post deletion
    removePost(postId);
  });
}, []);
```

### Fetching Feed
```typescript
// All posts (ranked by algorithm)
await fetchFeed('all');

// Only from followed users
await fetchFeed('following');
```

## Performance Optimizations

1. **Efficient Queries**: Indexes on `publishedAt`, `likeCount`, `authorId`
2. **Pagination**: Fetch 10 posts at a time, load more on scroll
3. **Socket Rooms**: Users only receive updates for their feed
4. **Caching**: Consider Redis for feed caching in production
5. **Lazy Loading**: Images and media loaded on demand

## Testing Checklist

- [ ] Create post as draft
- [ ] Publish draft
- [ ] Create post directly as published
- [ ] Like/unlike post
- [ ] Bookmark/unbookmark post
- [ ] Delete post
- [ ] Real-time: New post appears instantly
- [ ] Real-time: Post update reflects immediately
- [ ] Real-time: Deleted post disappears
- [ ] Feed ranking: Recent posts appear higher
- [ ] Feed ranking: Popular posts appear higher
- [ ] Feed ranking: Followed users' posts prioritized
- [ ] Connection recommendations show mutual friends
- [ ] Connection recommendations show shared interests
- [ ] Filter: All posts
- [ ] Filter: Following only

## Future Enhancements

1. **Infinite Scroll**: Load more posts automatically
2. **Media Upload**: Direct image/video upload
3. **Comments**: Full comment system with threading
4. **Shares**: Share posts to other platforms
5. **Notifications**: Push notifications for likes/comments
6. **Analytics**: Track post performance
7. **Trending**: Identify trending topics/hashtags
8. **Search**: Full-text search across posts
9. **Moderation**: Report/flag inappropriate content
10. **Personalization**: ML-based feed ranking

## References

Content was rephrased for compliance with licensing restrictions:

- [Socket.IO Real-Time Implementation](https://knock.app/blog/building-a-github-activity-feed-with-nodejs-and-socket-io)
- [Social Media Feed Algorithms](https://www.marketingscoop.com/marketing/how-do-people-really-want-their-social-media-feeds-ordered-in-2024/)
- [Connection Recommendation Systems](https://www.marketingscoop.com/small-business/how-does-facebook-suggest-friends/)
- [Instagram Algorithm Analysis](https://sproutsocial.com/insights/instagram-algorithm/)

## Troubleshooting

### Posts not appearing in real-time
- Check WebSocket connection status indicator
- Verify user is authenticated
- Check browser console for socket errors
- Ensure backend Socket.IO server is running

### Feed ranking seems off
- Verify `publishedAt` is set correctly
- Check engagement counts are updating
- Ensure user's following list is populated

### Connection recommendations empty
- User needs to have connections first
- Other users need to have skills/interests set
- Check mutual connections exist

## Support

For issues or questions, refer to:
- Backend logs: Check server console for errors
- Frontend logs: Check browser console
- Database: Verify schema with `npx prisma studio`
