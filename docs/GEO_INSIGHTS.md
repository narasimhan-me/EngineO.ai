# GEO Insights – Derivation & Display

> Read-only GEO metrics derived from Answer Units and fix applications.

---

## Overview

GEO Insights extends the Project Insights Dashboard (INSIGHTS-1) with GEO-specific metrics. Like all insights, GEO Insights are **read-only** – they never trigger AI operations or database mutations when viewed.

---

## GEO Insights Response Shape

The `geoInsights` block is included in the `ProjectInsightsResponse`:

```typescript
interface GeoInsights {
  overview: {
    productsAnswerReadyPercent: number;
    productsAnswerReadyCount: number;
    productsTotal: number;
    answersTotal: number;
    answersMultiIntentCount: number;
    reuseRatePercent: number;
    confidenceDistribution: {
      high: number;
      medium: number;
      low: number;
    };
    trustTrajectory: {
      improvedProducts: number;
      improvedEvents: number;
    };
    whyThisMatters: string;
  };

  coverage: {
    byIntent: Array<{
      intentType: SearchIntentType;
      label: string;
      answersCount: number;
      productsWithGaps: number;
    }>;
    gaps: Array<{
      intentType: SearchIntentType;
      severity: 'critical' | 'warning' | 'info';
      message: string;
    }>;
    whyThisMatters: string;
  };

  reuse: {
    topReusedAnswers: Array<{
      questionId: string;
      label: string;
      intentsServed: SearchIntentType[];
      productCount: number;
    }>;
    couldBeReusedButArent: Array<{
      questionId: string;
      label: string;
      potentialIntents: SearchIntentType[];
      reason: string;
    }>;
    whyThisMatters: string;
  };

  trustSignals: {
    topBlockers: Array<{
      issueType: string;
      affectedProducts: number;
      severity: 'critical' | 'warning' | 'info';
    }>;
    avgTimeToImproveHours: number | null;
    mostImproved: Array<{
      productId: string;
      productTitle: string;
      beforeConfidence: 'LOW' | 'MEDIUM' | 'HIGH';
      afterConfidence: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
    whyThisMatters: string;
  };

  opportunities: Array<{
    id: string;
    title: string;
    why: string;
    estimatedImpact: 'high' | 'medium' | 'low';
    href: string;
  }>;
}
```

---

## Derivation Logic

### Overview Metrics

| Metric | Source | Computation |
|--------|--------|-------------|
| `productsAnswerReadyCount` | Product + AnswerBlock | Products with at least one High-confidence Answer Block |
| `productsAnswerReadyPercent` | Derived | `(productsAnswerReadyCount / productsTotal) * 100` |
| `answersTotal` | AnswerBlock | Count of all Answer Blocks in project |
| `answersMultiIntentCount` | AnswerBlock + intent mapping | Answer Blocks serving 2+ intents (clarity+structure pass) |
| `reuseRatePercent` | Derived | `(answersMultiIntentCount / answersTotal) * 100` |
| `confidenceDistribution` | AnswerBlock | Aggregate of all Answer Block confidence levels |
| `trustTrajectory` | ProductGeoFixApplication | Count of products/events with improved confidence |

### Coverage by Intent

Coverage is computed using `computeGeoIntentCoverageCounts()`:

1. For each Answer Block, derive mapped intents using `deriveGeoAnswerIntentMapping()`
2. Count answers per intent type
3. Identify missing intents (zero coverage)
4. Generate gaps for intents with low coverage

All 5 SearchIntentTypes must appear in `byIntent`:
- `transactional`
- `comparative`
- `problem_use_case`
- `trust_validation`
- `informational`

### Reuse Metrics

Reuse is computed using `computeGeoReuseStats()`:

1. Count Answer Blocks with 2+ mapped intents
2. Identify canonical multi-intent questions (e.g., `why_choose_this`)
3. Flag answers that could be reused but aren't (structure/clarity issues)

### Trust Trajectory

Trust trajectory tracks confidence improvements over time:

1. Query `ProductGeoFixApplication` records for the project
2. Group by product, identify before/after confidence changes
3. Count products that improved (LOW→MEDIUM, MEDIUM→HIGH, LOW→HIGH)
4. Track total improvement events

---

## Integration with INSIGHTS-1

GEO Insights follows INSIGHTS-1 patterns:

### Read-Only Invariant

```typescript
// GEO Insights uses read-only methods only
const answerBlocks = await this.getAnswerBlocksReadOnly(projectId);
const geoApplications = await this.getGeoFixApplicationsReadOnly(projectId);
```

No AI calls, no mutations, no recomputation during view.

### Trust Messaging

Each section includes `whyThisMatters` explaining the metric's value:

- **Overview**: "Products with High citation confidence are more likely to be cited by AI engines."
- **Coverage**: "Covering multiple search intents increases the chances of appearing in AI-generated answers."
- **Reuse**: "Answers that serve multiple intents reduce duplication and improve consistency."
- **Trust Signals**: "Improving trust blockers directly increases citation confidence."

---

## UI Pages

### GEO Insights Tab

**URL:** `/projects/:projectId/insights/geo-insights`

Displays:
- Overview cards (answer-ready %, confidence distribution)
- Intent coverage chart
- Top reused answers
- Trust trajectory (improved products)
- Opportunities list

### Product GEO Panel

**URL:** `/projects/:projectId/products/:productId` (GEO section)

Displays:
- Product-level readiness signals
- Answer Units with signal evaluations
- Citation confidence badge
- GEO issues with fix buttons

---

## API Endpoints

### GET /projects/:id/insights

Returns full `ProjectInsightsResponse` including `geoInsights` block.

**Authorization:** JWT required, project membership

**Response:**
```json
{
  "projectId": "...",
  "generatedAt": "...",
  "geoInsights": {
    "overview": { ... },
    "coverage": { ... },
    "reuse": { ... },
    "trustSignals": { ... },
    "opportunities": [ ... ]
  }
}
```

---

## Testing

### Unit Tests

`packages/shared/src/geo-types.test.ts`:
- `deriveGeoAnswerIntentMapping()` – intent derivation
- `computeGeoReuseStats()` – reuse metrics
- `computeGeoIntentCoverageCounts()` – coverage counts

### Integration Tests

`apps/api/test/integration/geo-insights-2.test.ts`:
- Full `geoInsights` response shape validation
- All 5 intents present in `byIntent`
- Trust trajectory reflects `ProductGeoFixApplication` records

### E2E Seed

```bash
curl -X POST http://localhost:3001/testkit/e2e/seed-geo-insights-2
```

Creates test data for GEO Insights validation.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-19 | Initial GEO Insights documentation (GEO-INSIGHTS-2) |
