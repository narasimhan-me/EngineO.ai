import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma.service';
import { EntitlementsService } from '../billing/entitlements.service';

class MetadataDto {
  crawlResultId: string;
  targetKeywords?: string[];
}

class ProductMetadataDto {
  productId: string;
  targetKeywords?: string[];
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  @Post('metadata')
  async suggestMetadata(@Request() req: any, @Body() dto: MetadataDto) {
    const userId = req.user.id;

    // Load crawl result and verify ownership
    const crawlResult = await this.prisma.crawlResult.findUnique({
      where: { id: dto.crawlResultId },
      include: {
        project: true,
      },
    });

    if (!crawlResult) {
      throw new BadRequestException('Crawl result not found');
    }

    if (crawlResult.project.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    // Generate AI suggestions
    const suggestions = await this.aiService.generateMetadata({
      url: crawlResult.url,
      currentTitle: crawlResult.title || undefined,
      currentDescription: crawlResult.metaDescription || undefined,
      h1: crawlResult.h1 || undefined,
      targetKeywords: dto.targetKeywords,
    });

    return {
      crawlResultId: dto.crawlResultId,
      url: crawlResult.url,
      current: {
        title: crawlResult.title,
        description: crawlResult.metaDescription,
      },
      suggested: {
        title: suggestions.title,
        description: suggestions.description,
      },
    };
  }

  /**
   * POST /ai/product-metadata
   * Generate AI SEO suggestions for a product
   */
  @Post('product-metadata')
  async suggestProductMetadata(@Request() req: any, @Body() dto: ProductMetadataDto) {
    const userId = req.user.id;

    // Load product and verify ownership
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: {
        project: true,
      },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    if (product.project.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    // Enforce daily AI suggestion limit before calling provider
    const { planId, limit, dailyCount } =
      await this.entitlementsService.ensureWithinDailyAiLimit(
        userId,
        product.projectId,
        'product_optimize',
      );

    // eslint-disable-next-line no-console
    console.log('[AI][ProductOptimize] ai.optimize.started', {
      userId,
      projectId: product.projectId,
      productId: dto.productId,
      planId,
      limit,
      dailyCount,
    });

    let providerCalled = false;
    let recordedUsage = false;

    try {
      providerCalled = true;

      // Generate AI suggestions based on product data
      const suggestions = await this.aiService.generateMetadata({
        url: `Product: ${product.title}`,
        currentTitle: product.seoTitle || product.title,
        currentDescription: product.seoDescription || product.description || undefined,
        pageTextSnippet: product.description || undefined,
        targetKeywords: dto.targetKeywords,
      });

      const hasUsableSuggestion =
        !!(suggestions.title && suggestions.title.trim()) ||
        !!(suggestions.description && suggestions.description.trim());

      await this.entitlementsService.recordAiUsage(
        userId,
        product.projectId,
        'product_optimize',
      );
      recordedUsage = true;

      // Basic observability for Optimize feature
      // eslint-disable-next-line no-console
      console.log('[AI][ProductOptimize] ai.optimize.success', {
        userId,
        projectId: product.projectId,
        productId: dto.productId,
        planId,
        limit,
        dailyCount: dailyCount + 1,
        hasUsableSuggestion,
      });

      return {
        productId: dto.productId,
        current: {
          title: product.seoTitle || product.title,
          description: product.seoDescription || product.description,
        },
        suggested: {
          title: suggestions.title,
          description: suggestions.description,
        },
      };
    } catch (error) {
      if (providerCalled && !recordedUsage) {
        await this.entitlementsService.recordAiUsage(
          userId,
          product.projectId,
          'product_optimize',
        );
        recordedUsage = true;
      }

      // eslint-disable-next-line no-console
      console.error('[AI][ProductOptimize] ai.optimize.failed', {
        userId,
        projectId: product.projectId,
        productId: dto.productId,
        planId,
        limit,
        dailyCount: dailyCount + (providerCalled ? 1 : 0),
        error,
      });
      throw error;
    }
  }
}
