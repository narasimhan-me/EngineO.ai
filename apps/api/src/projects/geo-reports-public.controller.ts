import { Controller, Get, Param } from '@nestjs/common';
import { GeoReportsService } from './geo-reports.service';

/**
 * [GEO-EXPORT-1] Public GEO Reports Controller (No Auth)
 *
 * Public endpoint for viewing shared GEO reports.
 * No authentication required - uses share token for access.
 */
@Controller('public/geo-reports')
export class GeoReportsPublicController {
  constructor(private readonly geoReportsService: GeoReportsService) {}

  /**
   * GET /public/geo-reports/:shareToken
   * View a shared GEO report (public, no auth)
   *
   * Returns:
   * - status: 'valid' | 'expired' | 'revoked' | 'not_found'
   * - report: GeoReportData (only if status === 'valid')
   * - expiresAt: ISO timestamp (only if status === 'valid')
   * - generatedAt: ISO timestamp (only if status === 'valid')
   */
  @Get(':shareToken')
  async getPublicShareView(@Param('shareToken') shareToken: string) {
    return this.geoReportsService.getPublicShareView(shareToken);
  }
}
