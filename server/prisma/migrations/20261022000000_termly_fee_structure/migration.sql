DROP INDEX "FeeStructure_gradeLevel_key";

ALTER TABLE "FeeStructure"
ADD COLUMN "academicYear" TEXT NOT NULL DEFAULT '2026/2027',
ADD COLUMN "term" TEXT NOT NULL DEFAULT 'Term 1',
ADD COLUMN "termFee" DOUBLE PRECISION;

-- Seed the first term using the existing three-month monthly rate.
UPDATE "FeeStructure" SET "termFee" = "monthlyFee" * 3;

ALTER TABLE "FeeStructure" ALTER COLUMN "termFee" SET NOT NULL;
ALTER TABLE "FeeStructure" DROP COLUMN "monthlyFee";
CREATE UNIQUE INDEX "FeeStructure_gradeLevel_academicYear_term_key"
ON "FeeStructure"("gradeLevel", "academicYear", "term");

ALTER TABLE "FeePayment"
ALTER COLUMN "month" DROP NOT NULL,
ALTER COLUMN "year" DROP NOT NULL,
ADD COLUMN "academicYear" TEXT,
ADD COLUMN "term" TEXT,
ADD COLUMN "previousTermArrears" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "FeePayment_studentId_academicYear_term_key"
ON "FeePayment"("studentId", "academicYear", "term");