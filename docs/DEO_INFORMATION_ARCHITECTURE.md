# DEO Information Architecture

This document describes the information architecture for DEO (Discovery Engine Optimization) in EngineO.ai, establishing UX contracts and navigation patterns.

## Core Principles

### 1. Pillar-Centric Organization
All DEO issues, signals, and optimization paths are organized by the 8 canonical pillars. Users can navigate by pillar to focus on specific optimization areas.

### 2. Separation of Concerns
**Metadata status** (title/description presence) is distinct from **overall DEO health**. A product can have "Metadata optimized" while still having DEO issues in other pillars like Media or Content.

### 3. Deep Linking
All major views support URL-based filtering and navigation:
- `?pillar=metadata_snippet_quality` - Filter by pillar
- `?focus=metadata` - Scroll to metadata section
- `?focus=deo-issues` - Scroll to issues section

## Navigation Structure

```
Project Overview
├── DEO Overview (pillar scorecards)
├── Products (product catalog)
│   └── Product Workspace
│       ├── Metadata section
│       ├── Answer Blocks section
│       └── DEO Issues section
├── Metadata (pillar workspace placeholder)
├── Content (content pages + pillar context)
├── Media (pillar workspace placeholder)
├── Search & Intent (pillar workspace placeholder)
├── Competitors (pillar workspace placeholder)
├── Off-site Signals (pillar workspace placeholder)
├── Local Discovery (pillar workspace placeholder)
├── Technical (pillar workspace)
├── Automation (playbook management)
└── Settings
```

## Key Pages

### DEO Overview (`/projects/[id]/deo`)
Central hub showing:
- Overall DEO health summary
- Issue counts per pillar
- Pillar scorecards with links to filtered Issues Engine
- Quick access to pillar workspaces

### Issues Engine (`/projects/[id]/issues`)
Master issue list with:
- Pillar filter (always visible)
- Severity filter
- Issue cards with fix actions
- Deep links to product workspaces

### Products Page (`/projects/[id]/products`)
Product catalog with:
- **Metadata status** filter (separate from DEO health)
- Issue badge on each row showing DEO issue count
- Quick access to product workspace

### Product Workspace (`/projects/[id]/products/[productId]`)
Individual product optimization with:
- Metadata section (SEO title, description)
- Answer Blocks section
- DEO Issues section (scrollable target)
- Status indicators for both metadata AND broader DEO issues

## UX Contracts

### IssueBadge
- Shows issue count and max severity
- Always says "X DEO issues" (not just "issues")
- Clickable when `onClick` provided
- Links to product workspace with `?focus=deo-issues`

### ProductRow
- Status labels say "Metadata optimized/needs work/missing"
- Issue badge visible even when metadata is optimized
- Clicking badge opens product workspace at DEO issues section

### ProductDeoInsightsPanel
- Header says "Metadata & Content Status"
- Shows warning when metadata OK but DEO issues exist:
  > "Metadata is optimized but this product has DEO issues. Review the issues below."

### Pillar Filter
- Always shows "All pillars" option first
- Shows issue count per pillar
- Updates URL with `?pillar=X` parameter
- Preserves other query params

## Deep Linking Patterns

### Focus Parameters
| Parameter | Target Section |
|-----------|----------------|
| `?focus=metadata` | Scroll to metadata section |
| `?focus=deo-issues` | Scroll to DEO issues section |
| `?focus=answer-blocks` | Scroll to Answer Blocks section |

### Filter Parameters
| Parameter | Effect |
|-----------|--------|
| `?pillar=X` | Filter issues by pillar ID |
| `?from=products` | Show back navigation to products |
| `?from=issues` | Show back navigation to issues |

### Combined Examples
```
/projects/123/products/456?focus=metadata
  → Open product, scroll to metadata

/projects/123/products/456?focus=deo-issues&from=products
  → Open product, scroll to issues, show "Back to Products"

/projects/123/issues?pillar=media_accessibility
  → Open issues filtered to Media pillar
```

## Status vs Health Model

### Product Status (Metadata)
A product's **status** refers only to metadata completeness:
- `optimized` - Has SEO title AND description
- `needs-optimization` - Has one but not both
- `missing` - Has neither

### Product DEO Health
A product's **DEO health** considers all pillars:
- Issue count across all pillars
- Maximum severity of issues
- May have issues even with optimized metadata

### Visual Treatment
- Status chip: "Metadata optimized/needs work/missing"
- Issue badge: "X DEO issues" with severity color
- Both are always visible (not mutually exclusive)

## Implementation Files

| Component | File |
|-----------|------|
| Pillar definitions | `packages/shared/src/deo-pillars.ts` |
| Issue types | `packages/shared/src/deo-issues.ts` |
| Issue builders | `apps/api/src/projects/deo-issues.service.ts` |
| Issues list | `apps/web/src/components/issues/IssuesList.tsx` |
| Issue badge | `apps/web/src/components/issues/IssueBadge.tsx` |
| Product row | `apps/web/src/components/products/ProductRow.tsx` |
| DEO Overview | `apps/web/src/app/projects/[id]/deo/page.tsx` |
| Issues page | `apps/web/src/app/projects/[id]/issues/page.tsx` |
