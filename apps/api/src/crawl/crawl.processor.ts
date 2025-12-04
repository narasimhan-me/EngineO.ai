import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { redisConfig } from '../config/redis.config';
import { PrismaService } from '../prisma.service';
import { SeoScanService } from '../seo-scan/seo-scan.service';

interface CrawlJobPayload {
  projectId: string;
}

@Injectable()
export class CrawlProcessor implements OnModuleInit, OnModuleDestroy {
  private worker: Worker<CrawlJobPayload, void> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly seoScanService: SeoScanService,
  ) {}

  async onModuleInit() {
    if (!redisConfig.isEnabled || !redisConfig.connection) {
      console.warn('[CrawlProcessor] Redis not configured - worker disabled');
      return;
    }

    this.worker = new Worker<CrawlJobPayload, void>(
      'crawl_queue',
      async (job: Job<CrawlJobPayload>): Promise<void> => {
        const { projectId } = job.data;

        try {
          const crawledAt = await this.seoScanService.runFullProjectCrawl(projectId);

          if (!crawledAt) {
            console.warn(
              `[CrawlProcessor] Crawl skipped for project ${projectId} (no domain or project not found)`,
            );
            return;
          }

          await this.prisma.project.update({
            where: { id: projectId },
            data: {
              lastCrawledAt: crawledAt,
            },
          });

          console.log(
            `[CrawlProcessor] Successfully crawled project ${projectId} at ${crawledAt.toISOString()}`,
          );
        } catch (error) {
          console.error(
            `[CrawlProcessor] Failed to crawl project ${projectId}`,
            error,
          );
          throw error;
        }
      },
      {
        connection: redisConfig.connection,
        prefix: redisConfig.prefix,
      },
    );
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
  }
}
