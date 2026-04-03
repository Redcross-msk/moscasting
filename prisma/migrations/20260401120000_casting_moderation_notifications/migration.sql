-- CreateEnum
CREATE TYPE "CastingCategory" AS ENUM ('MASS', 'GROUP', 'SOLO');

-- AlterTable
ALTER TABLE "MediaFile" ADD COLUMN "isAvatar" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Casting" ADD COLUMN "castingCategory" "CastingCategory",
ADD COLUMN "paymentRub" INTEGER,
ADD COLUMN "shootStartTime" TEXT,
ADD COLUMN "workHoursNote" TEXT,
ADD COLUMN "metroOrPlace" TEXT,
ADD COLUMN "roleRequirementsJson" JSONB,
ADD COLUMN "moderationComment" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- AlterTable
ALTER TABLE "ActorProfile" ADD COLUMN "moderationComment" TEXT;

-- AlterTable
ALTER TABLE "ProducerProfile" ADD COLUMN "moderationComment" TEXT;
