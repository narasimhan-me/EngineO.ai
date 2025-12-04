import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SeoScanModule } from '../seo-scan/seo-scan.module';
import { CrawlSchedulerService } from './crawl-scheduler.service';
import { CrawlProcessor } from './crawl.processor';
import { CrawlController } from './crawl.controller';

@Module({
  imports: [SeoScanModule],
  controllers: [CrawlController],
  providers: [CrawlSchedulerService, CrawlProcessor, PrismaService],
})
export class CrawlModule {}
