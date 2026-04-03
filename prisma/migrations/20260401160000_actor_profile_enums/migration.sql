-- CreateEnum
CREATE TYPE "EthnicAppearance" AS ENUM ('EUROPEAN', 'ASIAN', 'AFRO_AMERICAN', 'SLAVIC');

-- CreateEnum
CREATE TYPE "TattooPiercingOption" AS ENUM ('NONE', 'COVERED_AREAS', 'OPEN_AREAS');

-- CreateEnum
CREATE TYPE "FacialHairOption" AS ENUM ('BEARD_REFUSES_SHAVE', 'BEARD_CAN_SHAVE', 'NO_CAN_GROW', 'NO_REFUSES_GROW');

-- AlterTable
ALTER TABLE "ActorProfile" ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "professionalSkillKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "ethnicAppearance" "EthnicAppearance" NOT NULL DEFAULT 'EUROPEAN',
ADD COLUMN     "tattooPiercingOption" "TattooPiercingOption" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "facialHairOption" "FacialHairOption" NOT NULL DEFAULT 'NO_CAN_GROW';

UPDATE "ActorProfile" SET "tattooPiercingOption" = CASE
  WHEN "hasTattoos" = false AND "hasPiercing" = false THEN 'NONE'::"TattooPiercingOption"
  ELSE 'COVERED_AREAS'::"TattooPiercingOption"
END;

ALTER TABLE "ActorProfile" DROP COLUMN "appearanceDescription";
ALTER TABLE "ActorProfile" DROP COLUMN "hasTattoos";
ALTER TABLE "ActorProfile" DROP COLUMN "hasPiercing";
ALTER TABLE "ActorProfile" DROP COLUMN "professionalSummary";
