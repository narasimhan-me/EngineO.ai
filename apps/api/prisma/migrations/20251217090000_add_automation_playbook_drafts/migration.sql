-- CreateEnum
CREATE TYPE "AutomationPlaybookDraftStatus" AS ENUM ('READY', 'PARTIAL', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "AutomationPlaybookDraft" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "playbookId" TEXT NOT NULL,
    "scopeId" TEXT NOT NULL,
    "rulesHash" TEXT NOT NULL,
    "status" "AutomationPlaybookDraftStatus" NOT NULL DEFAULT 'PARTIAL',
    "sampleProductIds" JSONB,
    "draftItems" JSONB,
    "counts" JSONB,
    "rules" JSONB,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "AutomationPlaybookDraft_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AutomationPlaybookDraft"
ADD CONSTRAINT "AutomationPlaybookDraft_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "AutomationPlaybookDraft_draftKey_key"
ON "AutomationPlaybookDraft"("projectId", "playbookId", "scopeId", "rulesHash");

-- CreateIndex
CREATE INDEX "AutomationPlaybookDraft_project_playbook_updatedAt_idx"
ON "AutomationPlaybookDraft"("projectId", "playbookId", "updatedAt" DESC);
