import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EntitlementsService } from '../billing/entitlements.service';
import { ProductIssueFixService } from '../ai/product-issue-fix.service';
import { TokenUsageService, ESTIMATED_METADATA_TOKENS_PER_CALL } from '../ai/token-usage.service';
import { PlanId } from '../billing/plans';

export type AutomationPlaybookId = 'missing_seo_title' | 'missing_seo_description';

export interface PlaybookEstimate {
  projectId: string;
  playbookId: AutomationPlaybookId;
  totalAffectedProducts: number;
  estimatedTokens: number;
  planId: PlanId;
  eligible: boolean;
  canProceed: boolean;
  reasons: string[];
  aiDailyLimit: {
    limit: number;
    used: number;
    remaining: number;
  };
}

export interface PlaybookApplyResult {
  projectId: string;
  playbookId: AutomationPlaybookId;
  totalAffectedProducts: number;
  attempted: number;
  updated: number;
  skipped: number;
  limitReached: boolean;
}

@Injectable()
export class AutomationPlaybooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlementsService: EntitlementsService,
    private readonly productIssueFixService: ProductIssueFixService,
    private readonly tokenUsageService: TokenUsageService,
  ) {}

  private async ensureProjectOwnership(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }
    return project;
  }

  private getPlaybookWhere(
    projectId: string,
    playbookId: AutomationPlaybookId,
  ) {
    if (playbookId === 'missing_seo_title') {
      return {
        projectId,
        OR: [{ seoTitle: null }, { seoTitle: '' }],
      };
    }
    return {
      projectId,
      OR: [{ seoDescription: null }, { seoDescription: '' }],
    };
  }

  async estimatePlaybook(
    userId: string,
    projectId: string,
    playbookId: AutomationPlaybookId,
  ): Promise<PlaybookEstimate> {
    await this.ensureProjectOwnership(projectId, userId);

    const where = this.getPlaybookWhere(projectId, playbookId);
    const totalAffectedProducts = await this.prisma.product.count({ where });

    const { planId, limit } =
      await this.entitlementsService.getAiSuggestionLimit(userId);
    const dailyUsed = await this.entitlementsService.getDailyAiUsage(
      userId,
      projectId,
      'product_optimize',
    );
    const remainingSuggestions =
      limit === -1 ? Number.MAX_SAFE_INTEGER : Math.max(limit - dailyUsed, 0);

    const estimatedTokens =
      totalAffectedProducts * ESTIMATED_METADATA_TOKENS_PER_CALL;
    const tokenCapacity =
      (limit === -1 ? remainingSuggestions : remainingSuggestions) *
      ESTIMATED_METADATA_TOKENS_PER_CALL;

    const reasons: string[] = [];
    const planEligible = planId !== 'free';

    if (!planEligible) {
      reasons.push('plan_not_eligible');
    }

    if (totalAffectedProducts === 0) {
      reasons.push('no_affected_products');
    }

    const dailyLimitBlocking =
      limit !== -1 && remainingSuggestions <= 0;
    if (dailyLimitBlocking) {
      reasons.push('ai_daily_limit_reached');
    }

    const tokenCapBlocking =
      limit !== -1 && estimatedTokens > tokenCapacity;
    if (tokenCapBlocking) {
      reasons.push('token_cap_would_be_exceeded');
    }

    const eligible =
      planEligible &&
      totalAffectedProducts > 0 &&
      remainingSuggestions > 0 &&
      !tokenCapBlocking;

    const canProceed = eligible && reasons.length === 0;

    return {
      projectId,
      playbookId,
      totalAffectedProducts,
      estimatedTokens,
      planId,
      eligible,
      canProceed,
      reasons,
      aiDailyLimit: {
        limit,
        used: dailyUsed,
        remaining: remainingSuggestions,
      },
    };
  }

  async applyPlaybook(
    userId: string,
    projectId: string,
    playbookId: AutomationPlaybookId,
  ): Promise<PlaybookApplyResult> {
    const project = await this.ensureProjectOwnership(projectId, userId);

    const planId = await this.entitlementsService.getUserPlan(userId);
    if (planId === 'free') {
      throw new ForbiddenException({
        message:
          'Bulk AI-powered SEO fixes are available on Pro and Business plans. Upgrade your plan to unlock Automation Playbooks.',
        error: 'ENTITLEMENTS_LIMIT_REACHED',
        code: 'ENTITLEMENTS_LIMIT_REACHED',
        feature: 'automation_playbooks',
        plan: planId,
      });
    }

    const where = this.getPlaybookWhere(projectId, playbookId);
    const candidates = await this.prisma.product.findMany({
      where,
      select: {
        id: true,
      },
      orderBy: {
        lastSyncedAt: 'desc',
      },
    });

    const totalAffectedProducts = candidates.length;
    if (totalAffectedProducts === 0) {
      return {
        projectId,
        playbookId,
        totalAffectedProducts,
        attempted: 0,
        updated: 0,
        skipped: 0,
        limitReached: false,
      };
    }

    const { limit } =
      await this.entitlementsService.getAiSuggestionLimit(userId);
    const dailyUsed = await this.entitlementsService.getDailyAiUsage(
      userId,
      projectId,
      'product_optimize',
    );
    let remainingSuggestions =
      limit === -1 ? candidates.length : Math.max(limit - dailyUsed, 0);

    if (remainingSuggestions <= 0 && limit !== -1) {
      return {
        projectId,
        playbookId,
        totalAffectedProducts,
        attempted: 0,
        updated: 0,
        skipped: 0,
        limitReached: true,
      };
    }

    const toProcess =
      limit === -1
        ? candidates
        : candidates.slice(0, remainingSuggestions);

    let attempted = 0;
    let updated = 0;
    let skipped = 0;
    let limitReached = false;

    for (const candidate of toProcess) {
      if (limit !== -1 && remainingSuggestions <= 0) {
        limitReached = true;
        break;
      }
      try {
        attempted += 1;
        const result =
          await this.productIssueFixService.fixMissingSeoFieldFromIssue({
            userId,
            productId: candidate.id,
            issueType:
              playbookId === 'missing_seo_title'
                ? 'missing_seo_title'
                : 'missing_seo_description',
          });

        if (result.updated) {
          updated += 1;
        } else {
          skipped += 1;
        }

        if (limit !== -1) {
          remainingSuggestions -= 1;
        }
      } catch (err: unknown) {
        skipped += 1;
        if (
          err instanceof Error &&
          'getStatus' in err &&
          typeof (err as any).getStatus === 'function' &&
          (err as any).getStatus() === 429
        ) {
          limitReached = true;
          break;
        }
      }
    }

    const tokensUsed = updated * ESTIMATED_METADATA_TOKENS_PER_CALL;
    if (tokensUsed > 0) {
      await this.tokenUsageService.log(
        project.userId,
        tokensUsed,
        `automation_playbook:${playbookId}`,
      );
    }

    return {
      projectId,
      playbookId,
      totalAffectedProducts,
      attempted,
      updated,
      skipped,
      limitReached,
    };
  }
}
