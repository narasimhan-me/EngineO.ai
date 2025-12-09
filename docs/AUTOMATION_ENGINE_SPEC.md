# Automation Engine Specification (Phase AE-1 Framework)

> Canonical technical and product specification for the Automation Engine platform layer.

---

## 1. Purpose & Vision

### What is the Automation Engine?

The Automation Engine is the "DEO autopilot" — a platform layer that powers intelligent, automated improvements across all EngineO.ai systems. It is designed to:

1. **Detect** when something needs improvement (missing metadata, stale answers, low DEO signals)
2. **Decide** whether an automation should run (based on entitlements, limits, and safety rules)
3. **Execute** improvements or schedule them for review
4. **Log** all actions with clear audit trails for transparency and debugging

### Platform Layer

The Automation Engine is not a standalone feature but a platform layer that powers automations across:

| System | Automation Examples |
|--------|---------------------|
| **Product & Content Workspaces** | Auto-generate metadata for thin content |
| **Answer Engine** | Auto-refresh Answer Blocks after product changes |
| **Issues Engine** | Auto-fix or suggest fixes for detected issues |
| **Entities System** | Auto-enrich entity definitions from crawl data |
| **DEO Score Pipeline** | Auto-recompute scores after significant changes |
| **Crawl Pipeline** | Auto-recrawl high-impact pages on schedule |
| **Shopify Sync** | Auto-apply metadata changes to Shopify metafields |

### Design Principles

- **Safety First:** Never corrupt data; always log actions; support rollback
- **Entitlement-Aware:** Respect plan limits and daily caps
- **Transparent:** Users can see what automations did and why
- **Configurable:** Users control which automations run and how

---

## 2. Automation Types

### Classification by Kind

The Automation Engine classifies automations into three kinds based on timing and trigger behavior:

| Kind | Description | Examples |
|------|-------------|----------|
| **Immediate** | Reactive, event-triggered automations that run as soon as a trigger occurs | Auto-generate metadata on new product sync, refresh DEO Score after crawl |
| **Scheduled** | Proactive automations that run on cadences (daily/weekly/monthly) | Weekly re-crawl of high-impact pages, monthly structured data refresh |
| **Background** | Low-noise, continuous improvements that run opportunistically | Fill missing alt text, detect low visibility signals |

### Target Surfaces

Automations can target different surfaces in the system:

| Target Surface | Description |
|----------------|-------------|
| `product` | Shopify products and their metadata |
| `page` | Non-product pages (content pages, blog posts) |
| `answer_block` | Answer Engine Answer Blocks |
| `entity` | Entity definitions and enrichments |
| `project` | Project-level settings and configurations |
| `deo_score` | DEO Score computations and snapshots |

### Type Mapping

These concepts map directly to the shared types in `@engineo/shared`:

```typescript
import {
  AutomationKind,        // 'immediate' | 'scheduled' | 'background'
  AutomationTargetSurface,
  AutomationRuleId,
  AutomationRuleConfig,
} from '@engineo/shared';
```

---

## 3. Decision Framework

### Lifecycle: Trigger → Evaluate → Execute → Log

Every automation follows a four-stage lifecycle:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Trigger   │ --> │  Evaluate   │ --> │   Execute   │ --> │     Log     │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

#### Stage 1: Trigger

Triggers are events that initiate automation evaluation:

| Trigger Type | Source | Example |
|--------------|--------|---------|
| `crawl_completed` | Crawl Pipeline | Crawl finished for a project |
| `product_synced` | Shopify Sync | New product synced from Shopify |
| `issue_detected` | Issues Engine | New DEO issue detected |
| `schedule` | Scheduler | Daily/weekly/monthly cadence |
| `manual` | User Action | User clicks "Run Automations" |
| `drift_detected` | Answer Engine | Content drift detected for answers |

#### Stage 2: Evaluate

The evaluation stage determines whether the automation should run:

1. **Entitlements Check**
   - Query `EntitlementsService` for plan capabilities
   - Check if automation category is allowed for the plan
   - Reference: `docs/ENTITLEMENTS_MATRIX.md`

2. **Daily Cap Check**
   - Count executions for this rule today
   - Compare against `maxExecutionsPerDay` limits
   - Respect both per-project and per-rule caps

3. **Settings Check**
   - Is automation enabled for this project?
   - Is this category enabled in project settings?
   - Is the mode `auto_apply` or `review_before_apply`?

4. **Time-Based Check**
   - Has this rule run too recently?
   - Is it the right time for scheduled automations?

5. **Safety Check**
   - Are there any blockers or conflicts?
   - Would this automation exceed token/AI limits?

#### Stage 3: Execute

If evaluation passes, the automation executes:

- **Auto-Apply Mode:** Directly applies changes via existing subsystems
- **Review Mode:** Creates suggestions for user review (current behavior)

Execution delegates to existing services:

| Automation | Delegated To |
|------------|--------------|
| Metadata generation | `AutomationService.scheduleSuggestionsForProject` |
| Shopify sync | `ShopifyMetadataService.syncMetadata` |
| Answer refresh | Answer Engine (future) |
| DEO recompute | `DeoScoreService.computeScore` |

#### Stage 4: Log

Every automation run is logged with:

- **Status:** pending, running, succeeded, failed, skipped
- **Context:** trigger info, target surface, target ID
- **Result:** summary of what happened
- **Snapshots:** optional before/after state for audit

### Current Implementation (v0)

The existing `AutomationService.scheduleSuggestionsForProject` and `AutomationSuggestion` model represent **Automation Engine v0**:

- Triggered after crawls complete
- Generates metadata suggestions for products
- Creates `AutomationSuggestion` records for user review

Phase AE-1 standardizes this into a unified framework without migrating all implementations yet.

---

## 4. Schema-Level Concepts

### Core Conceptual Structures

Phase AE-1 defines three core data structures (conceptual; no Prisma models yet):

#### AutomationRule

Defines what triggers an automation, its conditions, and actions:

```typescript
interface AutomationRule {
  id: AutomationRuleId;
  projectId: string;
  name: string;
  description: string;
  config: AutomationRuleConfig;
  createdAt: string;
  updatedAt: string;
}
```

#### AutomationRun (Execution Log)

Captures status, snapshots, and reasons for skip/failure:

```typescript
interface AutomationRun {
  id: string;
  projectId: string;
  ruleId: AutomationRuleId;
  context: AutomationRunContext;
  status: AutomationExecutionStatus;
  resultSummary?: string;
  reasonSkipped?: string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
  startedAt: string;
  finishedAt?: string;
}
```

#### AutomationSettings

Per-project toggles and modes:

```typescript
interface AutomationSettings {
  projectId: string;
  enabled: boolean;
  mode: 'auto_apply' | 'review_before_apply';
  categories: AutomationCategories;
  maxExecutionsPerDay: number;
}
```

### Relationship to Implementation Plan

- **Phase 12 (Automation Engine Full):** Will introduce Prisma models for AutomationRule, AutomationRun
- **Phase 17 (Advanced Automations):** Will add cross-system automation orchestration
- **Phase AE-1 (This Spec):** Reconciles earlier concepts into a unified Automation Engine spec

---

## 5. Integration with Existing Systems

### Crawl Pipeline

After crawls finish, the pipeline already calls `AutomationService.scheduleSuggestionsForProject`:

- Phase AE-1 treats this as specific immediate automation rules:
  - `AUTO_GENERATE_METADATA_FOR_MISSING_METADATA`
  - `AUTO_GENERATE_METADATA_FOR_THIN_CONTENT`

### Issues Engine

Future integration will allow:

- Automation rules attached to fix issue types
- Auto-fix for AI-fixable issues (e.g., missing SEO title)
- Suggestion generation for manual-fix issues

### Answer Engine

Future rules (Phase AE-5) will:

- Auto-generate Answer Blocks after product sync
- Refresh Answer Blocks when content drift is detected
- Regenerate low-confidence answers

### DEO Score

Future rules (Phase AE-3) will:

- Auto-recompute DEO Score after significant changes
- Surface freshness states and stale score warnings
- Trigger score refresh on schedule

### Shopify Sync

Future rules (Phase AE-2) will:

- Auto-apply metadata to Shopify metafields
- Sync Answer Blocks to custom metafields
- Constrain sync by entitlements and daily caps

---

## 6. Entitlements & Limits

### Plan Interactions

Automation Engine behavior is constrained by plan entitlements:

| Plan | Automation Capabilities |
|------|------------------------|
| **Free** | Reactive metadata-only automations, very limited daily cap, no scheduled/background |
| **Pro** | Reactive + scheduled automations, moderate daily caps, Shopify metadata auto-sync |
| **Business** | Full Automation Engine: all kinds, all surfaces, higher/uncapped executions |

### Entitlement References

- **Plan Limits:** `docs/ENTITLEMENTS_MATRIX.md` (Section 4.4 Automations)
- **Token Accounting:** `docs/TOKEN_USAGE_MODEL.md` for AI-powered automation costs
- **Daily Caps:** `automationSuggestionsPerDay` and future `automationExecutionsPerDay`

### Entitlement Enforcement

All automation rules must:

1. Query `EntitlementsService` before AI-powered actions
2. Respect token limits from `TokenUsageService`
3. Check daily execution caps before running
4. Skip (with logged reason) when limits are reached

---

## 7. Phasing Roadmap

### AE Phase Sequence

| Phase | Focus | Deliverables |
|-------|-------|--------------|
| **AE-1** | Framework | Shared types, spec, decision model, critical path docs |
| **AE-2** | Product Automation Library | Metadata rules, drift detection, Shopify sync |
| **AE-3** | DEO Score Automations | Score refresh, freshness, triggers |
| **AE-4** | Issues Engine Automations | Auto-fix, suggestion generation |
| **AE-5** | Answer Engine Automations | Answer Block generation, refresh |
| **AE-6** | Automation Center UI | Settings UI, activity log, controls |

### AE-1 Scope (This Phase)

Phase AE-1 is **documentation + model + framework types only**:

- ✅ Shared Automation Engine types in `@engineo/shared`
- ✅ Canonical spec document (this file)
- ✅ System-level and phase manual testing docs
- ✅ Critical path registration (CP-012)
- ✅ Entitlements and token usage doc updates

**Not in AE-1:**

- ❌ New Prisma models for AutomationRule/AutomationRun
- ❌ New API endpoints
- ❌ Changes to existing automation suggestions behavior
- ❌ UI implementation

---

## 8. Security & Safety

### Non-Destructive Behavior

- Automations must never corrupt or destroy data
- Failed automations must log errors and stop gracefully
- Before/after snapshots enable audit and rollback

### Rate Limiting

- Automations respect global and per-project rate limits
- AI-powered automations respect token quotas
- Scheduled automations have built-in frequency limits

### Transparency

- All automation runs are logged
- Users can see what automations did and why
- Skip reasons are recorded for debugging

---

## 9. Acceptance Criteria (Phase AE-1 Framework)

- [ ] `packages/shared/src/automation-engine.ts` created with all types
- [ ] Types exported from `@engineo/shared`
- [ ] Shared package builds successfully
- [ ] `docs/AUTOMATION_ENGINE_SPEC.md` created (this document)
- [ ] `docs/testing/automation-engine.md` created
- [ ] `docs/manual-testing/phase-ae-1-automation-engine-foundations.md` created
- [ ] `docs/testing/CRITICAL_PATH_MAP.md` updated with CP-012
- [ ] `docs/ENTITLEMENTS_MATRIX.md` updated with Automation Engine details
- [ ] `docs/TOKEN_USAGE_MODEL.md` updated with automation source labels
- [ ] `docs/ARCHITECTURE.md` updated with Automation Engine references
- [ ] `IMPLEMENTATION_PLAN.md` updated with Phase AE-1 Automation section

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-08 | Initial Automation Engine specification (Phase AE-1 Framework) |
