-- CreateEnum
CREATE TYPE "LocalApplicabilityStatus" AS ENUM ('APPLICABLE', 'NOT_APPLICABLE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "LocalSignalType" AS ENUM ('LOCATION_PRESENCE', 'LOCAL_INTENT_COVERAGE', 'LOCAL_TRUST_SIGNALS', 'LOCAL_SCHEMA_READINESS');

-- CreateEnum
CREATE TYPE "LocalGapType" AS ENUM ('MISSING_LOCAL_INTENT_COVERAGE', 'MISSING_LOCATION_CONTENT', 'UNCLEAR_SERVICE_AREA', 'MISSING_LOCAL_TRUST_SIGNAL');

-- CreateEnum
CREATE TYPE "LocalFixDraftType" AS ENUM ('LOCAL_ANSWER_BLOCK', 'CITY_SECTION', 'SERVICE_AREA_DESCRIPTION');

-- CreateEnum
CREATE TYPE "LocalFixApplyTarget" AS ENUM ('ANSWER_BLOCK', 'CONTENT_SECTION');

-- CreateEnum
CREATE TYPE "LocalCoverageStatus" AS ENUM ('STRONG', 'NEEDS_IMPROVEMENT', 'WEAK');

-- CreateTable
CREATE TABLE "ProjectLocalConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "hasPhysicalLocation" BOOLEAN NOT NULL DEFAULT false,
    "serviceAreaDescription" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectLocalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLocalCoverage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "applicabilityStatus" "LocalApplicabilityStatus" NOT NULL,
    "applicabilityReasons" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "status" "LocalCoverageStatus",
    "signalCounts" JSONB NOT NULL,
    "missingLocalSignalsCount" INTEGER NOT NULL DEFAULT 0,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectLocalCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLocalSignal" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "signalType" "LocalSignalType" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "evidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectLocalSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLocalFixDraft" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "productId" TEXT,
    "gapType" "LocalGapType" NOT NULL,
    "signalType" "LocalSignalType" NOT NULL,
    "focusKey" TEXT NOT NULL,
    "draftType" "LocalFixDraftType" NOT NULL,
    "draftPayload" JSONB NOT NULL,
    "aiWorkKey" TEXT NOT NULL,
    "reusedFromWorkKey" TEXT,
    "generatedWithAi" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectLocalFixDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLocalFixApplication" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "productId" TEXT,
    "draftId" TEXT NOT NULL,
    "appliedByUserId" TEXT NOT NULL,
    "gapType" "LocalGapType" NOT NULL,
    "signalType" "LocalSignalType" NOT NULL,
    "focusKey" TEXT NOT NULL,
    "applyTarget" "LocalFixApplyTarget" NOT NULL,
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectLocalFixApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectLocalConfig_projectId_key" ON "ProjectLocalConfig"("projectId");

-- CreateIndex
CREATE INDEX "ProjectLocalConfig_projectId_idx" ON "ProjectLocalConfig"("projectId");

-- CreateIndex
CREATE INDEX "ProjectLocalCoverage_projectId_computedAt_idx" ON "ProjectLocalCoverage"("projectId", "computedAt" DESC);

-- CreateIndex
CREATE INDEX "ProjectLocalSignal_projectId_signalType_idx" ON "ProjectLocalSignal"("projectId", "signalType");

-- CreateIndex
CREATE INDEX "ProjectLocalFixDraft_projectId_gapType_signalType_focusKey_idx" ON "ProjectLocalFixDraft"("projectId", "gapType", "signalType", "focusKey");

-- CreateIndex
CREATE INDEX "ProjectLocalFixDraft_aiWorkKey_idx" ON "ProjectLocalFixDraft"("aiWorkKey");

-- CreateIndex
CREATE INDEX "ProjectLocalFixDraft_projectId_expiresAt_idx" ON "ProjectLocalFixDraft"("projectId", "expiresAt");

-- CreateIndex
CREATE INDEX "ProjectLocalFixApplication_projectId_appliedAt_idx" ON "ProjectLocalFixApplication"("projectId", "appliedAt" DESC);

-- CreateIndex
CREATE INDEX "ProjectLocalFixApplication_appliedByUserId_appliedAt_idx" ON "ProjectLocalFixApplication"("appliedByUserId", "appliedAt" DESC);

-- AddForeignKey
ALTER TABLE "ProjectLocalConfig" ADD CONSTRAINT "ProjectLocalConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocalCoverage" ADD CONSTRAINT "ProjectLocalCoverage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocalSignal" ADD CONSTRAINT "ProjectLocalSignal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocalFixDraft" ADD CONSTRAINT "ProjectLocalFixDraft_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocalFixApplication" ADD CONSTRAINT "ProjectLocalFixApplication_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocalFixApplication" ADD CONSTRAINT "ProjectLocalFixApplication_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ProjectLocalFixDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocalFixApplication" ADD CONSTRAINT "ProjectLocalFixApplication_appliedByUserId_fkey" FOREIGN KEY ("appliedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
