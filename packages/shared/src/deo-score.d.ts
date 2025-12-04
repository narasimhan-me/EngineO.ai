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
    computedAt: string;
    breakdown: DeoScoreBreakdown;
    metadata?: Record<string, unknown>;
};
export type DeoScoreLatestResponse = {
    projectId: string;
    latestScore: DeoScoreBreakdown | null;
    latestSnapshot: DeoScoreSnapshot | null;
};
export type DeoScoreSignals = {
    contentCoverage?: number | null;
    contentDepth?: number | null;
    contentFreshness?: number | null;
    entityCoverage?: number | null;
    entityAccuracy?: number | null;
    entityLinkage?: number | null;
    crawlHealth?: number | null;
    coreWebVitals?: number | null;
    indexability?: number | null;
    serpPresence?: number | null;
    answerSurfacePresence?: number | null;
    brandNavigationalStrength?: number | null;
    htmlStructuralQuality?: number | null;
    thinContentQuality?: number | null;
    entityHintCoverage?: number | null;
    entityStructureAccuracy?: number | null;
    entityLinkageDensity?: number | null;
};
export declare function computePlaceholderDeoScore(): DeoScoreBreakdown;
