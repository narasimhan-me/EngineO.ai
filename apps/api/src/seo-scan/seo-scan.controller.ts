import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SeoScanService } from './seo-scan.service';

interface StartScanDto {
  projectId: string;
}

@Controller('seo-scan')
@UseGuards(JwtAuthGuard)
export class SeoScanController {
  constructor(private readonly seoScanService: SeoScanService) {}

  /**
   * POST /seo-scan/start
   * Start a new SEO scan for a project
   */
  @Post('start')
  async startScan(@Request() req: any, @Body() dto: StartScanDto) {
    return this.seoScanService.startScan(dto.projectId, req.user.id);
  }

  /**
   * GET /seo-scan/results?projectId=...
   * Get all scan results for a project
   */
  @Get('results')
  async getResults(@Request() req: any, @Query('projectId') projectId: string) {
    return this.seoScanService.getResults(projectId, req.user.id);
  }
}
