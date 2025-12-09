import { Module, forwardRef } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaService } from '../prisma.service';
import { GeminiClient } from './gemini.client';
import { BillingModule } from '../billing/billing.module';
import { ProjectsModule } from '../projects/projects.module';
import { AnswerGenerationService } from '../projects/answer-generation.service';

@Module({
  imports: [BillingModule, forwardRef(() => ProjectsModule)],
  controllers: [AiController],
  providers: [AiService, PrismaService, GeminiClient, AnswerGenerationService],
  exports: [AiService, AnswerGenerationService],
})
export class AiModule {}
