import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  DEO_SCORE_VERSION,
  DeoScoreBreakdown,
  DeoScoreLatestResponse,
  DeoScoreSignals,
  DeoScoreSnapshot as DeoScoreSnapshotDto,
  computeDeoScoreFromSignals,
} from '@engineo/shared';

@Injectable()
export class DeoScoreService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get the latest DEO score snapshot for a project,
   * with ownership validation.
   */
  async getLatestForProject(projectId: string, userId: string): Promise<DeoScoreLatestResponse> {
    const prisma = this.prisma as any;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const snapshot = await prisma.deoScoreSnapshot.findFirst({
      where: { projectId },
      orderBy: { computedAt: 'desc' },
    });

    if (!snapshot) {
      return {
        projectId,
        latestScore: null,
        latestSnapshot: null,
      };
    }

    const breakdown: DeoScoreBreakdown = {
      overall: snapshot.overallScore,
      content: snapshot.contentScore,
      entities: snapshot.entityScore,
      technical: snapshot.technicalScore,
      visibility: snapshot.visibilityScore,
    };

    const latestSnapshot: DeoScoreSnapshotDto = {
      id: snapshot.id,
      projectId,
      version: snapshot.version,
      computedAt: snapshot.computedAt.toISOString(),
      breakdown,
      metadata: (snapshot.metadata as Record<string, unknown> | null) ?? undefined,
    };

    return {
      projectId,
      latestScore: breakdown,
      latestSnapshot,
    };
  }

  /**
   * Compute DEO score breakdown from normalized signals and persist as snapshot.
   *
   * This is the v1 scoring engine entry point, used by the recompute worker.
   */
  async computeAndPersistScoreFromSignals(
    projectId: string,
    signals: DeoScoreSignals,
  ): Promise<DeoScoreSnapshotDto> {
    const prisma = this.prisma as any;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const breakdown = computeDeoScoreFromSignals(signals);
    const now = new Date();

    const created = await prisma.deoScoreSnapshot.create({
      data: {
        projectId,
        overallScore: breakdown.overall,
        contentScore: breakdown.content ?? null,
        entityScore: breakdown.entities ?? null,
        technicalScore: breakdown.technical ?? null,
        visibilityScore: breakdown.visibility ?? null,
        version: DEO_SCORE_VERSION,
        metadata: {},
        computedAt: now,
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: {
        currentDeoScore: breakdown.overall,
        currentDeoScoreComputedAt: now,
      },
    });

    return {
      id: created.id,
      projectId,
      version: created.version,
      computedAt: created.computedAt.toISOString(),
      breakdown,
      metadata: (created.metadata as Record<string, unknown> | null) ?? undefined,
    };
  }
}

/**
 * Stub service that collects DEO signals for a project.
 *
 * Phase 2.2: Returns hardcoded signals in the 0.4–0.8 range.
 * Phase 2.3+: Will integrate with real data sources (crawl, analytics, etc.).
 */
@Injectable()
export class DeoSignalsService {
  /**
   * Collect all signals needed for DEO score computation.
   *
   * Phase 2.2: Returns stub values for testing the scoring engine.
   */
  async collectSignalsForProject(_projectId: string): Promise<DeoScoreSignals> {
    // Stub signals for Phase 2.2 – hardcoded values in realistic range
    return {
      // Content signals
      contentCoverage: 0.65,
      contentDepth: 0.55,
      contentFreshness: 0.70,

      // Entity signals
      entityCoverage: 0.60,
      entityAccuracy: 0.75,
      entityLinkage: 0.50,

      // Technical signals
      crawlHealth: 0.80,
      coreWebVitals: 0.65,
      indexability: 0.70,

      // Visibility signals
      serpPresence: 0.45,
      answerSurfacePresence: 0.40,
      brandNavigationalStrength: 0.55,
    };
  }
}
