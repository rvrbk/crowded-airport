/*
  Warnings:

  - You are about to drop the column `place_id` on the `PlacesImport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlacesImport" DROP COLUMN "place_id",
ADD COLUMN     "iata" TEXT;
