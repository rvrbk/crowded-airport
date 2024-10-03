/*
  Warnings:

  - You are about to drop the column `downvotes` on the `Thing` table. All the data in the column will be lost.
  - You are about to drop the column `upvotes` on the `Thing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Thing" DROP COLUMN "downvotes",
DROP COLUMN "upvotes",
ADD COLUMN     "votes" INTEGER NOT NULL DEFAULT 5;
