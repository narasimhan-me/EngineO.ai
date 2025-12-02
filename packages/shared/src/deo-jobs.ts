// packages/shared/src/deo-jobs.ts

export type DeoScoreJobPayload = {
  projectId: string;
  triggeredByUserId?: string | null;
  reason?: string | null; // manual | scheduled | after_import
};

export type DeoScoreJobResult = {
  projectId: string;
  snapshotId: string;
};
