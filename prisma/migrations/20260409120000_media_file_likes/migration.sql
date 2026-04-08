-- CreateTable
CREATE TABLE "MediaFileLike" (
    "id" TEXT NOT NULL,
    "mediaFileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaFileLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaFileLike_mediaFileId_userId_key" ON "MediaFileLike"("mediaFileId", "userId");

-- CreateIndex
CREATE INDEX "MediaFileLike_mediaFileId_idx" ON "MediaFileLike"("mediaFileId");

-- CreateIndex
CREATE INDEX "MediaFileLike_userId_idx" ON "MediaFileLike"("userId");

-- AddForeignKey
ALTER TABLE "MediaFileLike" ADD CONSTRAINT "MediaFileLike_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "MediaFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaFileLike" ADD CONSTRAINT "MediaFileLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
