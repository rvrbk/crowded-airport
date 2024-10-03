/*
  Warnings:

  - Made the column `latitude` on table `Thing` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longitude` on table `Thing` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Thing" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL;
