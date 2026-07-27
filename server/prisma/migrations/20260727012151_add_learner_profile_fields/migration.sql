/*
  Warnings:

  - A unique constraint covering the columns `[admissionApplicationId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "admissionApplicationId" INTEGER,
ADD COLUMN     "age" TEXT,
ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "dateOfAdmission" TEXT,
ADD COLUMN     "doctorName" TEXT,
ADD COLUMN     "doctorPhone" TEXT,
ADD COLUMN     "emergencyAddress" TEXT,
ADD COLUMN     "emergencyEmail" TEXT,
ADD COLUMN     "emergencyName" TEXT,
ADD COLUMN     "emergencyPhone" TEXT,
ADD COLUMN     "emergencyRelationship" TEXT,
ADD COLUMN     "emergencyWhatsapp" TEXT,
ADD COLUMN     "fatherAddress" TEXT,
ADD COLUMN     "fatherEducation" TEXT,
ADD COLUMN     "fatherEmail" TEXT,
ADD COLUMN     "fatherHouseNumber" TEXT,
ADD COLUMN     "fatherMaritalStatus" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "fatherNationality" TEXT,
ADD COLUMN     "fatherOccupation" TEXT,
ADD COLUMN     "fatherPhone" TEXT,
ADD COLUMN     "fatherPlaceOfWork" TEXT,
ADD COLUMN     "fatherReligion" TEXT,
ADD COLUMN     "ghanaBack" TEXT,
ADD COLUMN     "ghanaFront" TEXT,
ADD COLUMN     "height" TEXT,
ADD COLUMN     "hometown" TEXT,
ADD COLUMN     "hospitalName" TEXT,
ADD COLUMN     "hospitalPhone" TEXT,
ADD COLUMN     "language1" TEXT,
ADD COLUMN     "language2" TEXT,
ADD COLUMN     "language3" TEXT,
ADD COLUMN     "language4" TEXT,
ADD COLUMN     "livesWith" TEXT,
ADD COLUMN     "medicalConditions" TEXT,
ADD COLUMN     "monthOfBirth" TEXT,
ADD COLUMN     "motherAddress" TEXT,
ADD COLUMN     "motherEducation" TEXT,
ADD COLUMN     "motherEmail" TEXT,
ADD COLUMN     "motherHouseNumber" TEXT,
ADD COLUMN     "motherMaritalStatus" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "motherNationality" TEXT,
ADD COLUMN     "motherOccupation" TEXT,
ADD COLUMN     "motherPhone" TEXT,
ADD COLUMN     "motherPlaceOfWork" TEXT,
ADD COLUMN     "motherReligion" TEXT,
ADD COLUMN     "motherTongue" TEXT,
ADD COLUMN     "nhisBack" TEXT,
ADD COLUMN     "nhisFront" TEXT,
ADD COLUMN     "olderChildren" TEXT,
ADD COLUMN     "parentOccupation" TEXT,
ADD COLUMN     "placeOfBirth" TEXT,
ADD COLUMN     "previousSchool" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "secondaryContactName" TEXT,
ADD COLUMN     "secondaryContactPhone" TEXT,
ADD COLUMN     "signedBooklet" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "specialNeeds" TEXT,
ADD COLUMN     "weight" TEXT,
ADD COLUMN     "youngerChildren" TEXT;

-- CreateTable
CREATE TABLE "ManualExercise" (
    "id" SERIAL NOT NULL,
    "teacherName" TEXT NOT NULL,
    "teacherEmail" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "learnerName" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "workStatus" TEXT NOT NULL DEFAULT 'completed',
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION DEFAULT 100,
    "feedback" TEXT,
    "academicYear" TEXT,
    "term" TEXT,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "markedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionApplicationId_key" ON "Student"("admissionApplicationId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_admissionApplicationId_fkey" FOREIGN KEY ("admissionApplicationId") REFERENCES "AdmissionApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualExercise" ADD CONSTRAINT "ManualExercise_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
