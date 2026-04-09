-- CreateTable
CREATE TABLE "ProfileStarRating" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "subjectUserId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileStarRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileStarRating_authorId_subjectUserId_key" ON "ProfileStarRating"("authorId", "subjectUserId");

-- CreateIndex
CREATE INDEX "ProfileStarRating_subjectUserId_idx" ON "ProfileStarRating"("subjectUserId");

-- AddForeignKey
ALTER TABLE "ProfileStarRating" ADD CONSTRAINT "ProfileStarRating_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileStarRating" ADD CONSTRAINT "ProfileStarRating_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
