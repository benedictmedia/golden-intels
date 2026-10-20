CREATE TABLE "ClassworkItem" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "dueDate" TEXT,
    "durationMinutes" INTEGER,
    "questions" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "teacherEmail" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "legacyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClassworkItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClassworkItem_teacherEmail_type_legacyId_key"
ON "ClassworkItem"("teacherEmail", "type", "legacyId");
CREATE INDEX "ClassworkItem_gradeLevel_academicYear_term_published_idx"
ON "ClassworkItem"("gradeLevel", "academicYear", "term", "published");
CREATE INDEX "ClassworkItem_teacherEmail_academicYear_term_idx"
ON "ClassworkItem"("teacherEmail", "academicYear", "term");

CREATE TABLE "ClassworkSubmission" (
    "id" SERIAL NOT NULL,
    "classworkItemId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "learnerName" TEXT NOT NULL,
    "learnerEmail" TEXT NOT NULL,
    "device" TEXT,
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeUsedSeconds" INTEGER,
    "questions" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "totalQuestions" INTEGER,
    "marked" BOOLEAN NOT NULL DEFAULT false,
    "markedAt" TIMESTAMP(3),
    "markedBy" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClassworkSubmission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ClassworkSubmission_classworkItemId_fkey" FOREIGN KEY ("classworkItemId") REFERENCES "ClassworkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassworkSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ClassworkSubmission_classworkItemId_studentId_key"
ON "ClassworkSubmission"("classworkItemId", "studentId");
CREATE INDEX "ClassworkSubmission_studentId_submittedAt_idx"
ON "ClassworkSubmission"("studentId", "submittedAt");