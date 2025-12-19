import {
  BadRequestException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Post,
  Body,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { isE2EMode } from '../config/test-env-guard';
import {
  createTestUser,
  createTestProject,
  createTestProducts,
  createTestShopifyStoreConnection,
} from './index';

class ConnectShopifyBody {
  projectId!: string;
}

@Controller('testkit/e2e')
export class E2eTestkitController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private ensureE2eMode(): void {
    if (!isE2EMode()) {
      throw new ForbiddenException('E2E testkit endpoints are disabled');
    }
  }

  /**
   * POST /testkit/e2e/seed-first-deo-win
   *
   * Seed a Pro-plan user + project + 3 products with missing SEO fields,
   * but WITHOUT a connected store or crawl/DEO state.
   *
   * Returns:
   * - user (id, email)
   * - projectId
   * - productIds[]
   * - accessToken (JWT for the user)
   */
  @Post('seed-first-deo-win')
  async seedFirstDeoWin() {
    this.ensureE2eMode();

    const { user } = await createTestUser(this.prisma as any, {
      plan: 'pro',
    });

    const project = await createTestProject(this.prisma as any, {
      userId: user.id,
    });

    const products = await createTestProducts(this.prisma as any, {
      projectId: project.id,
      count: 3,
      withSeo: false,
      withIssues: true,
    });

    const accessToken = this.jwtService.sign({ sub: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      projectId: project.id,
      productIds: products.map((p) => p.id),
      accessToken,
    };
  }

  /**
   * POST /testkit/e2e/seed-playbook-no-eligible-products
   *
   * Seed a Pro-plan user + project where all products already have complete SEO metadata.
   * Used to verify Automation Playbooks zero-eligibility UX and gating.
   *
   * Returns:
   * - user (id, email)
   * - projectId
   * - accessToken
   */
  @Post('seed-playbook-no-eligible-products')
  async seedPlaybookNoEligibleProducts() {
    this.ensureE2eMode();

    const { user } = await createTestUser(this.prisma as any, {
      plan: 'pro',
    });

    const project = await createTestProject(this.prisma as any, {
      userId: user.id,
    });

    await createTestProducts(this.prisma as any, {
      projectId: project.id,
      count: 3,
      withSeo: true,
      withIssues: false,
    });

    const accessToken = this.jwtService.sign({ sub: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      projectId: project.id,
      accessToken,
    };
  }

  /**
   * POST /testkit/e2e/connect-shopify
   *
   * In E2E mode, creates a mocked Shopify integration for the project.
   * No real OAuth or Shopify calls are made.
   */
  @Post('connect-shopify')
  async connectShopify(@Body() body: ConnectShopifyBody) {
    this.ensureE2eMode();

    if (!body?.projectId) {
      throw new BadRequestException('projectId is required');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: body.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const integration = await createTestShopifyStoreConnection(
      this.prisma as any,
      {
        projectId: project.id,
      },
    );

    return {
      projectId: project.id,
      shopDomain: integration.externalId,
    };
  }

  // ==========================================================================
  // [SELF-SERVICE-1] E2E Seeds
  // ==========================================================================

  /**
   * POST /testkit/e2e/seed-self-service-user
   *
   * Seed a user with chosen plan and some runs (including reused) for AI usage page validation.
   * Also creates at least one Shopify-connected project for stores page validation.
   *
   * Body:
   * - plan: "free" | "pro" | "business" (default: "pro")
   * - accountRole: "OWNER" | "EDITOR" | "VIEWER" (default: "OWNER")
   * - includeRuns: boolean (default: true)
   *
   * Returns:
   * - user (id, email, accountRole)
   * - projectId
   * - shopDomain
   * - accessToken
   */
  @Post('seed-self-service-user')
  async seedSelfServiceUser(
    @Body()
    body: {
      plan?: string;
      accountRole?: 'OWNER' | 'EDITOR' | 'VIEWER';
      includeRuns?: boolean;
    } = {},
  ) {
    this.ensureE2eMode();

    const plan = body.plan ?? 'pro';
    const accountRole = body.accountRole ?? 'OWNER';
    const includeRuns = body.includeRuns !== false;

    // Create user with specified accountRole
    const { user } = await createTestUser(this.prisma as any, {
      plan,
      accountRole,
    });

    // Create project with Shopify connection
    const project = await createTestProject(this.prisma as any, {
      userId: user.id,
    });

    const integration = await createTestShopifyStoreConnection(
      this.prisma as any,
      {
        projectId: project.id,
      },
    );

    // Optionally seed some AI usage runs (including reused)
    if (includeRuns) {
      const now = new Date();
      const testPlaybookId = 'test-playbook-id';
      const testScopeId = 'test-scope-id';
      const testRulesHash = 'test-rules-hash';

      // Create some preview runs with AI
      for (let i = 0; i < 5; i++) {
        await this.prisma.automationPlaybookRun.create({
          data: {
            project: { connect: { id: project.id } },
            createdBy: { connect: { id: user.id } },
            playbookId: testPlaybookId,
            scopeId: testScopeId,
            rulesHash: testRulesHash,
            idempotencyKey: `preview-ai-${i}-${Date.now()}`,
            runType: 'PREVIEW_GENERATE',
            status: 'SUCCEEDED',
            aiUsed: true,
            createdAt: new Date(now.getTime() - i * 60000),
          },
        });
      }

      // Create some reused runs (no AI)
      for (let i = 0; i < 3; i++) {
        const originalRun = await this.prisma.automationPlaybookRun.findFirst({
          where: { createdByUserId: user.id, aiUsed: true },
        });

        await this.prisma.automationPlaybookRun.create({
          data: {
            project: { connect: { id: project.id } },
            createdBy: { connect: { id: user.id } },
            playbookId: testPlaybookId,
            scopeId: testScopeId,
            rulesHash: testRulesHash,
            idempotencyKey: `preview-reuse-${i}-${Date.now()}`,
            runType: 'PREVIEW_GENERATE',
            status: 'SUCCEEDED',
            aiUsed: false,
            reusedFromRunId: originalRun?.id,
            reused: true,
            createdAt: new Date(now.getTime() - (5 + i) * 60000),
          },
        });
      }

      // Create some APPLY runs (should never use AI per invariant)
      for (let i = 0; i < 2; i++) {
        await this.prisma.automationPlaybookRun.create({
          data: {
            project: { connect: { id: project.id } },
            createdBy: { connect: { id: user.id } },
            playbookId: testPlaybookId,
            scopeId: testScopeId,
            rulesHash: testRulesHash,
            idempotencyKey: `apply-${i}-${Date.now()}`,
            runType: 'APPLY',
            status: 'SUCCEEDED',
            aiUsed: false, // APPLY never uses AI
            createdAt: new Date(now.getTime() - (8 + i) * 60000),
          },
        });
      }
    }

    // Generate JWT with session ID
    const session = await this.prisma.userSession.create({
      data: {
        userId: user.id,
        lastSeenAt: new Date(),
      },
    });

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        accountRole: user.accountRole,
      },
      projectId: project.id,
      shopDomain: integration.externalId,
      accessToken,
    };
  }

  /**
   * POST /testkit/e2e/seed-self-service-editor
   *
   * Convenience endpoint: seeds a user with EDITOR accountRole.
   * Same as seed-self-service-user with accountRole=EDITOR.
   */
  @Post('seed-self-service-editor')
  async seedSelfServiceEditor() {
    return this.seedSelfServiceUser({ accountRole: 'EDITOR', plan: 'pro' });
  }

  /**
   * POST /testkit/e2e/seed-self-service-viewer
   *
   * Convenience endpoint: seeds a user with VIEWER accountRole.
   * Same as seed-self-service-user with accountRole=VIEWER.
   */
  @Post('seed-self-service-viewer')
  async seedSelfServiceViewer() {
    return this.seedSelfServiceUser({ accountRole: 'VIEWER', plan: 'pro' });
  }
}
