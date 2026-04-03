CREATE TABLE "ProducerFilmographyEntry" (
    "id" TEXT NOT NULL,
    "producerProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "kinopoiskUrl" TEXT,
    "posterPublicUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProducerFilmographyEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProducerFilmographyEntry_producerProfileId_idx" ON "ProducerFilmographyEntry"("producerProfileId");

CREATE TABLE "ProducerActorDirectThread" (
    "id" TEXT NOT NULL,
    "producerProfileId" TEXT NOT NULL,
    "actorProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProducerActorDirectThread_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProducerActorDirectThread_producerProfileId_actorProfileId_key" ON "ProducerActorDirectThread"("producerProfileId", "actorProfileId");
CREATE INDEX "ProducerActorDirectThread_producerProfileId_idx" ON "ProducerActorDirectThread"("producerProfileId");
CREATE INDEX "ProducerActorDirectThread_actorProfileId_idx" ON "ProducerActorDirectThread"("actorProfileId");

CREATE TABLE "DirectThreadMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectThreadMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DirectThreadMessage_threadId_idx" ON "DirectThreadMessage"("threadId");

ALTER TABLE "ProducerFilmographyEntry" ADD CONSTRAINT "ProducerFilmographyEntry_producerProfileId_fkey" FOREIGN KEY ("producerProfileId") REFERENCES "ProducerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProducerActorDirectThread" ADD CONSTRAINT "ProducerActorDirectThread_producerProfileId_fkey" FOREIGN KEY ("producerProfileId") REFERENCES "ProducerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProducerActorDirectThread" ADD CONSTRAINT "ProducerActorDirectThread_actorProfileId_fkey" FOREIGN KEY ("actorProfileId") REFERENCES "ActorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DirectThreadMessage" ADD CONSTRAINT "DirectThreadMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ProducerActorDirectThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DirectThreadMessage" ADD CONSTRAINT "DirectThreadMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
