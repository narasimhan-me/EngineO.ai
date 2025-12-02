// packages/shared/src/deo-score-config.ts

// Versioned DEO Score model
export const DEO_SCORE_VERSION = 'v1';

// Weighting for each component score. Must sum to 1.0.
export const DEO_SCORE_WEIGHTS = {
  content: 0.3,
  entities: 0.25,
  technical: 0.25,
  visibility: 0.2,
} as const;

export type DeoScoreComponentKey = keyof typeof DEO_SCORE_WEIGHTS;

export type DeoScoreComponents = {
  content: number; // 0–100
  entities: number; // 0–100
  technical: number; // 0–100
  visibility: number; // 0–100
};

