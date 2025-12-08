import { Module } from '@nestjs/common';
import { SeoScanController } from './seo-scan.controller';
import { SeoScanService } from './seo-scan.service';
import { PrismaService } from '../prisma.service';
import { DeoScoreService, DeoSignalsService } from '../projects/deo-score.service';
import { AutomationService } from '../projects/automation.service';
import { AiModule } from '../ai/ai.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [AiModule, BillingModule],
  controllers: [SeoScanController],
  providers: [
    SeoScanService,
    PrismaService,
    DeoScoreService,
    DeoSignalsService,
    AutomationService,
  ],
  exports: [SeoScanService],
})
export class SeoScanModule {}
