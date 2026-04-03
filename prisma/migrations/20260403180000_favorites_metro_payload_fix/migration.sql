-- Безопасно добавить payload, если миграция раньше не применилась
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "payload" JSONB;

ALTER TABLE "Casting" ADD COLUMN IF NOT EXISTS "metroStation" TEXT;
ALTER TABLE "Casting" ADD COLUMN IF NOT EXISTS "addressLine" TEXT;

UPDATE "Casting"
SET "addressLine" = "metroOrPlace"
WHERE "addressLine" IS NULL
  AND "metroOrPlace" IS NOT NULL
  AND TRIM("metroOrPlace") <> '';

CREATE TABLE "FavoriteActor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actorProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteActor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FavoriteActor_userId_actorProfileId_key" ON "FavoriteActor"("userId", "actorProfileId");
CREATE INDEX "FavoriteActor_userId_idx" ON "FavoriteActor"("userId");

ALTER TABLE "FavoriteActor" ADD CONSTRAINT "FavoriteActor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FavoriteActor" ADD CONSTRAINT "FavoriteActor_actorProfileId_fkey" FOREIGN KEY ("actorProfileId") REFERENCES "ActorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "FavoriteCasting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "castingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteCasting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FavoriteCasting_userId_castingId_key" ON "FavoriteCasting"("userId", "castingId");
CREATE INDEX "FavoriteCasting_userId_idx" ON "FavoriteCasting"("userId");

ALTER TABLE "FavoriteCasting" ADD CONSTRAINT "FavoriteCasting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FavoriteCasting" ADD CONSTRAINT "FavoriteCasting_castingId_fkey" FOREIGN KEY ("castingId") REFERENCES "Casting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
