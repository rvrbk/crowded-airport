/*
  Warnings:

  - You are about to drop the column `clicks` on the `Thing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Thing" DROP COLUMN "clicks";

-- CreateTable
CREATE TABLE "MarkerClicks" (
    "id" SERIAL NOT NULL,
    "thing_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarkerClicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationClicks" (
    "id" SERIAL NOT NULL,
    "thing_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NavigationClicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpvoteClicks" (
    "id" SERIAL NOT NULL,
    "thing_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpvoteClicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownvoteClicks" (
    "id" SERIAL NOT NULL,
    "thing_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownvoteClicks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MarkerClicks" ADD CONSTRAINT "MarkerClicks_thing_id_fkey" FOREIGN KEY ("thing_id") REFERENCES "Thing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationClicks" ADD CONSTRAINT "NavigationClicks_thing_id_fkey" FOREIGN KEY ("thing_id") REFERENCES "Thing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpvoteClicks" ADD CONSTRAINT "UpvoteClicks_thing_id_fkey" FOREIGN KEY ("thing_id") REFERENCES "Thing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownvoteClicks" ADD CONSTRAINT "DownvoteClicks_thing_id_fkey" FOREIGN KEY ("thing_id") REFERENCES "Thing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
