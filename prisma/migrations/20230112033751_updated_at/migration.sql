/*
  Warnings:

  - Added the required column `updatedAt` to the `Bank` table without a default value. This is not possible if the table is not empty.
  - Made the column `updatedAt` on table `Bookmark` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `PhysicalPerson` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Bank" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Bookmark" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "PhysicalPerson" ALTER COLUMN "updatedAt" SET NOT NULL;
