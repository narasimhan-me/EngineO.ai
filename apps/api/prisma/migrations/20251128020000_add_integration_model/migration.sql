-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('SHOPIFY', 'WOOCOMMERCE', 'BIGCOMMERCE', 'MAGENTO', 'CUSTOM_WEBSITE');

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "externalId" TEXT,
    "accessToken" TEXT,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- Migrate existing ShopifyStore data to Integration
INSERT INTO "Integration" ("id", "projectId", "type", "externalId", "accessToken", "config", "createdAt", "updatedAt")
SELECT
    "id",
    "projectId",
    'SHOPIFY'::"IntegrationType",
    "shopDomain",
    "accessToken",
    jsonb_build_object('scope', "scope", 'installedAt', "installedAt", 'uninstalledAt', "uninstalledAt"),
    "installedAt",
    "installedAt"
FROM "ShopifyStore";

-- Migrate shopifyId to externalId in Product table
ALTER TABLE "Product" RENAME COLUMN "shopifyId" TO "externalId";

-- DropForeignKey
ALTER TABLE "ShopifyStore" DROP CONSTRAINT "ShopifyStore_projectId_fkey";

-- DropIndex
DROP INDEX "ShopifyStore_projectId_key";

-- DropIndex
DROP INDEX "ShopifyStore_shopDomain_key";

-- DropTable
DROP TABLE "ShopifyStore";

-- AlterTable: Remove connectedType from Project
ALTER TABLE "Project" DROP COLUMN "connectedType";

-- CreateIndex
CREATE UNIQUE INDEX "Integration_projectId_type_key" ON "Integration"("projectId", "type");

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
