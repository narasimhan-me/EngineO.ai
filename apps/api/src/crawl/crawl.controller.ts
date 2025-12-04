import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CrawlSchedulerService } from './crawl-scheduler.service';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlSchedulerService: CrawlSchedulerService) {}

  /**
   * Manually trigger the nightly crawl scheduler.
   * Admin-only endpoint for testing purposes.
   */
  @Post('trigger')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async triggerCrawl() {
    await this.crawlSchedulerService.scheduleProjectCrawls();
    return { message: 'Crawl scheduler triggered successfully' };
  }
}
