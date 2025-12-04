import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SeoScanModule } from '../seo-scan/seo-scan.module';
import { CrawlSchedulerService } from './crawl-scheduler.service';
import { CrawlProcessor } from './crawl.processor';

@Module({
  imports: [SeoScanModule],
  providers: [CrawlSchedulerService, CrawlProcessor, PrismaService],
})
export class CrawlModule {}
