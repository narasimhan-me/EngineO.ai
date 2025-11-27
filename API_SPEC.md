# SEOEngine.io – API Specification (MVP)

This document defines the main REST endpoints exposed by the SEOEngine.io backend (NestJS).  
All endpoints are prefixed with `/api` in production (e.g. `https://api.seoengine.io/api/...`) depending on deployment.

Authentication is JWT-based unless otherwise stated.

---

## 1. Authentication

### POST `/auth/signup`

**Description:** Create a new user.

**Request body (JSON):**

```json
{
  "email": "user@example.com",
  "password": "plain-text-password",
  "name": "Optional Name"
}
```

**Responses:**

- `201 Created` – User created.
- `400 Bad Request` – Invalid input or email already exists.

---

### POST `/auth/login`

**Description:** Authenticate user and return JWT.

**Request body (JSON):**

```json
{
  "email": "user@example.com",
  "password": "plain-text-password"
}
```

**Responses:**

- `200 OK`:

```json
{
  "accessToken": "jwt-token-here",
  "user": {
    "id": "string",
    "email": "user@example.com",
    "name": "Optional Name"
  }
}
```

- `401 Unauthorized` – Invalid credentials.

---

### GET `/users/me` (auth required)

**Headers:**

- `Authorization: Bearer <token>`

**Response:**

```json
{
  "id": "string",
  "email": "user@example.com",
  "name": "Optional Name",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

## 2. Projects

### GET `/projects` (auth required)

List projects belonging to authenticated user.

**Response:**

```json
[
  {
    "id": "project-id",
    "name": "My Store SEO",
    "domain": "mystore.com",
    "connectedType": "shopify",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### POST `/projects` (auth required)

**Body:**

```json
{
  "name": "My Store SEO",
  "domain": "mystore.com",
  "connectedType": "shopify"
}
```

**Response:**

- `201 Created` – Returns created project.

---

### GET `/projects/:id` (auth required)

Fetch single project by ID (only if belongs to user).

---

### DELETE `/projects/:id` (auth required)

Delete a project (MVP: hard delete).

---

### GET `/projects/:id/overview` (auth required)

Returns aggregated stats:

```json
{
  "crawlCount": 10,
  "issueCount": 42,
  "avgSeoScore": 78,
  "productCount": 120,
  "productsWithAppliedSeo": 30
}
```

---

## 3. Shopify Integration

### GET `/shopify/install` (auth required)

**Query parameters:**

- `projectId` – ID of project to connect.

Redirects to Shopify OAuth install URL.

---

### GET `/shopify/callback`

OAuth callback from Shopify.  
Validates HMAC, exchanges `code` for access token, persists `ShopifyStore` and links it to project.  
Returns a simple success page or redirects back to frontend.

---

### POST `/shopify/sync-products` (auth required)

**Query parameters:**

- `projectId`

Fetches products from Shopify and upserts into `Product` table.

**Response example:**

```json
{
  "synced": 50
}
```

---

### POST `/shopify/update-product-seo` (auth required)

**Body:**

```json
{
  "productId": "local-product-id",
  "seoTitle": "New SEO Title",
  "seoDescription": "New SEO Meta Description"
}
```

Updates Shopify product SEO fields and local DB.

---

## 4. SEO Scan

### POST `/seo-scan/start` (auth required)

**Body:**

```json
{
  "projectId": "project-id"
}
```

Starts a basic SEO scan (initial MVP: home page `/` only).

**Response:**

```json
{
  "status": "started",
  "scannedCount": 1
}
```

---

### GET `/seo-scan/results` (auth required)

**Query params:**

- `projectId`

**Response:**

```json
[
  {
    "id": "crawl-result-id",
    "url": "https://mystore.com/",
    "statusCode": 200,
    "title": "My Store - Home",
    "metaDescription": "Welcome to my store...",
    "h1": "Welcome",
    "wordCount": 500,
    "issues": ["THIN_CONTENT"],
    "scannedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

## 5. AI Metadata

### POST `/ai/metadata` (auth required)

Generate SEO title & description for a scanned URL.

**Body:**

```json
{
  "crawlResultId": "string",
  "targetKeywords": ["shopify", "shoes"]
}
```

**Response:**

```json
{
  "suggestedTitle": "Shopify Shoe Store – Trendy Footwear Online",
  "suggestedDescription": "Discover our collection of stylish shoes for every occasion. Free shipping on orders over $50."
}
```

---

### POST `/ai/product-metadata` (auth required)

Generate SEO title & description for a product.

**Body:**

```json
{
  "productId": "string",
  "targetKeywords": ["running shoes", "lightweight"]
}
```

**Response:**

```json
{
  "suggestedTitle": "Lightweight Running Shoes – Comfort & Speed",
  "suggestedDescription": "Run farther and faster with our ultra-light running shoes, engineered for comfort and performance."
}
```

---

END OF API SPEC
