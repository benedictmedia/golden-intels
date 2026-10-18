ALTER TABLE "Student"
ADD COLUMN "division" TEXT,
ADD COLUMN "academicYear" TEXT,
ADD COLUMN "street" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT;

UPDATE "Student"
SET "studentId" = '__STUDENT_ID_MIGRATION__' || "id" || '__' || md5("studentId");

WITH numbered_students AS (
  SELECT
    "id",
    'STU' || EXTRACT(YEAR FROM "createdAt")::INTEGER ||
      LPAD(ROW_NUMBER() OVER (
        PARTITION BY EXTRACT(YEAR FROM "createdAt")
        ORDER BY "id"
      )::TEXT, 5, '0') AS new_student_id
  FROM "Student"
)
UPDATE "Student" AS student
SET "studentId" = numbered_students.new_student_id
FROM numbered_students
WHERE student."id" = numbered_students."id";