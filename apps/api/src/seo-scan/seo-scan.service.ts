import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as cheerio from 'cheerio';

export interface ScanResult {
  url: string;
  statusCode: number;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  wordCount: number;
  loadTimeMs: number;
  issues: string[];
}

@Injectable()
export class SeoScanService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Start a SEO scan for a project's domain
   */
  async startScan(projectId: string, userId: string) {
    // Validate project ownership
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    if (!project.domain) {
      throw new NotFoundException('Project has no domain configured');
    }

    // For MVP, scan only the homepage
    const url = `https://${project.domain}/`;
    const scanResult = await this.scanPage(url);

    // Store the crawl result
    const crawlResult = await this.prisma.crawlResult.create({
      data: {
        projectId,
        url: scanResult.url,
        statusCode: scanResult.statusCode,
        title: scanResult.title,
        metaDescription: scanResult.metaDescription,
        h1: scanResult.h1,
        wordCount: scanResult.wordCount,
        loadTimeMs: scanResult.loadTimeMs,
        issues: scanResult.issues,
      },
    });

    return crawlResult;
  }

  /**
   * Scan a single page and extract SEO data
   */
  async scanPage(url: string): Promise<ScanResult> {
    const startTime = Date.now();
    let statusCode = 0;
    let html = '';

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SEOEngine.io Bot/1.0 (+https://seoengine.io)',
        },
        redirect: 'follow',
      });
      statusCode = response.status;
      html = await response.text();
    } catch (error) {
      return {
        url,
        statusCode: 0,
        title: null,
        metaDescription: null,
        h1: null,
        wordCount: 0,
        loadTimeMs: Date.now() - startTime,
        issues: ['FETCH_ERROR'],
      };
    }

    const loadTimeMs = Date.now() - startTime;
    const $ = cheerio.load(html);

    // Extract SEO elements
    const title = $('title').first().text().trim() || null;
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null;
    const h1 = $('h1').first().text().trim() || null;

    // Calculate word count (simple: text content divided by average word length)
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

    // Build issues array
    const issues: string[] = [];

    if (!title) {
      issues.push('MISSING_TITLE');
    } else if (title.length > 65) {
      issues.push('TITLE_TOO_LONG');
    } else if (title.length < 30) {
      issues.push('TITLE_TOO_SHORT');
    }

    if (!metaDescription) {
      issues.push('MISSING_META_DESCRIPTION');
    } else if (metaDescription.length > 160) {
      issues.push('META_DESCRIPTION_TOO_LONG');
    } else if (metaDescription.length < 70) {
      issues.push('META_DESCRIPTION_TOO_SHORT');
    }

    if (!h1) {
      issues.push('MISSING_H1');
    }

    if (wordCount < 300) {
      issues.push('THIN_CONTENT');
    }

    if (loadTimeMs > 3000) {
      issues.push('SLOW_LOAD_TIME');
    }

    if (statusCode >= 400) {
      issues.push('HTTP_ERROR');
    }

    return {
      url,
      statusCode,
      title,
      metaDescription,
      h1,
      wordCount,
      loadTimeMs,
      issues,
    };
  }

  /**
   * Get all scan results for a project
   */
  async getResults(projectId: string, userId: string) {
    // Validate project ownership
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const results = await this.prisma.crawlResult.findMany({
      where: { projectId },
      orderBy: { scannedAt: 'desc' },
    });

    // Add computed score to each result
    return results.map((result) => ({
      ...result,
      score: this.calculateScore(result.issues as string[]),
    }));
  }

  /**
   * Calculate SEO score based on issues
   */
  calculateScore(issues: string[]): number {
    // Start with 100, subtract 10 points per issue, minimum 0
    return Math.max(0, 100 - issues.length * 10);
  }
}
