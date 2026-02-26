-- Drop old Like table
DROP TABLE IF EXISTS "Like" CASCADE;

-- Update Post table
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "content" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "isDraft" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "likeCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "commentCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "shareCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;

-- Update Comment table
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "postId" TEXT;
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "content" TEXT NOT NULL DEFAULT '';

-- Create PostLike table
CREATE TABLE IF NOT EXISTS "PostLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- Create PostBookmark table
CREATE TABLE IF NOT EXISTS "PostBookmark" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostBookmark_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "PostLike_postId_userId_key" ON "PostLike"("postId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "PostBookmark_postId_userId_key" ON "PostBookmark"("postId", "userId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "Post_authorId_createdAt_idx" ON "Post"("authorId", "createdAt");
CREATE INDEX IF NOT EXISTS "Post_isDraft_idx" ON "Post"("isDraft");
CREATE INDEX IF NOT EXISTS "Post_publishedAt_idx" ON "Post"("publishedAt");
CREATE INDEX IF NOT EXISTS "Post_likeCount_idx" ON "Post"("likeCount");

CREATE INDEX IF NOT EXISTS "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");

CREATE INDEX IF NOT EXISTS "PostLike_userId_idx" ON "PostLike"("userId");
CREATE INDEX IF NOT EXISTS "PostLike_postId_idx" ON "PostLike"("postId");

CREATE INDEX IF NOT EXISTS "PostBookmark_userId_idx" ON "PostBookmark"("userId");
CREATE INDEX IF NOT EXISTS "PostBookmark_postId_idx" ON "PostBookmark"("postId");

-- Add foreign keys
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PostBookmark" ADD CONSTRAINT "PostBookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostBookmark" ADD CONSTRAINT "PostBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
