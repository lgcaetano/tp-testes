/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `PhysicalPerson` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PhysicalPerson_email_key" ON "PhysicalPerson"("email");
