/*
  Warnings:

  - A unique constraint covering the columns `[iata]` on the table `Airport` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `iata` to the `Thing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Thing" ADD COLUMN     "iata" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Airport_iata_key" ON "Airport"("iata");

-- AddForeignKey
ALTER TABLE "Thing" ADD CONSTRAINT "Thing_iata_fkey" FOREIGN KEY ("iata") REFERENCES "Airport"("iata") ON DELETE RESTRICT ON UPDATE CASCADE;
