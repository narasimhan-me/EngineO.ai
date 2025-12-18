# DEO Pillars Reference

This document defines the canonical 8-pillar DEO (Discovery Engine Optimization) model used throughout EngineO.ai.

## Overview

DEO is a framework for optimizing content visibility across AI-powered discovery engines (ChatGPT, Perplexity, Google AI Overviews, etc.). Unlike traditional SEO which focuses on link-based ranking, DEO focuses on making content understandable and trustworthy for AI systems.

The 8 pillars represent distinct aspects of discovery optimization, each with specific signals, issues, and optimization paths.

## The 8 DEO Pillars

### 1. Metadata & Snippet Quality
**ID:** `metadata_snippet_quality`
**Short Name:** Metadata

Covers SEO titles, meta descriptions, Open Graph tags, and how content appears in search snippets and social shares.

**Why it matters:** Metadata is the first thing discovery engines see. Clear, accurate metadata helps AI understand and surface your content correctly.

**Key signals:**
- SEO title presence and quality
- Meta description presence and length
- Open Graph completeness
- Structured data accuracy

**Issue types:**
- Missing SEO title
- Missing SEO description
- Truncated metadata
- Duplicate metadata

---

### 2. Content & Commerce Signals
**ID:** `content_commerce_signals`
**Short Name:** Content

Covers on-page content quality, product descriptions, Answer Blocks, and content freshness.

**Why it matters:** AI engines prioritize content that directly answers user questions. Rich, structured product content is essential for commerce visibility.

**Key signals:**
- Product description depth
- Answer Block coverage
- Content uniqueness
- FAQ presence

**Issue types:**
- Thin product descriptions
- Missing Answer Blocks
- Duplicate content
- Stale content

---

### 3. Media & Accessibility
**ID:** `media_accessibility`
**Short Name:** Media

Covers image alt text, video transcripts, and accessibility compliance.

**Why it matters:** AI systems rely on alt text and transcripts to understand visual content. Accessible media is also surfaced more reliably.

**Key signals:**
- Alt text coverage
- Image quality and optimization
- Video transcript availability
- Accessibility score

**Issue types:**
- Missing alt text
- Generic alt text
- Unoptimized images
- Missing video transcripts

---

### 4. Search & Intent Fit
**ID:** `search_intent_fit`
**Short Name:** Search Intent

Covers keyword targeting, search intent alignment, and topic coverage.

**Why it matters:** Understanding and matching user intent determines whether your content gets surfaced for relevant queries.

**Key signals:**
- Keyword-to-content alignment
- Search volume coverage
- Intent match score
- Topic completeness

**Issue types:**
- Intent mismatch
- Missing high-value keywords
- Topic gaps

---

### 5. Competitive Positioning
**ID:** `competitive_positioning`
**Short Name:** Competitors

Covers competitor analysis, share of voice, and relative positioning.

**Why it matters:** Understanding competitive landscape helps identify gaps and opportunities in AI-powered discovery.

**Key signals:**
- Share of voice
- Competitor content gaps
- Feature parity
- Ranking position

**Issue types:**
- Competitor outranking
- Feature gaps
- Market share loss

---

### 6. Off-site Signals
**ID:** `offsite_signals`
**Short Name:** Off-site

Covers backlinks, citations, mentions, and external authority signals.

**Why it matters:** External signals help AI systems assess trustworthiness and authority of content sources.

**Key signals:**
- Backlink quality
- Brand mentions
- Citation frequency
- Domain authority

**Issue types:**
- Low authority signals
- Negative mentions
- Citation gaps

---

### 7. Local Discovery
**ID:** `local_discovery`
**Short Name:** Local

Covers local SEO, Google Business Profile, and location-based signals.

**Why it matters:** For businesses with physical presence, local signals determine visibility in "near me" and location-based AI queries.

**Key signals:**
- GMB completeness
- NAP consistency
- Local review signals
- Location relevance

**Issue types:**
- Incomplete GMB profile
- NAP inconsistencies
- Missing local content

---

### 8. Technical & Indexability
**ID:** `technical_indexability`
**Short Name:** Technical

Covers Core Web Vitals, crawl health, indexability status, and technical SEO foundations.

**Why it matters:** Technical issues can prevent discovery engines from crawling and indexing your content at all.

**Key signals:**
- Core Web Vitals (LCP, FID, CLS)
- Crawl success rate
- Index coverage
- Mobile-friendliness

**Issue types:**
- Slow page speed
- Crawl errors
- Indexability blocks
- Mobile usability issues

---

## Issue Actionability

Each DEO issue is classified by how it can be resolved:

| Actionability | Description |
|---------------|-------------|
| `manual` | Requires manual human intervention to fix |
| `automation` | Can be fixed automatically via playbooks/rules |
| `informational` | Insight only, no direct fix available |

## Using Pillars in the UI

Pillars serve as the primary organizational model for:

1. **DEO Overview page** - Shows pillar scorecards and health status
2. **Issues Engine** - Groups issues by pillar with filtering
3. **Product workspace** - Maps product-level issues to pillars
4. **Navigation** - Pillar workspaces accessible from sidebar

## Source of Truth

The canonical pillar definitions are maintained in:
```
packages/shared/src/deo-pillars.ts
```

All pillar references throughout the codebase should derive from this single source.
