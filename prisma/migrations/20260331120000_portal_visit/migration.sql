-- CreateTable
CREATE TABLE "PortalVisit" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortalVisit_createdAt_idx" ON "PortalVisit"("createdAt");

-- AddForeignKey
ALTER TABLE "PortalVisit" ADD CONSTRAINT "PortalVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
