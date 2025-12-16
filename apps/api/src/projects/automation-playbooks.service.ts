import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { createHash } from 'crypto';
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
  /**
   * Server-issued scope identifier. Must be returned by the client when calling
   * the Apply endpoint to ensure the apply targets the exact same set of
   * products that was previewed/estimated.
   */
  scopeId: string;
}

export type PlaybookApplyItemStatus =
  | 'UPDATED'
  | 'SKIPPED'
  | 'FAILED'
  | 'LIMIT_REACHED';

export interface PlaybookApplyItemResult {
  productId: string;
  status: PlaybookApplyItemStatus;
  message: string;
  updatedFields?: {
    seoTitle?: boolean;
    seoDescription?: boolean;
  };
}

export interface PlaybookApplyResult {
  projectId: string;
  playbookId: AutomationPlaybookId;
  totalAffectedProducts: number;
  attemptedCount: number;
  updatedCount: number;
  skippedCount: number;
  limitReached: boolean;
  stopped: boolean;
  stoppedAtProductId?: string;
  failureReason?: string;
  results: PlaybookApplyItemResult[];
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

  /**
   * Compute a deterministic scopeId from the set of affected product IDs.
   * The scopeId is a SHA-256 hash of the sorted product IDs joined by commas.
   * This ensures that the same set of products always produces the same scopeId.
   */
  private computeScopeId(
    projectId: string,
    playbookId: AutomationPlaybookId,
    productIds: string[],
  ): string {
    const sorted = [...productIds].sort();
    const payload = `${projectId}:${playbookId}:${sorted.join(',')}`;
    return createHash('sha256').update(payload).digest('hex').slice(0, 16);
  }

  /**
   * Get the list of product IDs affected by a playbook.
   */
  private async getAffectedProductIds(
    projectId: string,
    playbookId: AutomationPlaybookId,
  ): Promise<string[]> {
    const where = this.getPlaybookWhere(projectId, playbookId);
    const products = await this.prisma.product.findMany({
      where,
      select: { id: true },
      orderBy: { lastSyncedAt: 'desc' },
    });
    return products.map((p) => p.id);
  }

  async estimatePlaybook(
    userId: string,
    projectId: string,
    playbookId: AutomationPlaybookId,
  ): Promise<PlaybookEstimate> {
    await this.ensureProjectOwnership(projectId, userId);

    const affectedProductIds = await this.getAffectedProductIds(
      projectId,
      playbookId,
    );
    const totalAffectedProducts = affectedProductIds.length;
    const scopeId = this.computeScopeId(projectId, playbookId, affectedProductIds);

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
      scopeId,
    };
  }

  async applyPlaybook(
    userId: string,
    projectId: string,
    playbookId: AutomationPlaybookId,
    scopeId: string,
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

    // Fetch affected products and validate scopeId
    const affectedProductIds = await this.getAffectedProductIds(
      projectId,
      playbookId,
    );
    const currentScopeId = this.computeScopeId(
      projectId,
      playbookId,
      affectedProductIds,
    );

    if (scopeId !== currentScopeId) {
      throw new ConflictException({
        message:
          'The product scope has changed since the preview was generated. Please re-run the estimate to get an updated scopeId.',
        error: 'PLAYBOOK_SCOPE_INVALID',
        code: 'PLAYBOOK_SCOPE_INVALID',
        expectedScopeId: currentScopeId,
        providedScopeId: scopeId,
      });
    }

    const candidates = affectedProductIds.map((id) => ({ id }));

    const totalAffectedProducts = candidates.length;
    const startedAt = new Date();

    if (totalAffectedProducts === 0) {
      const result: PlaybookApplyResult = {
        projectId,
        playbookId,
        totalAffectedProducts,
        attemptedCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        limitReached: false,
        stopped: false,
        results: [],
      };
      // eslint-disable-next-line no-console
      console.log('[AutomationPlaybooks] apply.completed', {
        projectId,
        playbookId,
        startedAt,
        finishedAt: new Date(),
        totalAffectedProducts,
        attemptedCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        limitReached: false,
        stopped: false,
        stoppedAtProductId: undefined,
        failureReason: undefined,
      });
      return result;
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
      const result: PlaybookApplyResult = {
        projectId,
        playbookId,
        totalAffectedProducts,
        attemptedCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        limitReached: true,
        stopped: true,
        stoppedAtProductId: undefined,
        failureReason: 'LIMIT_REACHED',
        results: [
          {
            productId: 'LIMIT_REACHED',
            status: 'LIMIT_REACHED',
            message:
              'Daily AI limit reached before Automation Playbook could start. No products were updated.',
          },
        ],
      };
      // eslint-disable-next-line no-console
      console.log('[AutomationPlaybooks] apply.completed', {
        projectId,
        playbookId,
        startedAt,
        finishedAt: new Date(),
        totalAffectedProducts,
        attemptedCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        limitReached: true,
        stopped: true,
        stoppedAtProductId: undefined,
        failureReason: result.failureReason,
      });
      return result;
    }

    const toProcess =
      limit === -1
        ? candidates
        : candidates.slice(0, remainingSuggestions);

    let attemptedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let limitReached = false;
    let stopped = false;
    let stoppedAtProductId: string | undefined;
    let failureReason: string | undefined;
    const results: PlaybookApplyItemResult[] = [];

    // eslint-disable-next-line no-console
    console.log('[AutomationPlaybooks] apply.started', {
      projectId,
      playbookId,
      totalAffectedProducts,
      candidateCount: toProcess.length,
      planId,
      limit,
      dailyUsed,
    });

    for (const candidate of toProcess) {
      if (limit !== -1 && remainingSuggestions <= 0) {
        limitReached = true;
        stopped = true;
        stoppedAtProductId = candidate.id;
        failureReason = 'LIMIT_REACHED';
        results.push({
          productId: candidate.id,
          status: 'LIMIT_REACHED',
          message:
            'Not applied because the daily AI limit was reached for this workspace.',
        });
        break;
      }

      const updatedFields: { seoTitle?: boolean; seoDescription?: boolean } = {};

      const markLimitReachedAndStop = (reason: string, message: string) => {
        limitReached = true;
        stopped = true;
        stoppedAtProductId = candidate.id;
        failureReason = reason;
        results.push({
          productId: candidate.id,
          status: 'LIMIT_REACHED',
          message,
        });
      };

      const markFailureAndStop = (reason: string, message: string) => {
        stopped = true;
        stoppedAtProductId = candidate.id;
        failureReason = reason;
        results.push({
          productId: candidate.id,
          status: 'FAILED',
          message,
        });
      };

      try {
        attemptedCount += 1;
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
          updatedCount += 1;
          if (result.field === 'seoTitle') {
            updatedFields.seoTitle = true;
          } else if (result.field === 'seoDescription') {
            updatedFields.seoDescription = true;
          }
          results.push({
            productId: candidate.id,
            status: 'UPDATED',
            message:
              result.field === 'seoTitle'
                ? 'Updated SEO title.'
                : 'Updated SEO description.',
            updatedFields,
          });
        } else {
          skippedCount += 1;
          let message = 'Skipped.';
          if (result.reason === 'already_has_value') {
            message = 'Skipped: field already had a value.';
          } else if (result.reason === 'no_suggestion') {
            message = 'Skipped: no AI suggestion was available.';
          }
          results.push({
            productId: candidate.id,
            status: 'SKIPPED',
            message,
            updatedFields,
          });
        }

        if (limit !== -1) {
          remainingSuggestions -= 1;
        }
      } catch (err: unknown) {
        const status =
          err instanceof HttpException ? err.getStatus() : undefined;
        const response =
          err instanceof HttpException ? err.getResponse() : undefined;
        const code =
          typeof response === 'object' &&
          response !== null &&
          'code' in response
            ? (response as { code?: string }).code
            : undefined;

        // Daily AI limit reached (non-retryable)
        if (status === HttpStatus.TOO_MANY_REQUESTS && code === 'AI_DAILY_LIMIT_REACHED') {
          markLimitReachedAndStop(
            'LIMIT_REACHED',
            'Stopped because the daily AI limit was reached during this Automation Playbook run.',
          );
          break;
        }

        // Generic rate limit (retryable with bounded retries)
        if (status === HttpStatus.TOO_MANY_REQUESTS) {
          let lastError: unknown = err;
          let retries = 0;
          while (retries < 2) {
            retries += 1;
            await new Promise((resolve) =>
              setTimeout(resolve, 200 * retries),
            );
            try {
              const retryResult =
                await this.productIssueFixService.fixMissingSeoFieldFromIssue({
                  userId,
                  productId: candidate.id,
                  issueType:
                    playbookId === 'missing_seo_title'
                      ? 'missing_seo_title'
                      : 'missing_seo_description',
                });
              if (retryResult.updated) {
                updatedCount += 1;
                if (retryResult.field === 'seoTitle') {
                  updatedFields.seoTitle = true;
                } else if (retryResult.field === 'seoDescription') {
                  updatedFields.seoDescription = true;
                }
                results.push({
                  productId: candidate.id,
                  status: 'UPDATED',
                  message:
                    retryResult.field === 'seoTitle'
                      ? 'Updated SEO title after retry.'
                      : 'Updated SEO description after retry.',
                  updatedFields,
                });
              } else {
                skippedCount += 1;
                let message = 'Skipped after retry.';
                if (retryResult.reason === 'already_has_value') {
                  message =
                    'Skipped after retry: field already had a value.';
                } else if (retryResult.reason === 'no_suggestion') {
                  message =
                    'Skipped after retry: no AI suggestion was available.';
                }
                results.push({
                  productId: candidate.id,
                  status: 'SKIPPED',
                  message,
                  updatedFields,
                });
              }
              if (limit !== -1) {
                remainingSuggestions -= 1;
              }
              lastError = undefined;
              break;
            } catch (retryErr: unknown) {
              lastError = retryErr;
            }
          }
          if (lastError) {
            markFailureAndStop(
              'RATE_LIMIT',
              'Stopped due to repeated rate limit errors while applying this playbook.',
            );
            break;
          }
          continue;
        }

        const errorMessage =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to apply playbook to this product.';
        markFailureAndStop('ERROR', errorMessage);
        break;
      }
    }

    const tokensUsed = updatedCount * ESTIMATED_METADATA_TOKENS_PER_CALL;
    if (tokensUsed > 0) {
      await this.tokenUsageService.log(
        project.userId,
        tokensUsed,
        `automation_playbook:${playbookId}`,
      );
    }

    const finishedAt = new Date();
    // eslint-disable-next-line no-console
    console.log('[AutomationPlaybooks] apply.completed', {
      projectId,
      playbookId,
      totalAffectedProducts,
      attemptedCount,
      updatedCount,
      skippedCount,
      limitReached,
      stopped,
      stoppedAtProductId,
      failureReason,
      startedAt,
      finishedAt,
    });

    return {
      projectId,
      playbookId,
      totalAffectedProducts,
      attemptedCount,
      updatedCount,
      skippedCount,
      limitReached,
      stopped,
      stoppedAtProductId,
      failureReason,
      results,
    };
  }
}
