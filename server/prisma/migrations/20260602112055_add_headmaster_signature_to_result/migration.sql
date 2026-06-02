-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "headmasterSignature" TEXT;
