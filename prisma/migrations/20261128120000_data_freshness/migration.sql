-- AlterTable
ALTER TABLE "Airport" ADD COLUMN "lastRefreshedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Thing" ADD COLUMN "placeId" TEXT,
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN "missedRefreshes" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Thing_placeId_key" ON "Thing"("placeId");

-- CreateIndex
CREATE INDEX "Thing_iata_status_idx" ON "Thing"("iata", "status");
