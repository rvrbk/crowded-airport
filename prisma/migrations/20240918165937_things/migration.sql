-- AlterTable
ALTER TABLE "Airport" ALTER COLUMN "city" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Thing" (
    "id" SERIAL NOT NULL,
    "thing" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thing_pkey" PRIMARY KEY ("id")
);
