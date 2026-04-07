-- CreateEnum
CREATE TYPE "CourseSlotType" AS ENUM ('EIGHT_HOURS', 'SIXTEEN_HOURS');

-- CreateEnum
CREATE TYPE "ServiceLeadStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "CourseSlot" (
    "id" TEXT NOT NULL,
    "type" "CourseSlotType" NOT NULL,
    "startDay" DATE NOT NULL,
    "secondDay" DATE,
    "maxParticipants" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" DATE NOT NULL,
    "experience" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "courseType" "CourseSlotType" NOT NULL,
    "slotId" TEXT NOT NULL,
    "status" "ServiceLeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioShootDay" (
    "id" TEXT NOT NULL,
    "shootDate" DATE NOT NULL,
    "maxBookings" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioShootDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" DATE NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "status" "ServiceLeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CourseSlot_isActive_type_idx" ON "CourseSlot"("isActive", "type");
CREATE INDEX "CourseSlot_startDay_idx" ON "CourseSlot"("startDay");
CREATE INDEX "CourseApplication_slotId_idx" ON "CourseApplication"("slotId");
CREATE INDEX "CourseApplication_createdAt_idx" ON "CourseApplication"("createdAt");
CREATE UNIQUE INDEX "PortfolioShootDay_shootDate_key" ON "PortfolioShootDay"("shootDate");
CREATE INDEX "PortfolioShootDay_isActive_idx" ON "PortfolioShootDay"("isActive");
CREATE INDEX "PortfolioApplication_slotId_idx" ON "PortfolioApplication"("slotId");
CREATE INDEX "PortfolioApplication_createdAt_idx" ON "PortfolioApplication"("createdAt");

ALTER TABLE "CourseApplication" ADD CONSTRAINT "CourseApplication_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "CourseSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PortfolioApplication" ADD CONSTRAINT "PortfolioApplication_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "PortfolioShootDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
