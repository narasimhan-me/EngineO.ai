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
 * Service that collects DEO signals for a project.
 *
 * Phase 2.3: Uses heuristic, data-driven signals derived from existing DB tables
 * (CrawlResult, Product, Project) only. All signals are normalized in the 0–1 range.
 */
@Injectable()
export class DeoSignalsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Collect all signals needed for DEO score computation.
   *
   * Heuristics are intentionally simple and based only on existing data:
   * - Content: coverage, depth, freshness
   * - Entities: coverage, accuracy, linkage (proto)
   * - Technical: crawl health, indexability, placeholder CWV
   * - Visibility: SERP presence, brand navigational strength, answer surfaces
   */
  async collectSignalsForProject(projectId: string): Promise<DeoScoreSignals> {
    const prisma = this.prisma as any;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const [crawlResults, products] = await Promise.all([
      prisma.crawlResult.findMany({ where: { projectId } }),
      prisma.product.findMany({ where: { projectId } }),
    ]);

    const totalCrawls = crawlResults.length;
    const totalProducts = products.length;

    // ---------- Content signals ----------

    // contentCoverage: % of pages/products with both title and description-like fields
    const totalItemsForContent = totalCrawls + totalProducts;
    let coveredItems = 0;

    for (const cr of crawlResults) {
      if (cr.title && cr.metaDescription) {
        coveredItems++;
      }
    }

    for (const product of products) {
      const titleSource = product.seoTitle ?? product.title;
      const descriptionSource = product.seoDescription ?? product.description;
      if (titleSource && descriptionSource) {
        coveredItems++;
      }
    }

    const contentCoverage =
      totalItemsForContent > 0 ? coveredItems / totalItemsForContent : 0;

    // contentDepth: average word count across pages and product descriptions, normalized to 800 words
    const wordCounts: number[] = [];

    for (const cr of crawlResults) {
      if (typeof cr.wordCount === 'number') {
        wordCounts.push(cr.wordCount);
      }
    }

    for (const product of products) {
      if (product.description) {
        const count = product.description
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;
        wordCounts.push(count);
      }
    }

    const avgWordCount =
      wordCounts.length > 0
        ? wordCounts.reduce((sum: number, value: number) => sum + value, 0) / wordCounts.length
        : 0;

    const contentDepth = Math.max(0, Math.min(1, avgWordCount / 800));

    // contentFreshness: average of 1 - age/90d across crawlResults.scannedAt and products.lastSyncedAt
    const freshnessScores: number[] = [];
    const now = Date.now();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

    for (const cr of crawlResults) {
      const ageMs = now - cr.scannedAt.getTime();
      const ageRatio = Math.min(ageMs / ninetyDaysMs, 1);
      freshnessScores.push(1 - ageRatio);
    }

    for (const product of products) {
      const ageMs = now - product.lastSyncedAt.getTime();
      const ageRatio = Math.min(ageMs / ninetyDaysMs, 1);
      freshnessScores.push(1 - ageRatio);
    }

    const contentFreshness =
      freshnessScores.length > 0
        ? freshnessScores.reduce((sum: number, value: number) => sum + value, 0) /
          freshnessScores.length
        : 0;

    // ---------- Technical & visibility helpers ----------

    let successfulCrawls = 0;
    let indexablePages = 0;
    let pagesWithStructuralIssues = 0;
    let answerReadyPages = 0;
    let pagesWithSeoMetadata = 0;
    let productsWithSeoMetadata = 0;

    for (const cr of crawlResults) {
      const issues = (cr.issues as string[]) ?? [];
      const hasHttpError =
        issues.includes('HTTP_ERROR') || issues.includes('FETCH_ERROR');

      const isSuccess =
        cr.statusCode >= 200 && cr.statusCode < 400 && !hasHttpError;

      if (isSuccess) {
        successfulCrawls++;
      }

      const hasThinContent = issues.includes('THIN_CONTENT');
      const isIndexable = isSuccess && !hasThinContent;

      if (isIndexable) {
        indexablePages++;
      }

      const hasStructuralIssues =
        issues.includes('MISSING_TITLE') ||
        issues.includes('MISSING_META_DESCRIPTION') ||
        issues.includes('MISSING_H1') ||
        hasThinContent;

      if (hasStructuralIssues) {
        pagesWithStructuralIssues++;
      }

      if (cr.wordCount != null && cr.wordCount >= 400 && cr.h1) {
        answerReadyPages++;
      }

      if (cr.title && cr.metaDescription) {
        pagesWithSeoMetadata++;
      }
    }

    for (const product of products) {
      const titleSource = product.seoTitle ?? product.title;
      const descriptionSource = product.seoDescription ?? product.description;
      if (titleSource && descriptionSource) {
        productsWithSeoMetadata++;
      }
    }

    // ---------- Technical signals ----------

    // crawlHealth: % of crawl results that returned successful HTTP status and no HTTP/FETCH_ERROR
    const crawlHealth =
      totalCrawls > 0 ? successfulCrawls / totalCrawls : 0;

    // indexability: % of pages that are successful and not marked as THIN_CONTENT
    const indexability =
      totalCrawls > 0 ? indexablePages / totalCrawls : 0;

    // coreWebVitals: placeholder 0.5 until real CWV integration
    const coreWebVitals = 0.5;

    // ---------- Entity signals (proto) ----------

    const totalItemsForEntity = totalCrawls + totalProducts;
    let entityHintCount = 0;

    for (const cr of crawlResults) {
      if (cr.title && cr.h1) {
        entityHintCount++;
      }
    }

    for (const product of products) {
      const titleSource = product.seoTitle ?? product.title;
      const descriptionSource = product.seoDescription ?? product.description;
      if (titleSource && descriptionSource) {
        entityHintCount++;
      }
    }

    // entityCoverage: % of pages/products with "entity hints" (title + h1 or SEO title + description)
    const entityCoverage =
      totalItemsForEntity > 0 ? entityHintCount / totalItemsForEntity : 0;

    // entityAccuracy: 1 - (pages with structural issues / total pages), clamped to [0.3, 0.9]
    let entityAccuracy: number;
    if (totalCrawls > 0) {
      const rawAccuracy = 1 - pagesWithStructuralIssues / totalCrawls;
      entityAccuracy = Math.min(0.9, Math.max(0.3, rawAccuracy));
    } else {
      entityAccuracy = 0.5;
    }

    // entityLinkage: simple proxy using average word count, normalized to 1200 words
    const entityLinkage = Math.max(0, Math.min(1, avgWordCount / 1200));

    // ---------- Visibility signals (proto) ----------

    // serpPresence: % of pages/products with SEO metadata (title + meta/description)
    const totalItemsForVisibility = totalCrawls + totalProducts;
    const serpPresence =
      totalItemsForVisibility > 0
        ? (pagesWithSeoMetadata + productsWithSeoMetadata) /
          totalItemsForVisibility
        : 0;

    // brandNavigationalStrength: normalized count of brand-like pages (/, /home, /about, /contact, /pricing, /blog)
    let brandNavigationalStrength = 0;
    if (totalCrawls > 0) {
      let brandPages = 0;
      for (const cr of crawlResults) {
        const url = cr.url.toLowerCase();

        const pathStart = url.indexOf('/', url.indexOf('://') + 3);
        const path =
          pathStart === -1 ? '/' : url.substring(pathStart).split('?')[0];

        const lowerPath = path.toLowerCase();
        if (
          lowerPath === '/' ||
          lowerPath === '/home' ||
          lowerPath.startsWith('/about') ||
          lowerPath.startsWith('/contact') ||
          lowerPath.startsWith('/pricing') ||
          lowerPath.startsWith('/blog')
        ) {
          brandPages++;
        }
      }

      // Normalize: 0 brand pages → 0, 1–3 pages → up to 1, 3+ saturated at 1
      brandNavigationalStrength = Math.min(1, brandPages / 3);
    }

    // answerSurfacePresence: % of pages that look "answer-ready" (enough content + H1)
    const answerSurfacePresence =
      totalCrawls > 0 ? answerReadyPages / totalCrawls : 0;

    return {
      // Content
      contentCoverage,
      contentDepth,
      contentFreshness,
      // Entities (proto)
      entityCoverage,
      entityAccuracy,
      entityLinkage,
      // Technical
      crawlHealth,
      coreWebVitals,
      indexability,
      // Visibility (proto)
      serpPresence,
      answerSurfacePresence,
      brandNavigationalStrength,
    };
  }
}
