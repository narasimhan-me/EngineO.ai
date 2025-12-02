import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  DEO_SCORE_VERSION,
  DeoScoreBreakdown,
  DeoScoreLatestResponse,
  DeoScoreSignals,
  DeoScoreSnapshot as DeoScoreSnapshotDto,
  computeDeoScoreFromSignals,
  computePlaceholderDeoScore,
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

    let snapshot = await prisma.deoScoreSnapshot.findFirst({
      where: { projectId },
      orderBy: { computedAt: 'desc' },
    });

    // Auto-create placeholder snapshot if none exists
    if (!snapshot) {
      const created = await this.createPlaceholderSnapshotForProject(projectId);
      snapshot = await prisma.deoScoreSnapshot.findUnique({
        where: { id: created.id },
      });
    }

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
   * Placeholder entry point for future DEO score computation.
   *
   * For now, this creates a simple snapshot with a fixed overall score
   * and updates the denormalized current_deo_score fields on Project.
   *
   * Note: This method does NOT check ownership - it is intended to be called
   * from background workers. Ownership should be validated at the API layer.
   */
  async createPlaceholderSnapshotForProject(
    projectId: string,
  ): Promise<DeoScoreSnapshotDto> {
    const prisma = this.prisma as any;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const breakdown = computePlaceholderDeoScore();
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

  /**
   * Compute DEO score breakdown from normalized signals.
   *
   * This method is not yet used in production flows; it exists to define
   * the contract for future phases where real signals will be passed in.
   */
  async computeAndPersistScoreFromSignals(
    projectId: string,
    signals: DeoScoreSignals,
  ): Promise<DeoScoreBreakdown> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const version = DEO_SCORE_VERSION;
    const breakdown = computeDeoScoreFromSignals(signals);

    // TODO (future phase): persist using the same path as createPlaceholderSnapshotForProject:
    // - Insert a DeoScoreSnapshot row
    // - Update Project.currentDeoScore / currentDeoScoreComputedAt

    return breakdown;
  }
}
