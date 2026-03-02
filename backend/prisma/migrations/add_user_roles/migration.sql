-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'COMPANY_HR', 'EVENT_HOST', 'ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
