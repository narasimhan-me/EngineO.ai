import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PLANS, getPlanById, Plan } from './plans';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all available plans
   */
  getPlans(): Plan[] {
    return PLANS;
  }

  /**
   * Get user's current subscription
   */
  async getSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      // Return a default "free" subscription for users without one
      return {
        plan: 'free',
        status: 'active',
        currentPeriodStart: null,
        currentPeriodEnd: null,
      };
    }

    return subscription;
  }

  /**
   * Create or update user's subscription
   * In production, this would integrate with Stripe
   */
  async updateSubscription(userId: string, planId: string) {
    const plan = getPlanById(planId);
    if (!plan) {
      throw new BadRequestException(`Invalid plan: ${planId}`);
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: Integrate with Stripe for payment processing
    // For now, just update the subscription in the database

    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    if (existingSubscription) {
      return this.prisma.subscription.update({
        where: { userId },
        data: {
          plan: planId,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    }

    return this.prisma.subscription.create({
      data: {
        userId,
        plan: planId,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    // TODO: Integrate with Stripe to cancel subscription
    // For now, just update status to canceled

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        status: 'canceled',
      },
    });
  }

  /**
   * Handle Stripe webhook events
   * TODO: Implement full webhook handling for production
   */
  async handleWebhook(payload: any, signature: string) {
    // TODO: Verify Stripe signature
    // TODO: Handle different event types (subscription.created, subscription.updated, etc.)
    // For now, just log the event
    console.log('Received Stripe webhook:', payload.type);
    return { received: true };
  }
}
