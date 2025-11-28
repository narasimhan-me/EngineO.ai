import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { IntegrationType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ShopifyService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly appUrl: string;
  private readonly scopes: string;
  private readonly stateStore = new Map<string, string>(); // In production, use Redis

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get<string>('SHOPIFY_API_KEY');
    this.apiSecret = this.config.get<string>('SHOPIFY_API_SECRET');
    this.appUrl = this.config.get<string>('SHOPIFY_APP_URL');
    this.scopes = this.config.get<string>('SHOPIFY_SCOPES', 'read_products,write_products,read_themes');
  }

  /**
   * Generate the Shopify OAuth URL for installation
   */
  generateInstallUrl(shop: string, projectId: string): string {
    const state = crypto.randomBytes(16).toString('hex');
    this.stateStore.set(state, projectId);

    const redirectUri = `${this.appUrl}/shopify/callback`;
    const params = new URLSearchParams({
      client_id: this.apiKey,
      scope: this.scopes,
      redirect_uri: redirectUri,
      state,
    });

    return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
  }

  /**
   * Validate HMAC from Shopify callback
   */
  validateHmac(query: Record<string, any>): boolean {
    const { hmac, ...params } = query;

    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const hash = crypto
      .createHmac('sha256', this.apiSecret)
      .update(sortedParams)
      .digest('hex');

    return hash === hmac;
  }

  /**
   * Validate state parameter and retrieve projectId
   */
  validateState(state: string): string | null {
    const projectId = this.stateStore.get(state);
    if (projectId) {
      this.stateStore.delete(state);
      return projectId;
    }
    return null;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeToken(shop: string, code: string): Promise<{ access_token: string; scope: string }> {
    const url = `https://${shop}/admin/oauth/access_token`;
    const body = {
      client_id: this.apiKey,
      client_secret: this.apiSecret,
      code,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to exchange token with Shopify');
    }

    return response.json() as Promise<{ access_token: string; scope: string }>;
  }

  /**
   * Persist Shopify integration in database
   */
  async storeShopifyConnection(
    projectId: string,
    shopDomain: string,
    accessToken: string,
    scope: string,
  ) {
    return this.prisma.integration.upsert({
      where: {
        projectId_type: {
          projectId,
          type: IntegrationType.SHOPIFY,
        },
      },
      create: {
        projectId,
        type: IntegrationType.SHOPIFY,
        externalId: shopDomain,
        accessToken,
        config: {
          scope,
          installedAt: new Date().toISOString(),
        },
      },
      update: {
        externalId: shopDomain,
        accessToken,
        config: {
          scope,
          installedAt: new Date().toISOString(),
          uninstalledAt: null,
        },
      },
    });
  }

  /**
   * Get Shopify integration by projectId
   */
  async getShopifyIntegration(projectId: string) {
    return this.prisma.integration.findUnique({
      where: {
        projectId_type: {
          projectId,
          type: IntegrationType.SHOPIFY,
        },
      },
    });
  }

  /**
   * Check project ownership
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
