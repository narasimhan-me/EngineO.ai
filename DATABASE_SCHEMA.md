# SEOEngine.io – Database Schema (Prisma)

This document defines the Prisma schema for the MVP of SEOEngine.io.

---

## 1. Datasource & Generator

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

---

## 2. Models

### 2.1 User

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  projects  Project[]
}
```

---

### 2.2 Project

```prisma
model Project {
  id            String         @id @default(cuid())
  user          User           @relation(fields: [userId], references: [id])
  userId        String
  name          String
  domain        String?
  connectedType String         // 'website' | 'shopify'
  createdAt     DateTime       @default(now())

  shopifyStore  ShopifyStore?
  crawlResults  CrawlResult[]
  products      Product[]
}
```

---

### 2.3 ShopifyStore

```prisma
model ShopifyStore {
  id          String   @id @default(cuid())
  project     Project  @relation(fields: [projectId], references: [id])
  projectId   String   @unique
  shopDomain  String   @unique
  accessToken String
  scope       String?
  installedAt DateTime @default(now())
  uninstalledAt DateTime?
}
```

---

### 2.4 Product

```prisma
model Product {
  id             String   @id @default(cuid())
  project        Project  @relation(fields: [projectId], references: [id])
  projectId      String
  shopifyId      String
  title          String
  description    String?
  seoTitle       String?
  seoDescription String?
  imageUrls      Json?
  lastSyncedAt   DateTime @default(now())
}
```

---

### 2.5 CrawlResult

```prisma
model CrawlResult {
  id              String   @id @default(cuid())
  project         Project  @relation(fields: [projectId], references: [id])
  projectId       String
  url             String
  statusCode      Int
  title           String?
  metaDescription String?
  h1              String?
  wordCount       Int?
  loadTimeMs      Int?
  issues          Json
  scannedAt       DateTime @default(now())
}
```

---

### 2.6 (Optional) MetadataSuggestion

You may add this model later if you want to persist AI suggestions:

```prisma
model MetadataSuggestion {
  id              String       @id @default(cuid())
  project         Project      @relation(fields: [projectId], references: [id])
  projectId       String
  crawlResult     CrawlResult? @relation(fields: [crawlResultId], references: [id])
  crawlResultId   String?
  product         Product?     @relation(fields: [productId], references: [id])
  productId       String?
  suggestedTitle  String
  suggestedDesc   String
  createdAt       DateTime     @default(now())
}
```

---

## 3. Migrations

Suggested migration sequence:

1. `init` – User + Project.
2. `add_shopify_store` – ShopifyStore.
3. `add_crawl_result` – CrawlResult.
4. `add_product` – Product.
5. `add_metadata_suggestion` – MetadataSuggestion (optional).

---

END OF DATABASE SCHEMA
