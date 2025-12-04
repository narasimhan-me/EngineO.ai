# DEO Issues Engine (Phase 3B)

The DEO Issues Engine converts raw crawl + product data and aggregated DEO signals into a structured, human-readable issues list that merchants can act on.

It powers:

- Project Overview → Issues summary
- Product list → Issue badges
- Product optimization workspace → Issue insights
- Future automation (e.g., "Fix all missing metadata")

This phase is backend-only; UI integration is handled in later UX phases.

## 1. Issue Model

Shared types (in `packages/shared/src/deo-issues.ts`):

```typescript
export type DeoIssueSeverity = 'critical' | 'warning' | 'info';

export interface DeoIssue {
  id: string;
  title: string;
  description: string;
  severity: DeoIssueSeverity;
  count: number;
  affectedPages?: string[];
  affectedProducts?: string[];
}

export interface DeoIssuesResponse {
  projectId: string;
  generatedAt: string; // ISO timestamp
  issues: DeoIssue[];
}
```

API response shape (JSON):

```json
{
  "projectId": "proj_123",
  "generatedAt": "2025-01-01T02:00:00.000Z",
  "issues": [
    {
      "id": "missing_metadata",
      "title": "Missing titles or descriptions",
      "description": "Some pages or products are missing SEO titles or meta descriptions, which reduces visibility and click-through rates.",
      "severity": "critical",
      "count": 42,
      "affectedPages": ["https://example.com/", "..."],
      "affectedProducts": ["prod_1", "prod_2"]
    }
  ]
}
```

## 2. Data Sources

The engine is computed on-demand and does not persist anything. It reads from:

- `CrawlResult` rows for the project
- `Product` rows for the project
- Aggregated `DeoScoreSignals` returned by `DeoSignalsService.collectSignalsForProject(projectId)`
- Existing DEO snapshots (indirectly via signals/score, not directly queried)

No new tables or columns are written in this phase.

## 3. Issue Categories & Detection Rules

Each category describes:

- **Definition** – what the issue represents
- **Detection** – how it is detected from crawl/product data and signals
- **Severity thresholds** – how to map metrics to critical / warning / info

Where counts are needed, they are computed directly from `CrawlResult` and `Product` rows.

### 3.1 Missing Metadata (`missing_metadata`)

**Definition**

Pages or products missing a title and/or meta description.

**Detection**

- Pages:
  - Missing `<title>` → contribute to `missingTitles`.
  - Missing `<meta name="description">` → contribute to `missingDescriptions`.
- Products:
  - Missing SEO title (`seoTitle`) or SEO description (`seoDescription`) → contribute to `missingProductMetadata`.

**Count:**

- `count = missingTitles + missingDescriptions + missingProductMetadata`.
- `affectedPages` includes up to 20 URLs with missing metadata.
- `affectedProducts` includes up to 20 product IDs with missing SEO metadata.

**Severity** (by fraction of surfaces with any missing metadata):

```
ratio = surfacesWithMissingMetadata / totalSurfaces
critical if ratio > 0.10
warning if ratio > 0.03
info if ratio > 0
```

### 3.2 Thin Content (`thin_content`)

**Definition**

Content that is too short to be useful or competitive.

**Detection**

- Pages:
  - Word count < 150 (from `CrawlResult.wordCount`).
- Products:
  - Description words < 80 (using `seoDescription ?? description`).

**Count:**

- `count = thinPages + thinProducts`.
- `affectedPages` includes up to 20 thin page URLs.
- `affectedProducts` includes up to 20 thin product IDs.

**Severity** (by fraction of surfaces that are thin):

```
thinRatio = (thinPages + thinProducts) / totalSurfaces
critical if thinRatio > 0.25
warning if thinRatio > 0.10
info if thinRatio > 0.02
```

### 3.3 Low Entity Coverage (`low_entity_coverage`)

**Definition**

Insufficient entity signals and schema coverage.

**Detection**

- Pages:
  - Missing title or H1 (no strong entity hint).
- Products:
  - Missing SEO title or SEO description, or
  - Weak description < 120 words.

**Count:**

- `count = surfacesWithEntityIssues` (pages + products that fail the above heuristics).
- `affectedPages` and `affectedProducts` list up to 20 impacted items.

**Severity** (using `entityCoverage` from `DeoScoreSignals` where available):

```
critical if entityCoverage < 0.35
warning if entityCoverage < 0.60
info if entityCoverage < 0.80
```

If `entityCoverage` is not available, it is approximated from the fraction of surfaces with entity hints.

### 3.4 Indexability Problems (`indexability_problems`)

**Definition**

Pages that are hard or impossible to index.

**Detection**

For each page:

- HTTP errors (status < 200 or ≥ 400), or
- `issues` includes `HTTP_ERROR` or `FETCH_ERROR`, or
- Missing title, meta description, or H1, or
- `issues` indicates noindex (e.g. `NOINDEX`, `NO_INDEX`, `META_ROBOTS_NOINDEX`).

**Count:**

- `count = indexabilityIssueCount` (number of pages with any of the above).
- `affectedPages` includes up to 20 problematic URLs.

**Severity** (using `indexability` from `DeoScoreSignals`):

```
critical if indexability < 0.5
warning if indexability < 0.75
info if indexability < 0.9
```

### 3.5 Answer Surface Weakness (`answer_surface_weakness`)

**Definition**

Pages that are not strong candidates for rich answer surfaces.

**Detection**

For each page:

- Word count < 400, or
- Missing H1.

**Count:**

- `count = weakAnswerPages`.
- `affectedPages` includes up to 20 URLs failing the above.

**Severity** (using `answerSurfacePresence` from `DeoScoreSignals`):

```
critical if answerSurfacePresence < 0.2
warning if answerSurfacePresence < 0.35
info if answerSurfacePresence < 0.5
```

### 3.6 Brand Navigational Weakness (`brand_navigational_weakness`)

**Definition**

Missing canonical navigational pages that support brand and trust.

**Detection**

From `CrawlResult.url` paths, detect presence of:

- `/`
- `/about`
- `/contact`
- `/faq`
- `/support`

**Count:**

- `count = number of missing canonical paths`.
- `affectedPages` lists the missing canonical paths (e.g., `["/about", "/contact"]`).

**Severity** (using `brandNavigationalStrength` from `DeoScoreSignals`):

```
critical if brandNavigationalStrength < 0.25
warning if brandNavigationalStrength < 0.40
info if brandNavigationalStrength < 0.60
```

### 3.7 Crawl Health / Errors (`crawl_health_errors`)

**Definition**

HTTP and fetch errors that reduce crawl coverage and visibility.

**Detection**

For each page:

- HTTP status < 200 or ≥ 400, or
- `issues` includes `HTTP_ERROR` or `FETCH_ERROR`.

**Count:**

- `count = errorPages`.
- `affectedPages` includes up to 20 URLs with errors.

**Severity** (using `crawlHealth` from `DeoScoreSignals`):

```
critical if crawlHealth < 0.6
warning if crawlHealth < 0.8
info if crawlHealth < 0.95
```

### 3.8 Product Content Depth (`product_content_depth`)

**Definition**

Product descriptions that are too shallow.

**Detection**

Per product:

- Description missing or < 50 words.

**Count:**

- `count = products with missing/very short descriptions`.
- `affectedProducts` includes up to 20 product IDs.

**Severity** (using product content depth heuristic):

- Compute average product description word count.
- Derive `contentDepthProducts = clamp(avgWords / 600, 0, 1)`.
- Severity:
  - `critical if contentDepthProducts < 0.25`
  - `warning if contentDepthProducts < 0.45`
  - `info if contentDepthProducts < 0.65`

## 4. API Endpoint

Backend endpoint (in `ProjectsController`):

```
GET /projects/:id/deo-issues
```

**Behavior:**

1. Validates project ownership (same as other project endpoints).
2. Calls `DeoIssuesService.getIssuesForProject(projectId, userId)`.
3. Returns a `DeoIssuesResponse` payload.

No pagination or persistence; issues are computed on-demand from latest data.

## 5. Constraints

- No new database fields or tables. Issues are derived from existing schema only.
- No UI changes in this phase; the frontend will consume this endpoint in a later UX phase.
- No DEO scoring changes. The v1 DEO formula and weights remain unchanged; the Issues Engine is an interpretation layer on top.

## 6. Acceptance Criteria

Phase 3B is complete when:

1. `GET /projects/:id/deo-issues` returns a structured `DeoIssuesResponse` with `projectId`, `generatedAt`, and a list of `DeoIssue` items.
2. All categories defined above are implemented with the specified detection rules and severity thresholds.
3. Issue count values match raw `CrawlResult` and `Product` data for representative test projects.
4. No new rows or columns are written as part of issue computation.
5. No frontend changes are required; the API is ready for consumption by UX-4.
