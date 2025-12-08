import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaService } from '../prisma.service';
import { GeminiClient } from './gemini.client';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [BillingModule],
  controllers: [AiController],
  providers: [AiService, PrismaService, GeminiClient],
  exports: [AiService],
})
export class AiModule {}
