import { Module } from '@nestjs/common';
import { SeoScanController } from './seo-scan.controller';
import { SeoScanService } from './seo-scan.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SeoScanController],
  providers: [SeoScanService, PrismaService],
  exports: [SeoScanService],
})
export class SeoScanModule {}
