-- CreateTable
CREATE TABLE "HomepageFeaturedCasting" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "castingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageFeaturedCasting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageFeaturedActor" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "actorProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageFeaturedActor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomepageFeaturedCasting_position_key" ON "HomepageFeaturedCasting"("position");

-- CreateIndex
CREATE INDEX "HomepageFeaturedCasting_castingId_idx" ON "HomepageFeaturedCasting"("castingId");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageFeaturedCasting_castingId_key" ON "HomepageFeaturedCasting"("castingId");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageFeaturedActor_position_key" ON "HomepageFeaturedActor"("position");

-- CreateIndex
CREATE INDEX "HomepageFeaturedActor_actorProfileId_idx" ON "HomepageFeaturedActor"("actorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageFeaturedActor_actorProfileId_key" ON "HomepageFeaturedActor"("actorProfileId");

-- AddForeignKey
ALTER TABLE "HomepageFeaturedCasting" ADD CONSTRAINT "HomepageFeaturedCasting_castingId_fkey" FOREIGN KEY ("castingId") REFERENCES "Casting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageFeaturedActor" ADD CONSTRAINT "HomepageFeaturedActor_actorProfileId_fkey" FOREIGN KEY ("actorProfileId") REFERENCES "ActorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
