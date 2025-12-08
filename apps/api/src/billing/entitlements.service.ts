import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { getPlanById, PlanId, PlanLimits, PLANS } from './plans';

type EntitlementFeature = 'projects' | 'crawl' | 'suggestions';

export interface EntitlementsSummary {
  plan: PlanId;
  limits: PlanLimits;
  usage: {
    projects: number;
  };
}

@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get the effective plan for a user
   */
  async getUserPlan(userId: string): Promise<PlanId> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.status !== 'active') {
      return 'free';
    }

    // Validate the plan ID is valid
    const plan = getPlanById(subscription.plan);
    if (!plan) {
      return 'free';
    }

    return plan.id;
  }

  /**
   * Get entitlements summary for a user (plan, limits, usage)
   */
  async getEntitlementsSummary(userId: string): Promise<EntitlementsSummary> {
    const planId = await this.getUserPlan(userId);
    const plan = getPlanById(planId) || PLANS[0]; // Default to free

    const projectCount = await this.prisma.project.count({
      where: { userId },
    });

    return {
      plan: plan.id,
      limits: plan.limits,
      usage: {
        projects: projectCount,
      },
    };
  }

  /**
   * Generic entitlement enforcement helper for any feature.
   * Throws a ForbiddenException with a consistent payload when the limit is reached.
   */
  async enforceEntitlement(
    userId: string,
    feature: EntitlementFeature,
    current: number,
    allowedOverride?: number,
  ): Promise<void> {
    const planId = await this.getUserPlan(userId);
    const plan = getPlanById(planId) || PLANS[0];

    let allowedFromPlan: number;
    switch (feature) {
      case 'projects':
        allowedFromPlan = plan.limits.projects;
        break;
      case 'crawl':
        allowedFromPlan = plan.limits.crawledPages;
        break;
      case 'suggestions':
        allowedFromPlan = plan.limits.automationSuggestionsPerDay;
        break;
      default:
        // Should never happen, but default to unlimited for safety.
        allowedFromPlan = -1;
    }

    const allowed = allowedOverride ?? allowedFromPlan;

    // -1 means unlimited
    if (allowed === -1) {
      return;
    }

    if (current >= allowed) {
      const planLabel = plan.id.charAt(0).toUpperCase() + plan.id.slice(1);
      let featureLabel = feature as string;
      if (feature === 'projects') {
        featureLabel = 'projects';
      } else if (feature === 'crawl') {
        featureLabel = 'crawled pages per crawl';
      } else if (feature === 'suggestions') {
        featureLabel = 'automation suggestions per day';
      }

      const message =
        feature === 'projects'
          ? `Project limit reached. Your ${planLabel} plan allows ${allowed} project(s). Please upgrade to create more projects.`
          : `Entitlement limit reached. Your ${planLabel} plan allows ${allowed} ${featureLabel}. Please upgrade your plan to unlock more.`;

      throw new ForbiddenException({
        message,
        error: 'ENTITLEMENTS_LIMIT_REACHED',
        code: 'ENTITLEMENTS_LIMIT_REACHED',
        feature,
        plan: plan.id,
        allowed,
        current,
      });
    }
  }

  /**
   * Check if user can create a new project (hard limit enforcement)
   * Throws ForbiddenException if limit reached
   */
  async ensureCanCreateProject(userId: string): Promise<void> {
    const summary = await this.getEntitlementsSummary(userId);

    await this.enforceEntitlement(
      userId,
      'projects',
      summary.usage.projects,
      summary.limits.projects,
    );
  }
}
