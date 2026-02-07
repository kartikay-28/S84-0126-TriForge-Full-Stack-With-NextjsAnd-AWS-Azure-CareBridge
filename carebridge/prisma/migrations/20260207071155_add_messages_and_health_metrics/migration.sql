/*
  Warnings:

  - The `status` column on the `access_grants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `health_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `metricType` on the `health_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `health_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `readAt` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `sentBy` on the `messages` table. All the data in the column will be lost.
  - Added the required column `type` to the `health_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccessGrantStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'REVOKED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "ConsultationPreference" AS ENUM ('IN_PERSON', 'VIDEO_CALL', 'PHONE_CALL', 'CHAT');

-- CreateEnum
CREATE TYPE "ConsultationMode" AS ENUM ('IN_PERSON_ONLY', 'ONLINE_ONLY', 'BOTH');

-- CreateEnum
CREATE TYPE "MedicalCondition" AS ENUM ('HEART_DISEASE', 'DIABETES', 'HYPERTENSION', 'ASTHMA', 'ARTHRITIS', 'DEPRESSION', 'ANXIETY', 'SKIN_CONDITIONS', 'DIGESTIVE_ISSUES', 'HEADACHES_MIGRAINES', 'BACK_PAIN', 'ALLERGIES', 'RESPIRATORY_ISSUES', 'KIDNEY_DISEASE', 'LIVER_DISEASE', 'THYROID_DISORDERS', 'CANCER', 'NEUROLOGICAL_DISORDERS', 'MENTAL_HEALTH', 'WOMENS_HEALTH', 'MENS_HEALTH', 'PEDIATRIC_CARE', 'GERIATRIC_CARE', 'GENERAL_CHECKUP', 'PREVENTIVE_CARE', 'OTHER');

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_patientId_fkey";

-- AlterTable
ALTER TABLE "access_grants" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "status",
ADD COLUMN     "status" "AccessGrantStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "health_metrics" DROP COLUMN "createdAt",
DROP COLUMN "metricType",
DROP COLUMN "unit",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "medical_records" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "doctorId",
DROP COLUMN "patientId",
DROP COLUMN "readAt",
DROP COLUMN "sentAt",
DROP COLUMN "sentBy",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "receiverId" TEXT NOT NULL,
ADD COLUMN     "senderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profileLevel" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "AccessStatus";

-- CreateTable
CREATE TABLE "patient_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER,
    "gender" "Gender",
    "symptoms" TEXT[],
    "consultationPreference" "ConsultationPreference",
    "medicalHistory" TEXT[],
    "currentMedications" TEXT[],
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "vitalsBp" TEXT,
    "vitalsSugar" TEXT,
    "vitalsHeartRate" INTEGER,
    "vitalsOxygen" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "primaryProblem" "MedicalCondition",
    "emergencyContactRelationship" TEXT,
    "lifestyleDrinking" TEXT,
    "lifestyleExercise" TEXT,
    "lifestyleSmoking" TEXT,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT,
    "experienceYears" INTEGER,
    "conditionsTreated" TEXT[],
    "consultationMode" "ConsultationMode",
    "availability" TEXT,
    "qualifications" TEXT[],
    "clinicName" TEXT,
    "clinicAddress" TEXT,
    "clinicPhone" TEXT,
    "consultationFee" DOUBLE PRECISION,
    "languagesSpoken" TEXT[],
    "licenseDocument" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_profiles_userId_key" ON "patient_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_userId_key" ON "doctor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_patientId_doctorId_key" ON "assignments"("patientId", "doctorId");

-- CreateIndex
CREATE INDEX "health_metrics_patientId_idx" ON "health_metrics"("patientId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_receiverId_idx" ON "messages"("receiverId");

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
