import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IntegrationsService, CreateIntegrationDto, UpdateIntegrationDto } from './integrations.service';
import { IntegrationType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma.service';

@Controller('integrations')
@UseGuards(JwtAuthGuard) // [SELF-SERVICE-1] All integration routes require authentication
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * [SELF-SERVICE-1] Validate that the authenticated user owns the project.
   * Required for "Organization / Stores" self-service actions.
   */
  private async validateProjectOwnership(userId: string, projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }
  }

  /**
   * GET /integrations?projectId=xxx
   * List all integrations for a project
   * [SELF-SERVICE-1] Requires authentication and project ownership
   */
  @Get()
  async listIntegrations(
    @Request() req: any,
    @Query('projectId') projectId: string,
  ) {
    if (!projectId) {
      throw new BadRequestException('projectId query parameter is required');
    }

    await this.validateProjectOwnership(req.user.id, projectId);

    const integrations = await this.integrationsService.getProjectIntegrations(projectId);
    return {
      projectId,
      integrations: integrations.map((i) => ({
        id: i.id,
        type: i.type,
        externalId: i.externalId,
        hasAccessToken: !!i.accessToken,
        config: i.config,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
    };
  }

  /**
   * GET /integrations/:type?projectId=xxx
   * Get a specific integration by type
   * [SELF-SERVICE-1] Requires authentication and project ownership
   */
  @Get(':type')
  async getIntegration(
    @Request() req: any,
    @Param('type') type: string,
    @Query('projectId') projectId: string,
  ) {
    if (!projectId) {
      throw new BadRequestException('projectId query parameter is required');
    }

    await this.validateProjectOwnership(req.user.id, projectId);

    const integrationType = this.parseIntegrationType(type);
    const integration = await this.integrationsService.getIntegration(projectId, integrationType);

    if (!integration) {
      throw new NotFoundException(`Integration of type ${type} not found`);
    }

    return {
      id: integration.id,
      projectId: integration.projectId,
      type: integration.type,
      externalId: integration.externalId,
      hasAccessToken: !!integration.accessToken,
      config: integration.config,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  }

  /**
   * POST /integrations
   * Create a new integration
   * [SELF-SERVICE-1] Requires authentication and project ownership
   */
  @Post()
  async createIntegration(
    @Request() req: any,
    @Body() body: {
      projectId: string;
      type: string;
      externalId?: string;
      accessToken?: string;
      config?: Record<string, any>;
    },
  ) {
    if (!body.projectId || !body.type) {
      throw new BadRequestException('projectId and type are required');
    }

    await this.validateProjectOwnership(req.user.id, body.projectId);

    const integrationType = this.parseIntegrationType(body.type);

    const dto: CreateIntegrationDto = {
      projectId: body.projectId,
      type: integrationType,
      externalId: body.externalId,
      accessToken: body.accessToken,
      config: body.config,
    };

    const integration = await this.integrationsService.createIntegration(dto);

    return {
      id: integration.id,
      projectId: integration.projectId,
      type: integration.type,
      externalId: integration.externalId,
      createdAt: integration.createdAt,
    };
  }

  /**
   * PUT /integrations/:type
   * Update an existing integration
   * [SELF-SERVICE-1] Requires authentication and project ownership
   */
  @Put(':type')
  async updateIntegration(
    @Request() req: any,
    @Param('type') type: string,
    @Query('projectId') projectId: string,
    @Body() body: UpdateIntegrationDto,
  ) {
    if (!projectId) {
      throw new BadRequestException('projectId query parameter is required');
    }

    await this.validateProjectOwnership(req.user.id, projectId);

    const integrationType = this.parseIntegrationType(type);
    const integration = await this.integrationsService.updateIntegration(
      projectId,
      integrationType,
      body,
    );

    return {
      id: integration.id,
      projectId: integration.projectId,
      type: integration.type,
      externalId: integration.externalId,
      updatedAt: integration.updatedAt,
    };
  }

  /**
   * DELETE /integrations/:type?projectId=xxx
   * Remove an integration
   * [SELF-SERVICE-1] Requires authentication and project ownership
   */
  @Delete(':type')
  async deleteIntegration(
    @Request() req: any,
    @Param('type') type: string,
    @Query('projectId') projectId: string,
  ) {
    if (!projectId) {
      throw new BadRequestException('projectId query parameter is required');
    }

    await this.validateProjectOwnership(req.user.id, projectId);

    const integrationType = this.parseIntegrationType(type);
    await this.integrationsService.deleteIntegration(projectId, integrationType);

    return {
      success: true,
      message: `Integration of type ${type} has been removed`,
    };
  }

  /**
   * GET /integrations/types/available
   * Get list of all available integration types
   */
  @Get('types/available')
  getAvailableTypes() {
    return {
      types: Object.values(IntegrationType).map((type) => ({
        value: type,
        label: this.getIntegrationLabel(type),
        description: this.getIntegrationDescription(type),
      })),
    };
  }

  private parseIntegrationType(type: string): IntegrationType {
    const upperType = type.toUpperCase();
    if (!Object.values(IntegrationType).includes(upperType as IntegrationType)) {
      throw new BadRequestException(
        `Invalid integration type: ${type}. Valid types: ${Object.values(IntegrationType).join(', ')}`,
      );
    }
    return upperType as IntegrationType;
  }

  private getIntegrationLabel(type: IntegrationType): string {
    const labels: Record<IntegrationType, string> = {
      [IntegrationType.SHOPIFY]: 'Shopify',
      [IntegrationType.WOOCOMMERCE]: 'WooCommerce',
      [IntegrationType.BIGCOMMERCE]: 'BigCommerce',
      [IntegrationType.MAGENTO]: 'Magento',
      [IntegrationType.CUSTOM_WEBSITE]: 'Custom Website',
    };
    return labels[type];
  }

  private getIntegrationDescription(type: IntegrationType): string {
    const descriptions: Record<IntegrationType, string> = {
      [IntegrationType.SHOPIFY]: 'Connect your Shopify store for product sync and SEO optimization',
      [IntegrationType.WOOCOMMERCE]: 'Connect your WooCommerce store via REST API',
      [IntegrationType.BIGCOMMERCE]: 'Connect your BigCommerce store for product management',
      [IntegrationType.MAGENTO]: 'Connect your Magento 2 store via REST API',
      [IntegrationType.CUSTOM_WEBSITE]: 'Connect any website for SEO scanning and analysis',
    };
    return descriptions[type];
  }
}
