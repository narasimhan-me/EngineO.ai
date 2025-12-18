-- CreateEnum
CREATE TYPE "AutomationPlaybookRunType" AS ENUM ('PREVIEW_GENERATE', 'DRAFT_GENERATE', 'APPLY', 'INTENT_FIX_PREVIEW');

-- CreateEnum
CREATE TYPE "AutomationPlaybookRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'STALE');

-- CreateEnum
CREATE TYPE "SearchIntentType" AS ENUM ('INFORMATIONAL', 'COMPARATIVE', 'TRANSACTIONAL', 'PROBLEM_USE_CASE', 'TRUST_VALIDATION');

-- CreateEnum
CREATE TYPE "IntentCoverageStatus" AS ENUM ('NONE', 'WEAK', 'PARTIAL', 'COVERED');

-- CreateEnum
CREATE TYPE "IntentFixDraftType" AS ENUM ('ANSWER_BLOCK', 'CONTENT_SNIPPET', 'METADATA_GUIDANCE');

-- CreateEnum
CREATE TYPE "IntentFixApplyTarget" AS ENUM ('ANSWER_BLOCK', 'CONTENT_SNIPPET_SECTION');

-- CreateTable
CREATE TABLE "AutomationPlaybookRun" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "playbookId" TEXT NOT NULL,
    "runType" "AutomationPlaybookRunType" NOT NULL,
    "status" "AutomationPlaybookRunStatus" NOT NULL DEFAULT 'QUEUED',
    "scopeId" TEXT NOT NULL,
    "rulesHash" TEXT NOT NULL,
    "draftId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "aiUsed" BOOLEAN NOT NULL DEFAULT false,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "resultRef" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "aiWorkKey" TEXT,
    "reused" BOOLEAN NOT NULL DEFAULT false,
    "reusedFromRunId" TEXT,

    CONSTRAINT "AutomationPlaybookRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductIntentCoverage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "intentType" "SearchIntentType" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "coverageStatus" "IntentCoverageStatus" NOT NULL,
    "missingQueries" JSONB NOT NULL,
    "weakQueries" JSONB NOT NULL,
    "coveredQueries" JSONB NOT NULL,
    "expectedQueries" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductIntentCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductIntentFixDraft" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "intentType" "SearchIntentType" NOT NULL,
    "query" TEXT NOT NULL,
    "draftType" "IntentFixDraftType" NOT NULL,
    "draftPayload" JSONB NOT NULL,
    "aiWorkKey" TEXT NOT NULL,
    "reusedFromWorkKey" TEXT,
    "generatedWithAi" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductIntentFixDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductIntentFixApplication" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "appliedByUserId" TEXT NOT NULL,
    "intentType" "SearchIntentType" NOT NULL,
    "query" TEXT NOT NULL,
    "applyTarget" "IntentFixApplyTarget" NOT NULL,
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductIntentFixApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutomationPlaybookRun_projectId_createdAt_idx" ON "AutomationPlaybookRun"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AutomationPlaybookRun_projectId_playbookId_runType_createdA_idx" ON "AutomationPlaybookRun"("projectId", "playbookId", "runType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AutomationPlaybookRun_projectId_scopeId_runType_createdAt_idx" ON "AutomationPlaybookRun"("projectId", "scopeId", "runType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AutomationPlaybookRun_projectId_playbookId_runType_aiWorkKe_idx" ON "AutomationPlaybookRun"("projectId", "playbookId", "runType", "aiWorkKey");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationPlaybookRun_projectId_playbookId_runType_scopeId__key" ON "AutomationPlaybookRun"("projectId", "playbookId", "runType", "scopeId", "rulesHash", "idempotencyKey");

-- CreateIndex
CREATE INDEX "ProductIntentCoverage_productId_computedAt_idx" ON "ProductIntentCoverage"("productId", "computedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ProductIntentCoverage_productId_intentType_key" ON "ProductIntentCoverage"("productId", "intentType");

-- CreateIndex
CREATE INDEX "ProductIntentFixDraft_productId_intentType_query_idx" ON "ProductIntentFixDraft"("productId", "intentType", "query");

-- CreateIndex
CREATE INDEX "ProductIntentFixDraft_aiWorkKey_idx" ON "ProductIntentFixDraft"("aiWorkKey");

-- CreateIndex
CREATE INDEX "ProductIntentFixDraft_productId_expiresAt_idx" ON "ProductIntentFixDraft"("productId", "expiresAt");

-- CreateIndex
CREATE INDEX "ProductIntentFixApplication_productId_appliedAt_idx" ON "ProductIntentFixApplication"("productId", "appliedAt" DESC);

-- CreateIndex
CREATE INDEX "ProductIntentFixApplication_appliedByUserId_appliedAt_idx" ON "ProductIntentFixApplication"("appliedByUserId", "appliedAt" DESC);

-- AddForeignKey
ALTER TABLE "AutomationPlaybookRun" ADD CONSTRAINT "AutomationPlaybookRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationPlaybookRun" ADD CONSTRAINT "AutomationPlaybookRun_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductIntentCoverage" ADD CONSTRAINT "ProductIntentCoverage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductIntentFixDraft" ADD CONSTRAINT "ProductIntentFixDraft_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductIntentFixApplication" ADD CONSTRAINT "ProductIntentFixApplication_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductIntentFixApplication" ADD CONSTRAINT "ProductIntentFixApplication_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ProductIntentFixDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductIntentFixApplication" ADD CONSTRAINT "ProductIntentFixApplication_appliedByUserId_fkey" FOREIGN KEY ("appliedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "AutomationPlaybookDraft_draftKey_key" RENAME TO "AutomationPlaybookDraft_projectId_playbookId_scopeId_rulesH_key";

-- RenameIndex
ALTER INDEX "AutomationPlaybookDraft_project_playbook_updatedAt_idx" RENAME TO "AutomationPlaybookDraft_projectId_playbookId_updatedAt_idx";
