-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "cancelledAt" DATETIME;

-- CreateIndex
CREATE INDEX "Booking_date_mode_idx" ON "Booking"("date", "mode");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_expiresAt_idx" ON "Booking"("expiresAt");
