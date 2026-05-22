-- AlterTable
ALTER TABLE "Student" ADD COLUMN "parentId" INTEGER;
ALTER TABLE "Student" ADD CONSTRAINT "Student_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE SET NULL;

ALTER TABLE "Staff" ADD COLUMN "subjects" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Staff" ADD COLUMN "classes" TEXT[] NOT NULL DEFAULT '{}';
