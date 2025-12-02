export type DeoScoreBreakdown = {
  overall: number;
  content?: number | null;
  entities?: number | null;
  technical?: number | null;
  visibility?: number | null;
};

export type DeoScoreSnapshot = {
  id: string;
  projectId: string;
  version: string;
  computedAt: string; // ISO timestamp
  breakdown: DeoScoreBreakdown;
  metadata?: Record<string, unknown>;
};

export type DeoScoreLatestResponse = {
  projectId: string;
  latestScore: DeoScoreBreakdown | null;
  latestSnapshot: DeoScoreSnapshot | null;
};

export type DeoScoreSignals = {
  // Content quality & coverage
  contentCoverage?: number | null; // 0–1, fraction of critical intents covered
  contentDepth?: number | null; // 0–1, depth/quality of answers
  contentFreshness?: number | null; // 0–1, recency of key content

  // Entities & knowledge graph
  entityCoverage?: number | null; // 0–1, fraction of key entities modeled
  entityAccuracy?: number | null; // 0–1, correctness of entity facts/schemas
  entityLinkage?: number | null; // 0–1, internal cross-link and schema linking

  // Technical & crawl
  crawlHealth?: number | null; // 0–1, crawl success rate / errors
  coreWebVitals?: number | null; // 0–1, LCP/FID/CLS normalized
  indexability?: number | null; // 0–1, indexability of critical URLs

  // Visibility (SEO / AEO / PEO / VEO)
  serpPresence?: number | null; // 0–1, presence in organic results/snippets
  answerSurfacePresence?: number | null; // 0–1, presence in AI/assistant answers
  brandNavigationalStrength?: number | null; // 0–1, brand queries success
};

