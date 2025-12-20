import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ProjectInsightsService, ProjectInsightsResponse } from './project-insights.service';

/**
 * [GEO-EXPORT-1] GEO Report Assembly and Share Link Service
 *
 * Assembles GEO report data for export/share and manages share links.
 * All data is read-only and derived from existing insights.
 */

export interface GeoReportData {
  projectId: string;
  projectName: string;
  generatedAt: string;

  overview: {
    productsAnswerReadyPercent: number;
    productsAnswerReadyCount: number;
    productsTotal: number;
    answersTotal: number;
    reuseRatePercent: number;
    confidenceDistribution: {
      high: number;
      medium: number;
      low: number;
    };
  };

  coverage: {
    byIntent: Array<{
      intentType: string;
      label: string;
      productsCovered: number;
      productsTotal: number;
      coveragePercent: number;
    }>;
    gaps: string[];
    summary: string;
  };

  trustSignals: {
    topBlockers: Array<{
      label: string;
      affectedProducts: number;
    }>;
    avgTimeToImproveHours: number | null;
    summary: string;
  };

  opportunities: Array<{
    title: string;
    why: string;
    estimatedImpact: 'high' | 'medium' | 'low';
    category: 'coverage' | 'reuse' | 'trust';
  }>;

  disclaimer: string;
}

export interface ShareLinkResponse {
  id: string;
  shareToken: string;
  shareUrl: string;
  title: string | null;
  expiresAt: string;
  createdAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface PublicShareViewResponse {
  status: 'valid' | 'expired' | 'revoked' | 'not_found';
  report?: GeoReportData;
  expiresAt?: string;
  generatedAt?: string;
}

const DEFAULT_EXPIRY_DAYS = 14;

const DISCLAIMER_TEXT =
  'These metrics reflect internal content readiness signals. Actual citations by AI systems depend on many factors outside your control.';

@Injectable()
export class GeoReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectInsightsService: ProjectInsightsService,
  ) {}

  /**
   * Assemble GEO report data for export/print
   * Uses existing insights endpoint - no new queries
   */
  async assembleReport(projectId: string, userId: string): Promise<GeoReportData> {
    // Get project name
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, userId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Get insights data (already authorized)
    const insights = await this.projectInsightsService.getProjectInsights(projectId, userId);
    const geo = insights.geoInsights;

    // Transform to export-safe format (no internal IDs, no hrefs)
    return {
      projectId,
      projectName: project.name,
      generatedAt: new Date().toISOString(),

      overview: {
        productsAnswerReadyPercent: geo.overview.productsAnswerReadyPercent,
        productsAnswerReadyCount: geo.overview.productsAnswerReadyCount,
        productsTotal: geo.overview.productsTotal,
        answersTotal: geo.overview.answersTotal,
        reuseRatePercent: geo.overview.reuseRatePercent,
        confidenceDistribution: geo.overview.confidenceDistribution,
      },

      coverage: {
        byIntent: geo.coverage.byIntent.map((intent) => ({
          intentType: intent.intentType,
          label: intent.label,
          productsCovered: intent.productsCovered,
          productsTotal: intent.productsTotal,
          coveragePercent: intent.coveragePercent,
        })),
        gaps: geo.coverage.gaps,
        summary: geo.coverage.whyThisMatters,
      },

      trustSignals: {
        topBlockers: geo.trustSignals.topBlockers.map((blocker) => ({
          label: blocker.label,
          affectedProducts: blocker.affectedProducts,
        })),
        avgTimeToImproveHours: geo.trustSignals.avgTimeToImproveHours,
        summary: geo.trustSignals.whyThisMatters,
      },

      opportunities: geo.opportunities.map((opp) => ({
        title: opp.title,
        why: opp.why,
        estimatedImpact: opp.estimatedImpact,
        category: opp.category,
      })),

      disclaimer: DISCLAIMER_TEXT,
    };
  }

  /**
   * Create a shareable link for the GEO report
   */
  async createShareLink(
    projectId: string,
    userId: string,
    title?: string,
  ): Promise<ShareLinkResponse> {
    // Verify access
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const shareLink = await this.prisma.geoReportShareLink.create({
      data: {
        projectId,
        title: title || null,
        expiresAt,
        generatedAt: now,
        createdByUserId: userId,
      },
    });

    return this.formatShareLinkResponse(shareLink);
  }

  /**
   * List all share links for a project
   */
  async listShareLinks(projectId: string, userId: string): Promise<ShareLinkResponse[]> {
    // Verify access
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const links = await this.prisma.geoReportShareLink.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return links.map((link) => this.formatShareLinkResponse(link));
  }

  /**
   * Revoke a share link
   */
  async revokeShareLink(
    projectId: string,
    linkId: string,
    userId: string,
  ): Promise<{ success: true }> {
    // Verify access
    const link = await this.prisma.geoReportShareLink.findFirst({
      where: { id: linkId, projectId },
      include: { project: { select: { userId: true } } },
    });

    if (!link) {
      throw new NotFoundException('Share link not found');
    }

    if (link.project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    if (link.status === 'REVOKED') {
      throw new BadRequestException('Share link is already revoked');
    }

    await this.prisma.geoReportShareLink.update({
      where: { id: linkId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Get public share view (no auth required)
   */
  async getPublicShareView(shareToken: string): Promise<PublicShareViewResponse> {
    const link = await this.prisma.geoReportShareLink.findUnique({
      where: { shareToken },
      include: {
        project: {
          select: { id: true, name: true, userId: true },
        },
      },
    });

    if (!link) {
      return { status: 'not_found' };
    }

    if (link.status === 'REVOKED') {
      return { status: 'revoked' };
    }

    const now = new Date();
    if (link.expiresAt < now) {
      // Auto-update status if expired
      if (link.status !== 'EXPIRED') {
        await this.prisma.geoReportShareLink.update({
          where: { id: link.id },
          data: { status: 'EXPIRED' },
        });
      }
      return { status: 'expired' };
    }

    // Get report data (using the project owner's userId for authorization)
    const report = await this.assembleReportInternal(link.project.id, link.project.name);

    return {
      status: 'valid',
      report,
      expiresAt: link.expiresAt.toISOString(),
      generatedAt: link.generatedAt.toISOString(),
    };
  }

  /**
   * Internal method to assemble report without auth checks (for public share view)
   */
  private async assembleReportInternal(projectId: string, projectName: string): Promise<GeoReportData> {
    // Get project owner
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Get insights with owner's userId
    const insights = await this.projectInsightsService.getProjectInsights(projectId, project.userId);
    const geo = insights.geoInsights;

    return {
      projectId,
      projectName,
      generatedAt: new Date().toISOString(),

      overview: {
        productsAnswerReadyPercent: geo.overview.productsAnswerReadyPercent,
        productsAnswerReadyCount: geo.overview.productsAnswerReadyCount,
        productsTotal: geo.overview.productsTotal,
        answersTotal: geo.overview.answersTotal,
        reuseRatePercent: geo.overview.reuseRatePercent,
        confidenceDistribution: geo.overview.confidenceDistribution,
      },

      coverage: {
        byIntent: geo.coverage.byIntent.map((intent) => ({
          intentType: intent.intentType,
          label: intent.label,
          productsCovered: intent.productsCovered,
          productsTotal: intent.productsTotal,
          coveragePercent: intent.coveragePercent,
        })),
        gaps: geo.coverage.gaps,
        summary: geo.coverage.whyThisMatters,
      },

      trustSignals: {
        topBlockers: geo.trustSignals.topBlockers.map((blocker) => ({
          label: blocker.label,
          affectedProducts: blocker.affectedProducts,
        })),
        avgTimeToImproveHours: geo.trustSignals.avgTimeToImproveHours,
        summary: geo.trustSignals.whyThisMatters,
      },

      opportunities: geo.opportunities.map((opp) => ({
        title: opp.title,
        why: opp.why,
        estimatedImpact: opp.estimatedImpact,
        category: opp.category,
      })),

      disclaimer: DISCLAIMER_TEXT,
    };
  }

  private formatShareLinkResponse(link: any): ShareLinkResponse {
    const now = new Date();
    let status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' = link.status;
    if (status === 'ACTIVE' && link.expiresAt < now) {
      status = 'EXPIRED';
    }

    // Generate public URL
    const baseUrl = process.env.WEB_BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/geo-report/${link.shareToken}`;

    return {
      id: link.id,
      shareToken: link.shareToken,
      shareUrl,
      title: link.title,
      expiresAt: link.expiresAt.toISOString(),
      createdAt: link.createdAt.toISOString(),
      status,
    };
  }
}
