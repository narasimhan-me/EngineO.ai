import {
  DEO_SCORE_VERSION,
  DEO_SCORE_WEIGHTS,
  type DeoScoreComponents,
} from './deo-score-config';
import { type DeoScoreBreakdown, type DeoScoreSignals } from './deo-score';

/**
 * Normalize a 0–1 score into 0–100, with a safe fallback.
 */
function normalize01To100(value: number | null | undefined): number {
  if (value == null || Number.isNaN(value)) return 0;
  const clamped = Math.max(0, Math.min(1, value));
  return Math.round(clamped * 100);
}

/**
 * Helper: average a list of optional 0–1 scores, ignoring null/undefined.
 * Returns null if no usable values.
 */
function averageNullable(values: Array<number | null | undefined>): number | null {
  const valid = values.filter((v): v is number => v != null && !Number.isNaN(v));
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, v) => acc + v, 0);
  return sum / valid.length;
}

/**
 * Compute component scores (0–100) from raw DEO signals.
 * This is a simple v1 heuristics-based model.
 */
export function computeDeoComponentsFromSignals(
  signals: DeoScoreSignals,
): DeoScoreComponents {
  // Content: coverage, depth, freshness
  const content = normalize01To100(
    averageNullable([
      signals.contentCoverage,
      signals.contentDepth,
      signals.contentFreshness,
    ]),
  );

  // Entities: coverage, accuracy, linkage
  const entities = normalize01To100(
    averageNullable([
      signals.entityCoverage,
      signals.entityAccuracy,
      signals.entityLinkage,
    ]),
  );

  // Technical: crawl health, CWV, indexability
  const technical = normalize01To100(
    averageNullable([
      signals.crawlHealth,
      signals.coreWebVitals,
      signals.indexability,
    ]),
  );

  // Visibility: SERP, answer surfaces, brand
  const visibility = normalize01To100(
    averageNullable([
      signals.serpPresence,
      signals.answerSurfacePresence,
      signals.brandNavigationalStrength,
    ]),
  );

  return { content, entities, technical, visibility };
}

/**
 * Compute overall DEO score and breakdown from signals using DEO_SCORE_WEIGHTS.
 */
export function computeDeoScoreFromSignals(
  signals: DeoScoreSignals,
): DeoScoreBreakdown {
  const components = computeDeoComponentsFromSignals(signals);

  const overall = Math.round(
    components.content * DEO_SCORE_WEIGHTS.content +
      components.entities * DEO_SCORE_WEIGHTS.entities +
      components.technical * DEO_SCORE_WEIGHTS.technical +
      components.visibility * DEO_SCORE_WEIGHTS.visibility,
  );

  return {
    overall,
    content: components.content,
    entities: components.entities,
    technical: components.technical,
    visibility: components.visibility,
  };
}

export { DEO_SCORE_VERSION };

