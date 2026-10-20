ALTER TABLE "Student" ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE TABLE "ArchiveRecord" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "studentId" INTEGER,
    "title" TEXT NOT NULL,
    "academicYear" TEXT,
    "term" TEXT,
    "reason" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "archivedBy" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restoredBy" TEXT,
    "restoredAt" TIMESTAMP(3),
    CONSTRAINT "ArchiveRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ArchiveRecord_entityType_entityId_idx" ON "ArchiveRecord"("entityType", "entityId");
CREATE INDEX "ArchiveRecord_studentId_archivedAt_idx" ON "ArchiveRecord"("studentId", "archivedAt");
CREATE INDEX "ArchiveRecord_academicYear_term_archivedAt_idx" ON "ArchiveRecord"("academicYear", "term", "archivedAt");