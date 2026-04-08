-- CreateEnum
CREATE TYPE "CastingPaymentPeriod" AS ENUM ('HOUR', 'SHIFT', 'DAY', 'PROJECT');

-- AlterTable
ALTER TABLE "Casting" ADD COLUMN "paymentPeriod" "CastingPaymentPeriod",
ADD COLUMN "shootDatesJson" JSONB;
