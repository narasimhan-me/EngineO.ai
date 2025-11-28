import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IntegrationType } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get integration status for a project
   */
  async getIntegrationStatus(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        integrations: true,
      },
    });

    if (!project) {
      return null;
    }

    // Build integration status map for all types
    const integrationMap = new Map(
      project.integrations.map((i) => [i.type, i]),
    );

    const shopifyIntegration = integrationMap.get(IntegrationType.SHOPIFY);
    const woocommerceIntegration = integrationMap.get(IntegrationType.WOOCOMMERCE);
    const bigcommerceIntegration = integrationMap.get(IntegrationType.BIGCOMMERCE);
    const magentoIntegration = integrationMap.get(IntegrationType.MAGENTO);
    const customWebsiteIntegration = integrationMap.get(IntegrationType.CUSTOM_WEBSITE);

    return {
      projectId: project.id,
      projectName: project.name,
      integrations: project.integrations.map((i) => ({
        type: i.type,
        externalId: i.externalId,
        connected: true,
        createdAt: i.createdAt,
        config: i.config,
      })),
      // Legacy format for backwards compatibility
      shopify: shopifyIntegration
        ? {
            connected: true,
            shopDomain: shopifyIntegration.externalId,
            installedAt: (shopifyIntegration.config as any)?.installedAt,
            scope: (shopifyIntegration.config as any)?.scope,
          }
        : {
            connected: false,
          },
      woocommerce: woocommerceIntegration
        ? {
            connected: true,
            storeUrl: woocommerceIntegration.externalId,
            createdAt: woocommerceIntegration.createdAt,
          }
        : {
            connected: false,
          },
      bigcommerce: bigcommerceIntegration
        ? {
            connected: true,
            storeHash: bigcommerceIntegration.externalId,
            createdAt: bigcommerceIntegration.createdAt,
          }
        : {
            connected: false,
          },
      magento: magentoIntegration
        ? {
            connected: true,
            storeUrl: magentoIntegration.externalId,
            createdAt: magentoIntegration.createdAt,
          }
        : {
            connected: false,
          },
      customWebsite: customWebsiteIntegration
        ? {
            connected: true,
            url: customWebsiteIntegration.externalId,
            createdAt: customWebsiteIntegration.createdAt,
          }
        : {
            connected: false,
          },
    };
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string) {
    return this.prisma.project.findUnique({
      where: { id: projectId },
    });
  }

  /**
   * Get project with all integrations
   */
  async getProjectWithIntegrations(projectId: string) {
    return this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        integrations: true,
      },
    });
  }

  /**
   * Validate project ownership
   */
  async validateProjectOwnership(projectId: string, userId: string): Promise<boolean> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });
    return !!project;
  }
}
