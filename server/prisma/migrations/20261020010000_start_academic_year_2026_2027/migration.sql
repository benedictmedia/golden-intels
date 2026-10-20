UPDATE "AcademicContext"
SET "academicYear" = '2026/2027',
    "term" = 'Term 1',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "academicYear" < '2026/2027';