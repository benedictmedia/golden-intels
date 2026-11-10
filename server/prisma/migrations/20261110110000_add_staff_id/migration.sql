-- AlterTable
ALTER TABLE "Staff" ADD COLUMN "staffId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Staff_staffId_key" ON "Staff"("staffId");
