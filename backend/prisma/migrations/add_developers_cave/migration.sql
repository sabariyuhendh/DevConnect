-- CreateEnum
CREATE TYPE "FocusMode" AS ENUM ('POMODORO', 'SHORT_BREAK', 'LONG_BREAK');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "CaveFocusSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "mode" "FocusMode" NOT NULL DEFAULT 'POMODORO',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CaveFocusSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaveTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaveTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaveChatRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaveChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaveRoomMember" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3),

    CONSTRAINT "CaveRoomMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaveChatMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaveChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaveNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaveNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaveTrendArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "summary" TEXT,
    "source" TEXT,
    "tags" TEXT[],
    "imageUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "bookmarkCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaveTrendArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaveArticleBookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaveArticleBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaveReputation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'Explorer',
    "focusStreak" INTEGER NOT NULL DEFAULT 0,
    "lastFocusDate" TIMESTAMP(3),
    "badges" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaveReputation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaveFocusSession_userId_startedAt_idx" ON "CaveFocusSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "CaveFocusSession_completed_idx" ON "CaveFocusSession"("completed");

-- CreateIndex
CREATE INDEX "CaveTask_userId_status_idx" ON "CaveTask"("userId", "status");

-- CreateIndex
CREATE INDEX "CaveTask_userId_createdAt_idx" ON "CaveTask"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CaveTask_dueDate_idx" ON "CaveTask"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "CaveChatRoom_name_key" ON "CaveChatRoom"("name");

-- CreateIndex
CREATE INDEX "CaveChatRoom_name_idx" ON "CaveChatRoom"("name");

-- CreateIndex
CREATE INDEX "CaveChatRoom_createdById_idx" ON "CaveChatRoom"("createdById");

-- CreateIndex
CREATE INDEX "CaveRoomMember_userId_idx" ON "CaveRoomMember"("userId");

-- CreateIndex
CREATE INDEX "CaveRoomMember_roomId_idx" ON "CaveRoomMember"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "CaveRoomMember_roomId_userId_key" ON "CaveRoomMember"("roomId", "userId");

-- CreateIndex
CREATE INDEX "CaveChatMessage_roomId_createdAt_idx" ON "CaveChatMessage"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "CaveChatMessage_userId_idx" ON "CaveChatMessage"("userId");

-- CreateIndex
CREATE INDEX "CaveNote_userId_updatedAt_idx" ON "CaveNote"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CaveTrendArticle_url_key" ON "CaveTrendArticle"("url");

-- CreateIndex
CREATE INDEX "CaveTrendArticle_publishedAt_idx" ON "CaveTrendArticle"("publishedAt");

-- CreateIndex
CREATE INDEX "CaveTrendArticle_readCount_idx" ON "CaveTrendArticle"("readCount");

-- CreateIndex
CREATE INDEX "CaveTrendArticle_bookmarkCount_idx" ON "CaveTrendArticle"("bookmarkCount");

-- CreateIndex
CREATE INDEX "CaveArticleBookmark_userId_idx" ON "CaveArticleBookmark"("userId");

-- CreateIndex
CREATE INDEX "CaveArticleBookmark_articleId_idx" ON "CaveArticleBookmark"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "CaveArticleBookmark_userId_articleId_key" ON "CaveArticleBookmark"("userId", "articleId");

-- CreateIndex
CREATE UNIQUE INDEX "CaveReputation_userId_key" ON "CaveReputation"("userId");

-- CreateIndex
CREATE INDEX "CaveReputation_points_idx" ON "CaveReputation"("points");

-- CreateIndex
CREATE INDEX "CaveReputation_level_idx" ON "CaveReputation"("level");

-- AddForeignKey
ALTER TABLE "CaveFocusSession" ADD CONSTRAINT "CaveFocusSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaveTask" ADD CONSTRAINT "CaveTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaveChatRoom" ADD CONSTRAINT "CaveChatRoom_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaveRoomMember" ADD CONSTRAINT "CaveRoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CaveChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaveRoomMember" ADD CONSTRAINT "CaveRoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaveChatMessage" ADD CONSTRAINT "CaveChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CaveChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaveChatMessage" ADD CONSTRAINT "CaveChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaveNote" ADD CONSTRAINT "CaveNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaveArticleBookmark" ADD CONSTRAINT "CaveArticleBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaveArticleBookmark" ADD CONSTRAINT "CaveArticleBookmark_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "CaveTrendArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaveReputation" ADD CONSTRAINT "CaveReputation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default chat rooms
INSERT INTO "CaveChatRoom" (id, name, description, "createdById", "isDefault", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    room_name,
    room_desc,
    (SELECT id FROM "User" LIMIT 1),
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (VALUES 
    ('#frontend-devs', 'Frontend development discussions'),
    ('#backend', 'Backend and API development'),
    ('#ai-ml', 'AI and Machine Learning topics'),
    ('#system-design', 'System architecture and design patterns')
) AS rooms(room_name, room_desc)
WHERE EXISTS (SELECT 1 FROM "User" LIMIT 1);
