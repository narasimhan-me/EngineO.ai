import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma.service';
import { DeoScoreService, DeoSignalsService } from './deo-score.service';
import { DeoScoreProcessor } from './deo-score.processor';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService, DeoScoreService, DeoSignalsService, DeoScoreProcessor],
  exports: [ProjectsService, DeoScoreService],
})
export class ProjectsModule {}
