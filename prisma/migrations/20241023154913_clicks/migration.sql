/*
  Warnings:

  - Added the required column `clicks` to the `Thing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Thing" ADD COLUMN     "clicks" INTEGER NOT NULL;
