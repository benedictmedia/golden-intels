-- CreateTable
CREATE TABLE "AdmissionToken" (
    "id" SERIAL NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionToken_serialNumber_key" ON "AdmissionToken"("serialNumber");
