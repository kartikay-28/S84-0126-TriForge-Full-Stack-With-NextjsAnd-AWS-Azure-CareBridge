-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "weekly_meetings" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "dayOfWeek" "Weekday" NOT NULL,
    "startTime" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weekly_meetings_doctorId_patientId_dayOfWeek_startTime_key" ON "weekly_meetings"("doctorId", "patientId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "weekly_meetings_doctorId_idx" ON "weekly_meetings"("doctorId");

-- CreateIndex
CREATE INDEX "weekly_meetings_patientId_idx" ON "weekly_meetings"("patientId");

-- AddForeignKey
ALTER TABLE "weekly_meetings" ADD CONSTRAINT "weekly_meetings_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_meetings" ADD CONSTRAINT "weekly_meetings_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_meetings" ADD CONSTRAINT "weekly_meetings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
