CREATE TABLE "PortfolioEntry" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "portfolioData" JSONB NOT NULL,
    "parentComment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedBy" TEXT NOT NULL,
    "submittedByEmail" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PortfolioEntry_studentId_academicYear_term_key"
ON "PortfolioEntry"("studentId", "academicYear", "term");

CREATE INDEX "PortfolioEntry_status_academicYear_term_idx"
ON "PortfolioEntry"("status", "academicYear", "term");

CREATE INDEX "PortfolioEntry_submittedByEmail_status_idx"
ON "PortfolioEntry"("submittedByEmail", "status");

ALTER TABLE "PortfolioEntry"
ADD CONSTRAINT "PortfolioEntry_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "Student"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
