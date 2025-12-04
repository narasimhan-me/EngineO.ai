import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DeoSignalsService } from './deo-score.service';
import { DeoIssue, DeoIssuesResponse, DeoScoreSignals } from '@engineo/shared';

@Injectable()
export class DeoIssuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deoSignalsService: DeoSignalsService,
  ) {}

  /**
   * Compute DEO issues for a project by combining crawl results,
   * product data, and aggregated DEO signals.
   */
  async getIssuesForProject(projectId: string, userId: string): Promise<DeoIssuesResponse> {
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

    const [crawlResults, products, signals] = await Promise.all([
      prisma.crawlResult.findMany({ where: { projectId } }),
      prisma.product.findMany({ where: { projectId } }),
      this.deoSignalsService.collectSignalsForProject(projectId),
    ]);

    const totalPages = crawlResults.length;
    const totalProducts = products.length;
    const totalSurfaces = totalPages + totalProducts;

    const issues: DeoIssue[] = [];

    const missingMetadataIssue = this.buildMissingMetadataIssue(
      crawlResults,
      products,
      totalSurfaces,
    );
    if (missingMetadataIssue) {
      issues.push(missingMetadataIssue);
    }

    const thinContentIssue = this.buildThinContentIssue(
      crawlResults,
      products,
      totalSurfaces,
    );
    if (thinContentIssue) {
      issues.push(thinContentIssue);
    }

    const lowEntityCoverageIssue = this.buildLowEntityCoverageIssue(
      crawlResults,
      products,
      totalSurfaces,
      signals,
    );
    if (lowEntityCoverageIssue) {
      issues.push(lowEntityCoverageIssue);
    }

    const indexabilityIssue = this.buildIndexabilityIssue(crawlResults, signals);
    if (indexabilityIssue) {
      issues.push(indexabilityIssue);
    }

    const answerSurfaceIssue = this.buildAnswerSurfaceIssue(crawlResults, signals);
    if (answerSurfaceIssue) {
      issues.push(answerSurfaceIssue);
    }

    const brandNavIssue = this.buildBrandNavigationalIssue(crawlResults, signals);
    if (brandNavIssue) {
      issues.push(brandNavIssue);
    }

    const crawlHealthIssue = this.buildCrawlHealthIssue(crawlResults, signals);
    if (crawlHealthIssue) {
      issues.push(crawlHealthIssue);
    }

    const productDepthIssue = this.buildProductContentDepthIssue(products);
    if (productDepthIssue) {
      issues.push(productDepthIssue);
    }

    return {
      projectId,
      generatedAt: new Date().toISOString(),
      issues,
    };
  }

  private buildMissingMetadataIssue(
    crawlResults: any[],
    products: any[],
    totalSurfaces: number,
  ): DeoIssue | null {
    if (totalSurfaces === 0) {
      return null;
    }

    let missingTitles = 0;
    let missingDescriptions = 0;
    let missingProductMetadata = 0;
    let surfacesWithMissing = 0;
    const affectedPages: string[] = [];
    const affectedProducts: string[] = [];

    for (const cr of crawlResults) {
      let missingAny = false;

      if (!cr.title) {
        missingTitles++;
        missingAny = true;
      }

      if (!cr.metaDescription) {
        missingDescriptions++;
        missingAny = true;
      }

      if (missingAny) {
        surfacesWithMissing++;
        if (affectedPages.length < 20) {
          affectedPages.push(cr.url);
        }
      }
    }

    for (const product of products) {
      const hasSeoTitle = !!product.seoTitle;
      const hasSeoDescription = !!product.seoDescription;
      let missingAny = false;

      if (!hasSeoTitle || !hasSeoDescription) {
        missingProductMetadata++;
        missingAny = true;
      }

      if (missingAny && affectedProducts.length < 20) {
        affectedProducts.push(product.id);
      }
    }

    const surfacesRatio = surfacesWithMissing / totalSurfaces;
    const severity = this.getSeverityForHigherIsWorse(surfacesRatio, {
      info: 0,
      warning: 0.03,
      critical: 0.1,
    });

    const totalMissing = missingTitles + missingDescriptions + missingProductMetadata;

    if (!severity || totalMissing === 0) {
      return null;
    }

    return {
      id: 'missing_metadata',
      title: 'Missing titles or descriptions',
      description:
        'Some pages or products are missing SEO titles or meta descriptions, which reduces visibility and click-through rates.',
      severity,
      count: totalMissing,
      affectedPages,
      affectedProducts,
    };
  }

  private buildThinContentIssue(
    crawlResults: any[],
    products: any[],
    totalSurfaces: number,
  ): DeoIssue | null {
    if (totalSurfaces === 0) {
      return null;
    }

    let thinPages = 0;
    let thinProducts = 0;
    const affectedPages: string[] = [];
    const affectedProducts: string[] = [];

    for (const cr of crawlResults) {
      const wordCount = typeof cr.wordCount === 'number' ? cr.wordCount : 0;
      if (wordCount > 0 && wordCount < 150) {
        thinPages++;
        if (affectedPages.length < 20) {
          affectedPages.push(cr.url);
        }
      }
    }

    for (const product of products) {
      const desc = (product.seoDescription ?? product.description) as string | null;
      const descWordCount = this.getWordCount(desc);
      if (descWordCount > 0 && descWordCount < 80) {
        thinProducts++;
        if (affectedProducts.length < 20) {
          affectedProducts.push(product.id);
        }
      }
    }

    const thinSurfaces = thinPages + thinProducts;
    const thinRatio = thinSurfaces / totalSurfaces;
    const severity = this.getSeverityForHigherIsWorse(thinRatio, {
      info: 0.02,
      warning: 0.1,
      critical: 0.25,
    });

    if (!severity || thinSurfaces === 0) {
      return null;
    }

    return {
      id: 'thin_content',
      title: 'Thin content across pages and products',
      description:
        'Many pages or products have very short content, which weakens depth, answerability, and ranking potential.',
      severity,
      count: thinSurfaces,
      affectedPages,
      affectedProducts,
    };
  }

  private buildLowEntityCoverageIssue(
    crawlResults: any[],
    products: any[],
    totalSurfaces: number,
    signals: DeoScoreSignals | null,
  ): DeoIssue | null {
    if (totalSurfaces === 0) {
      return null;
    }

    let entityIssueSurfaces = 0;
    const affectedPages: string[] = [];
    const affectedProducts: string[] = [];

    for (const cr of crawlResults) {
      const hasEntityHint = !!cr.title && !!cr.h1;
      if (!hasEntityHint) {
        entityIssueSurfaces++;
        if (affectedPages.length < 20) {
          affectedPages.push(cr.url);
        }
      }
    }

    for (const product of products) {
      const seoTitle = product.seoTitle as string | null;
      const seoDescription = product.seoDescription as string | null;
      const desc = (product.seoDescription ?? product.description) as string | null;
      const descWordCount = this.getWordCount(desc);
      const hasEntityHint =
        !!seoTitle && !!seoDescription && descWordCount >= 120;

      if (!hasEntityHint) {
        entityIssueSurfaces++;
        if (affectedProducts.length < 20) {
          affectedProducts.push(product.id);
        }
      }
    }

    let entityCoverage = signals?.entityCoverage ?? null;
    if (entityCoverage == null) {
      entityCoverage =
        totalSurfaces > 0
          ? (totalSurfaces - entityIssueSurfaces) / totalSurfaces
          : null;
    }

    const severity = this.getSeverityForLowerIsWorse(entityCoverage, {
      critical: 0.35,
      warning: 0.6,
      info: 0.8,
    });

    if (!severity || entityIssueSurfaces === 0) {
      return null;
    }

    return {
      id: 'low_entity_coverage',
      title: 'Low entity and schema coverage',
      description:
        'Key entities are not well modeled across pages and products (missing H1, SEO metadata, or sufficiently detailed descriptions).',
      severity,
      count: entityIssueSurfaces,
      affectedPages,
      affectedProducts,
    };
  }

  private buildIndexabilityIssue(
    crawlResults: any[],
    signals: DeoScoreSignals | null,
  ): DeoIssue | null {
    if (crawlResults.length === 0) {
      return null;
    }

    let issueCount = 0;
    const affectedPages: string[] = [];

    for (const cr of crawlResults) {
      const issues = (cr.issues as string[]) ?? [];
      const hasHttpError =
        issues.includes('HTTP_ERROR') || issues.includes('FETCH_ERROR');
      const isErrorStatus = cr.statusCode < 200 || cr.statusCode >= 400;
      const missingHtmlBasics = !cr.title || !cr.metaDescription || !cr.h1;
      const hasNoindex =
        issues.includes('NOINDEX') ||
        issues.includes('NO_INDEX') ||
        issues.includes('META_ROBOTS_NOINDEX');

      if (hasHttpError || isErrorStatus || missingHtmlBasics || hasNoindex) {
        issueCount++;
        if (affectedPages.length < 20) {
          affectedPages.push(cr.url);
        }
      }
    }

    const indexability = signals?.indexability ?? null;
    const severity = this.getSeverityForLowerIsWorse(indexability, {
      critical: 0.5,
      warning: 0.75,
      info: 0.9,
    });

    if (!severity || issueCount === 0) {
      return null;
    }

    return {
      id: 'indexability_problems',
      title: 'Indexability and crawl issues',
      description:
        'Some pages have crawl errors or are missing critical HTML elements, making them difficult for search engines to index correctly.',
      severity,
      count: issueCount,
      affectedPages,
    };
  }

  private buildAnswerSurfaceIssue(
    crawlResults: any[],
    signals: DeoScoreSignals | null,
  ): DeoIssue | null {
    if (crawlResults.length === 0) {
      return null;
    }

    let weakCount = 0;
    const affectedPages: string[] = [];

    for (const cr of crawlResults) {
      const wordCount = typeof cr.wordCount === 'number' ? cr.wordCount : 0;
      const hasH1 = !!cr.h1;
      const isWeak = (wordCount > 0 && wordCount < 400) || !hasH1;

      if (isWeak) {
        weakCount++;
        if (affectedPages.length < 20) {
          affectedPages.push(cr.url);
        }
      }
    }

    const answerSurfacePresence = signals?.answerSurfacePresence ?? null;
    const severity = this.getSeverityForLowerIsWorse(answerSurfacePresence, {
      critical: 0.2,
      warning: 0.35,
      info: 0.5,
    });

    if (!severity || weakCount === 0) {
      return null;
    }

    return {
      id: 'answer_surface_weakness',
      title: 'Weak answer surfaces',
      description:
        'Many pages lack the long-form content and clear headings needed to be strong answer surfaces for search and AI assistants.',
      severity,
      count: weakCount,
      affectedPages,
    };
  }

  private buildBrandNavigationalIssue(
    crawlResults: any[],
    signals: DeoScoreSignals | null,
  ): DeoIssue | null {
    if (crawlResults.length === 0) {
      return null;
    }

    const canonicalPaths = ['/', '/about', '/contact', '/faq', '/support'];
    const found = new Set<string>();

    for (const cr of crawlResults) {
      const path = this.extractPathFromUrl(cr.url);
      if (canonicalPaths.includes(path)) {
        found.add(path);
      }
    }

    const missing = canonicalPaths.filter((p) => !found.has(p));
    const brandNavigationalStrength = signals?.brandNavigationalStrength ?? null;
    const severity = this.getSeverityForLowerIsWorse(brandNavigationalStrength, {
      critical: 0.25,
      warning: 0.4,
      info: 0.6,
    });

    const count = missing.length;

    if (!severity || count === 0) {
      return null;
    }

    return {
      id: 'brand_navigational_weakness',
      title: 'Brand navigational weakness',
      description:
        'Canonical navigational pages like /about, /contact, /faq, or /support are missing or not discoverable, weakening brand and trust signals.',
      severity,
      count,
      affectedPages: missing,
    };
  }

  private buildCrawlHealthIssue(
    crawlResults: any[],
    signals: DeoScoreSignals | null,
  ): DeoIssue | null {
    if (crawlResults.length === 0) {
      return null;
    }

    let errorCount = 0;
    const affectedPages: string[] = [];

    for (const cr of crawlResults) {
      const issues = (cr.issues as string[]) ?? [];
      const hasHttpError =
        issues.includes('HTTP_ERROR') || issues.includes('FETCH_ERROR');
      const isErrorStatus = cr.statusCode < 200 || cr.statusCode >= 400;

      if (hasHttpError || isErrorStatus) {
        errorCount++;
        if (affectedPages.length < 20) {
          affectedPages.push(cr.url);
        }
      }
    }

    const crawlHealth = signals?.crawlHealth ?? null;
    const severity = this.getSeverityForLowerIsWorse(crawlHealth, {
      critical: 0.6,
      warning: 0.8,
      info: 0.95,
    });

    if (!severity || errorCount === 0) {
      return null;
    }

    return {
      id: 'crawl_health_errors',
      title: 'Crawl health and errors',
      description:
        'A number of pages return HTTP errors or cannot be crawled reliably, which can hide issues and hurt discovery.',
      severity,
      count: errorCount,
      affectedPages,
    };
  }

  private buildProductContentDepthIssue(products: any[]): DeoIssue | null {
    if (products.length === 0) {
      return null;
    }

    let shortOrMissingDescriptions = 0;
    let sumProductWords = 0;
    let countProductWords = 0;
    const affectedProducts: string[] = [];

    for (const product of products) {
      const desc = (product.seoDescription ?? product.description) as string | null;
      const wordCount = this.getWordCount(desc);

      if (wordCount > 0) {
        sumProductWords += wordCount;
        countProductWords++;
      }

      if (wordCount === 0 || wordCount < 50) {
        shortOrMissingDescriptions++;
        if (affectedProducts.length < 20) {
          affectedProducts.push(product.id);
        }
      }
    }

    if (shortOrMissingDescriptions === 0) {
      return null;
    }

    const avgProductWordCount =
      countProductWords > 0 ? sumProductWords / countProductWords : 0;
    const contentDepthProducts = Math.max(
      0,
      Math.min(1, avgProductWordCount / 600),
    );

    const severity = this.getSeverityForLowerIsWorse(contentDepthProducts, {
      critical: 0.25,
      warning: 0.45,
      info: 0.65,
    });

    if (!severity) {
      return null;
    }

    return {
      id: 'product_content_depth',
      title: 'Shallow product descriptions',
      description:
        'Many products have very short or missing descriptions, limiting their ability to rank and convert.',
      severity,
      count: shortOrMissingDescriptions,
      affectedProducts,
    };
  }

  private getSeverityForHigherIsWorse(
    ratio: number,
    thresholds: { info: number; warning: number; critical: number },
  ): 'critical' | 'warning' | 'info' | null {
    if (ratio > thresholds.critical) {
      return 'critical';
    }
    if (ratio > thresholds.warning) {
      return 'warning';
    }
    if (ratio > thresholds.info) {
      return 'info';
    }
    return null;
  }

  private getSeverityForLowerIsWorse(
    value: number | null | undefined,
    thresholds: { critical: number; warning: number; info: number },
  ): 'critical' | 'warning' | 'info' | null {
    if (value == null) {
      return null;
    }

    if (value < thresholds.critical) {
      return 'critical';
    }
    if (value < thresholds.warning) {
      return 'warning';
    }
    if (value < thresholds.info) {
      return 'info';
    }

    return null;
  }

  private getWordCount(text: string | null | undefined): number {
    if (!text) {
      return 0;
    }

    return text
      .toString()
      .split(/\s+/)
      .filter(Boolean).length;
  }

  private extractPathFromUrl(url: string): string {
    try {
      const lower = url.toLowerCase();
      const protocolIndex = lower.indexOf('://');

      if (protocolIndex === -1) {
        const pathIndex = lower.indexOf('/');
        return pathIndex === -1 ? '/' : lower.substring(pathIndex).split('?')[0];
      }

      const pathStart = lower.indexOf('/', protocolIndex + 3);
      if (pathStart === -1) {
        return '/';
      }

      return lower.substring(pathStart).split('?')[0];
    } catch {
      return '/';
    }
  }
}
