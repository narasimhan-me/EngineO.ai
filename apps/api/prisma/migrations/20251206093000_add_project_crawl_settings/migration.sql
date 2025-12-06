-- CreateEnum
CREATE TYPE "CrawlFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "Project"
ADD COLUMN "autoCrawlEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN "crawlFrequency" "CrawlFrequency" NOT NULL DEFAULT 'DAILY';
