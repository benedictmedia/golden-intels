ALTER TABLE "User"
ADD COLUMN "adminPermissions" JSONB;

ALTER TABLE "Result"
ADD COLUMN "headmasterRemarks" TEXT;
