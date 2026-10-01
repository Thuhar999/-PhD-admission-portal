-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('APPLICANT', 'REVIEWER', 'ADMIN');
CREATE TYPE "Programme" AS ENUM ('CSE', 'EC', 'CHEM', 'PHY', 'Maths', 'MBA', 'ME');
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFORMATION', 'APPROVED', 'REJECTED');
CREATE TYPE "SupervisorType" AS ENUM ('SUPERVISOR', 'CO_SUPERVISOR');
CREATE TYPE "DocumentType" AS ENUM ('UG_CONVOCATION_CERTIFICATE', 'PG_MARKS_CARD', 'VTU_APPLICATION_COPY', 'CASTE_CERTIFICATE', 'OTHER');
CREATE TYPE "SignatureType" AS ENUM ('DRAWN', 'UPLOADED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'APPLICANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "applicationNumber" TEXT,
    "applicantId" TEXT NOT NULL,
    "selectedProgramme" "Programme" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "photographPath" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScholarDetails" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "contactNumber" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "proposedResearchTopic" TEXT NOT NULL DEFAULT '',
    "profession" TEXT NOT NULL DEFAULT '',
    "guardianName" TEXT NOT NULL DEFAULT '',
    "alternateNumber" TEXT NOT NULL DEFAULT '',
    "studyMode" TEXT NOT NULL DEFAULT '',
    "addressForCommunication" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "ScholarDetails_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupervisorDetails" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "SupervisorType" NOT NULL,
    "hasCoSupervisor" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "contactNumber" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "profession" TEXT NOT NULL DEFAULT '',
    "addressOfInstitution" TEXT NOT NULL DEFAULT '',
    "addressForCommunication" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "SupervisorDetails_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Qualification" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "percentage" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "Qualification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApplicationDocument" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "displayName" TEXT NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "originalName" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "storagePath" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ApplicationDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FeePayment" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "amount" TEXT NOT NULL,
    "modeOfPayment" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "FeePayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Declaration" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "agreed" BOOLEAN NOT NULL DEFAULT false,
    "declarationDate" TIMESTAMP(3),
    "signatureType" "SignatureType",
    "signaturePath" TEXT,
    "agreedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Declaration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApplicationStatusLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "note" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Application_applicationNumber_key" ON "Application"("applicationNumber");
CREATE INDEX "Application_applicantId_status_idx" ON "Application"("applicantId", "status");
CREATE INDEX "Application_status_selectedProgramme_idx" ON "Application"("status", "selectedProgramme");
CREATE UNIQUE INDEX "ScholarDetails_applicationId_key" ON "ScholarDetails"("applicationId");
CREATE UNIQUE INDEX "SupervisorDetails_applicationId_type_key" ON "SupervisorDetails"("applicationId", "type");
CREATE INDEX "Qualification_applicationId_sortOrder_idx" ON "Qualification"("applicationId", "sortOrder");
CREATE UNIQUE INDEX "ApplicationDocument_applicationId_type_key" ON "ApplicationDocument"("applicationId", "type");
CREATE INDEX "FeePayment_applicationId_sortOrder_idx" ON "FeePayment"("applicationId", "sortOrder");
CREATE UNIQUE INDEX "Declaration_applicationId_key" ON "Declaration"("applicationId");
CREATE INDEX "ApplicationStatusLog_applicationId_createdAt_idx" ON "ApplicationStatusLog"("applicationId", "createdAt");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ScholarDetails" ADD CONSTRAINT "ScholarDetails_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupervisorDetails" ADD CONSTRAINT "SupervisorDetails_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Qualification" ADD CONSTRAINT "Qualification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationDocument" ADD CONSTRAINT "ApplicationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Declaration" ADD CONSTRAINT "Declaration_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationStatusLog" ADD CONSTRAINT "ApplicationStatusLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationStatusLog" ADD CONSTRAINT "ApplicationStatusLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
