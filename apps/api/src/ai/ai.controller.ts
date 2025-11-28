import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma.service';

class MetadataDto {
  crawlResultId: string;
  targetKeywords?: string[];
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('metadata')
  async suggestMetadata(@Request() req: any, @Body() dto: MetadataDto) {
    const userId = req.user.userId;

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
}
