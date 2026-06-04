-- Add fee payment alert tracking
ALTER TABLE "FeePayment" ADD COLUMN "feePaymentAlertSeen" BOOLEAN NOT NULL DEFAULT false;
