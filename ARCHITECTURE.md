# SEOEngine.io – System Architecture

This document describes the **high-level and component-level architecture** for SEOEngine.io.

---

## 1. Overview

SEOEngine.io is an AI-powered SEO automation platform for e‑commerce merchants supporting multiple platforms (Shopify, WooCommerce, BigCommerce, Magento, and custom websites). It consists of:

- A **Next.js 14** web application (frontend).
- A **NestJS** API server (backend).
- A **PostgreSQL** database managed by Prisma.
- Optional **Redis** for caching and background job queues.
- Integrations with:
  - **Shopify Admin API**
  - **WooCommerce REST API**
  - **BigCommerce API**
  - **Magento 2 REST API**
  - **AI providers** (OpenAI, Gemini)
  - **Google Search Console / GA4** (future)

Deployment targets:

- **Frontend:** Vercel (or similar)
- **Backend + DB:** AWS / Render / Fly.io

---

## 2. High-Level Architecture Diagram (Text/Mermaid)

```mermaid
graph TD

A[Browser / Client] --> B[Next.js 14 Frontend (apps/web)]
B --> C[API Gateway - NestJS (apps/api)]
C --> D[(PostgreSQL - Prisma)]
C --> E[(Redis - cache/queue)]
C --> F[AI Providers (OpenAI / Gemini)]
C --> G[Ecommerce Platforms]
C --> H[Other Integrations (GSC, GA4 - future)]

G --> G1[Shopify Admin API]
G --> G2[WooCommerce REST API]
G --> G3[BigCommerce API]
G --> G4[Magento 2 REST API]
```

---

## 3. Frontend (Next.js 14)

- **Framework:** Next.js 14 with App Router (`/src/app`).
- **Language:** TypeScript.
- **Styling:** TailwindCSS, optional component library (e.g. shadcn/ui).
- **Key responsibilities:**
  - Public marketing pages.
  - Auth pages (login, signup).
  - User dashboard.
  - Projects management.
  - Integration management (multi-platform).
  - SEO scan results UI.
  - Product SEO UI.
  - Settings, billing UI (future).

It communicates with the NestJS API via REST endpoints, using JWT for authentication.

---

## 4. Backend (NestJS)

- **Framework:** NestJS with modular structure.
- **Language:** TypeScript.
- **Server type:** HTTP REST API.

### 4.1 Modules

- `AppModule`
- `AuthModule`
- `UsersModule`
- `ProjectsModule`
- `IntegrationsModule` – Generic integration management
- `ShopifyModule` – Shopify-specific OAuth and API calls
- `SeoScanModule`
- `AiModule`
- `ReportingModule` (future)

Each module is self-contained with its own controller, service, and optional sub-modules.

### 4.2 Integration Architecture

The system uses a generic `Integration` model to support multiple ecommerce platforms:

```
IntegrationType enum:
  - SHOPIFY
  - WOOCOMMERCE
  - BIGCOMMERCE
  - MAGENTO
  - CUSTOM_WEBSITE
```

Each platform has:
- A unique `externalId` (shop domain, store URL, etc.)
- An `accessToken` for API authentication
- A `config` JSON object for platform-specific settings

Platform-specific modules (e.g., `ShopifyModule`) handle OAuth flows and API interactions, while the `IntegrationsModule` provides generic CRUD operations.

---

## 5. Data Layer (PostgreSQL + Prisma)

Prisma is used as the ORM to interact with PostgreSQL. Core tables:

- `User` – User accounts
- `Project` – User projects/workspaces
- `Integration` – Platform connections (replaces ShopifyStore)
- `Product` – Synced products from any platform
- `CrawlResult` – SEO scan results
- (Optional) `MetadataSuggestion`, `Subscription`, etc.

The database is the canonical source of truth for users, projects, connections, and scan/AI outputs.

---

## 6. Caching & Background Jobs (Redis)

Redis may be used for:

- Caching frequently-used project data.
- Storing rate limit counters.
- Implementing job queues (e.g. via BullMQ) for:
  - Large SEO scans.
  - Bulk product sync (any platform).
  - AI batch operations.
  - Scheduled reports.

In the MVP, Redis is optional; operations can be synchronous as long as input sizes are small.

---

## 7. External Integrations

### 7.1 Shopify Admin API

Used to:

- Authorize stores via OAuth.
- Fetch products and collections.
- Update product SEO fields or metafields.
- Optionally inject theme snippets or structured data in themes.

### 7.2 WooCommerce REST API

Used to:

- Authenticate via Consumer Key/Secret.
- Fetch products from WordPress/WooCommerce stores.
- Update product data and SEO fields.

### 7.3 BigCommerce API

Used to:

- Authenticate via API credentials.
- Fetch products and categories.
- Update product SEO metadata.

### 7.4 Magento 2 REST API

Used to:

- Authenticate via OAuth or API tokens.
- Fetch products and categories.
- Update product attributes and SEO data.

### 7.5 AI Providers

The `AiModule` abstracts the AI provider, e.g.:

- OpenAI GPT‑4o, GPT‑4o‑mini
- Google Gemini 1.5 / 2.0

It exposes internal methods:

- `generateMetadata`
- `generateProductSeo`
- `generateBlogPost` (future)
- `generateCollectionDescription` (future)

Switching providers should be achievable by configuration.

---

## 8. Security & Auth

- **Auth type:** JWT-based stateless auth between frontend and backend.
- **Token storage (MVP):** LocalStorage (upgradeable to httpOnly cookies).
- **Password hashing:** bcrypt.
- **Scopes:** Per-user project ownership enforced at API level.
- **Platform security:**
  - Shopify: HMAC verification during OAuth callback, secure token storage.
  - WooCommerce: Consumer key/secret stored securely.
  - BigCommerce/Magento: API credentials stored securely.
  - Validate `state` parameter to prevent CSRF in OAuth flows.

---

## 9. Environments

Typical environments:

- `local` – developer machines (Docker or local Postgres).
- `staging` – near-production environment for testing.
- `production` – live customers.

Each environment has its own:

- `DATABASE_URL`
- `REDIS_URL`
- API keys for AI providers.
- Platform app credentials (separate apps for production).

---

## 10. Logging & Monitoring

MVP:

- Use NestJS logger for backend logs.
- Use browser console + optional Sentry on frontend.

Later:

- Integrate with Sentry/Datadog for:
  - Error tracking
  - Performance monitoring
  - Traces across requests

---

## 11. Scalability Considerations

- Stateless API allows horizontal scaling.
- DB should run on managed Postgres (Neon, RDS, Supabase).
- Long-running operations moved to queues and workers (Redis + BullMQ).
- SEO scans can be throttled and chunked to avoid rate limits and timeouts.
- Platform API calls are rate-limited and should implement retry logic.

---

END OF ARCHITECTURE
