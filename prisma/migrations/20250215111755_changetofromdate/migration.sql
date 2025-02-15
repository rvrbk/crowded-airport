/*
  Warnings:

  - You are about to drop the column `from` on the `Thing` table. All the data in the column will be lost.
  - You are about to drop the column `till` on the `Thing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Thing" DROP COLUMN "from",
DROP COLUMN "till",
ADD COLUMN     "fromDate" TIMESTAMP(3),
ADD COLUMN     "tillDate" TIMESTAMP(3);
