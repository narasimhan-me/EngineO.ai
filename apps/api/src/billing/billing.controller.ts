import { Controller, Get, Post, Body, UseGuards, Request, Headers } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /**
   * Get all available plans
   */
  @Get('plans')
  getPlans() {
    return this.billingService.getPlans();
  }

  /**
   * Get current user's subscription
   */
  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  async getSubscription(@Request() req: any) {
    return this.billingService.getSubscription(req.user.id);
  }

  /**
   * Update subscription to a new plan
   */
  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(@Request() req: any, @Body() body: { planId: string }) {
    return this.billingService.updateSubscription(req.user.id, body.planId);
  }

  /**
   * Cancel subscription
   */
  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  async cancel(@Request() req: any) {
    return this.billingService.cancelSubscription(req.user.id);
  }

  /**
   * Stripe webhook handler
   * TODO: Add proper signature verification in production
   */
  @Post('webhook')
  async webhook(
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(body, signature);
  }
}
