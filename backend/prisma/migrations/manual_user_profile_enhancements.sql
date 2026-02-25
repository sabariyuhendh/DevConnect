-- Manual Migration: User Profile Enhancements
-- This migration adds enhanced profile fields to the User model

-- Add new columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "providerId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twitter" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "yearsOfExp" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "availability" TEXT;

-- Update existing columns
ALTER TABLE "User" ALTER COLUMN "provider" SET DEFAULT 'local';
ALTER TABLE "User" ALTER COLUMN "bio" TYPE TEXT;

-- Add index for OAuth lookups
CREATE INDEX IF NOT EXISTS "User_provider_providerId_idx" ON "User"("provider", "providerId");

-- Update existing users to have default provider
UPDATE "User" SET "provider" = 'local' WHERE "provider" IS NULL;
