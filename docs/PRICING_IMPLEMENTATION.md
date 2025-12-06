# EngineO.ai — Developer Implementation Guide for Pricing, Entitlements & Usage

**Version 1.0** — December 2025  
**Author:** Narasimhan Mahendrakumar

---

## 1. Purpose

This document explains how to implement the pricing system for EngineO.ai at the code level, including:

- Stripe setup
- Subscription model
- Plan entitlements
- Token & usage tracking
- Hard/soft limits
- API middleware for gating
- UI gating
- Future-ready architecture for upcoming Business/Enterprise tiers

This file does not define pricing strategy (see `PRICING_STRATEGY.md`) — it defines how to build it.

---

## 2. Current Stack Overview

### Backend

- NestJS (`apps/api`)
- Prisma ORM
- PostgreSQL
- Stripe billing
- JWT auth
- Role-based access control

### Frontend

- Next.js 14 (`apps/web`)
- React server components
- Client components for billing UI

### Data Model

Key models in `schema.prisma` that relate to pricing:

```prisma
model Subscription {
  id                   String   @id @default(cuid())
  user                 User     @relation(fields: [userId], references: [id])
  userId               String   @unique
  plan                 String
  stripeCustomerId     String?
  stripeSubscriptionId String?
  status               String   @default("active")
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

**Important:**

- For v1, we store the plan as a simple string (`starter`, `pro`, `agency`).
- Later we will add `business` and `enterprise`.

---

## 3. Pricing Tiers — Developer Definitions

Define in: `apps/api/src/billing/plans.ts`

### 3.1. Plan Structure (Current Implementation - BILLING-1)

```typescript
export type PlanId = 'free' | 'pro' | 'business';

export interface PlanLimits {
  projects: number;                    // -1 = unlimited
  crawledPages: number;                // -1 = unlimited
  automationSuggestionsPerDay: number; // -1 = unlimited
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // monthly price in cents
  features: string[];
  limits: PlanLimits;
}
```

### 3.2. Current Plans (v1)

```typescript
export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['1 project', '50 crawled pages', '5 automation suggestions per day', 'Basic SEO analysis'],
    limits: { projects: 1, crawledPages: 50, automationSuggestionsPerDay: 5 },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2900, // $29/month
    features: ['5 projects', '500 crawled pages', '25 automation suggestions per day', 'Advanced SEO analysis', 'Priority support'],
    limits: { projects: 5, crawledPages: 500, automationSuggestionsPerDay: 25 },
  },
  {
    id: 'business',
    name: 'Business',
    price: 9900, // $99/month
    features: ['Unlimited projects', 'Unlimited crawled pages', 'Unlimited automation suggestions', 'Advanced SEO analysis', 'Priority support', 'API access'],
    limits: { projects: -1, crawledPages: -1, automationSuggestionsPerDay: -1 },
  },
];
```

### 3.3. Stripe Price Mapping

```typescript
export const STRIPE_PRICES: Record<Exclude<PlanId, 'free'>, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
};
```

### 3.4. Legacy Plan Structure (for reference)

```typescript
export type PlanID = 'starter' | 'pro' | 'agency';

export interface PlanEntitlements {
  projects: number;           // max projects
  items: number;              // max products/pages
  tokens: number;             // monthly AI tokens
  automations: 'basic' | 'advanced';
  teamRoles: boolean;
  reporting: 'basic' | 'advanced';
  support: 'standard' | 'priority';
}
```

---

## 4. Subscription Sync Logic (Stripe → DB)

**Stripe is the source of truth for:**

- Status (active / past_due / canceled)
- Billing cycle
- Plan
- Customer

**EngineO stores:**

- Plan ID
- Token allowance
- Usage counters

### Required Stripe Webhooks

In NestJS (`apps/api`):

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Implement Handler at:** `POST /billing/webhook`

### Webhook responsibilities:

- Map Stripe price/product → internal planId
- Update Subscription record:
  - `plan`
  - `status`
  - `currentPeriodStart`
  - `currentPeriodEnd`
- Reset token counters at the start of each billing cycle
- Mark canceled subscriptions as read-only access

---

## 5. Entitlements Enforcement (Backend)

All API routes that modify data must validate entitlements.

### 5.1. Service Location

Implemented in: `apps/api/src/billing/entitlements.service.ts`

### 5.2. Current Implementation (EntitlementsService)

```typescript
@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPlan(userId: string): Promise<PlanId> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    if (!subscription || subscription.status !== 'active') {
      return 'free';
    }
    const plan = getPlanById(subscription.plan);
    return plan?.id ?? 'free';
  }

  async getEntitlementsSummary(userId: string): Promise<EntitlementsSummary> {
    const planId = await this.getUserPlan(userId);
    const plan = getPlanById(planId) || PLANS[0];
    const projectCount = await this.prisma.project.count({ where: { userId } });
    return {
      plan: plan.id,
      limits: plan.limits,
      usage: { projects: projectCount },
    };
  }

  async ensureCanCreateProject(userId: string): Promise<void> {
    const summary = await this.getEntitlementsSummary(userId);
    if (summary.limits.projects !== -1 && summary.usage.projects >= summary.limits.projects) {
      throw new ForbiddenException(
        `Project limit reached. Your ${summary.plan} plan allows ${summary.limits.projects} project(s). Please upgrade.`
      );
    }
  }
}
```

### 5.3. Usage in Controllers

```typescript
// In ProjectsController
@Post()
@HttpCode(HttpStatus.CREATED)
async createProject(@Request() req: any, @Body() dto: CreateProjectDto) {
  await this.entitlementsService.ensureCanCreateProject(req.user.id);
  return this.projectsService.createProject(req.user.id, dto);
}
```

### 5.4. Legacy Guard Pattern (for reference)

```typescript
@UseGuards(JwtAuthGuard, EntitlementsGuard)
```

---

## 6. Project Limits Enforcement

Check project count before creation:

**Endpoint:** `POST /projects`

```typescript
const count = await prisma.project.count({ where: { userId } });

if (count >= entitlements.projects) {
  throw new ForbiddenException('Project limit reached for your plan.');
}
```

---

## 7. Product/Page Limits Enforcement

During sync (Shopify or crawl):

```typescript
if (totalItems > entitlements.items) {
  throw new ForbiddenException(
    `Your plan supports up to ${entitlements.items} products/pages. Reduce items or upgrade.`
  );
}
```

---

## 8. AI Token Metering

All DEO operations that call OpenAI or Anthropic must record usage.

### Add model:

```prisma
model TokenUsage {
  id        String   @id @default(cuid())
  userId    String
  amount    Int      // tokens consumed
  source    String   // e.g., "metadata", "faq", "deo_audit"
  createdAt DateTime @default(now())
}
```

### Add helper in: `apps/api/src/ai/ai.service.ts`

```typescript
await prisma.tokenUsage.create({
  data: {
    userId,
    amount: tokensUsed,
    source: 'metadata',
  },
});
```

### Monthly Reset

On subscription renewal: reset counters.

---

## 9. Automation Limits

Automation depth (basic vs advanced):

- Starter → simple tasks
- Pro → advanced schema/entity/Q&A generation
- Agency → all playbooks

**Implement gating in each automation entrypoint:**

```typescript
if (plan.automations === 'basic' && requestedAutomation === 'advanced') {
  throw new ForbiddenException(
    'Upgrade to Pro for advanced automations.'
  );
}
```

---

## 10. Team Roles & Permissions

Future-ready structure:

- Starter → no team functionality
- Pro → team roles allowed
- Agency → unlimited seats

Add a `teamMembers` table when ready.

---

## 11. Reporting Features

Gated features:

- Starter → basic visibility
- Pro/Agency → advanced DEO, entities, AI visibility charts

**Add gating with:**

```typescript
if (plan.reporting === 'basic') ...
```

---

## 12. UI Gating (Frontend)

In Next.js:

### Hook

`useEntitlements()` derived from `/users/me` response.

**Attach entitlements in backend JWT payload:**

```typescript
return {
  ...user,
  entitlements: plan,
};
```

### UI example:

```tsx
{!entitlements.teamRoles && (
  <UpgradeBanner message="Team roles are available on Pro and Agency plans." />
)}
```

---

## 13. Upgrade Flow

Flow:

1. User clicks upgrade
2. Redirects to Stripe Checkout with planId
3. Stripe returns user to `/settings/billing/success`
4. Webhook updates subscription in DB
5. App refreshes entitlements

---

## 14. Audit Logging

All entitlement-denied actions should log:

- `userId`
- `action`
- `resource`
- `plan`
- `timestamp`

For security & support.

---

## 15. Future: Business & Enterprise Tiers

### Planned additions:

**Business Tier**

- 20 projects
- 15M tokens
- Team roles
- Advanced automations
- API access
- Quarterly reports

**Enterprise Tier**

- SSO / SCIM
- Custom DEO score weighting
- Custom entity graphs
- Dedicated strategist
- Private cloud

**Implementation pattern remains identical.**  
Just extend `PlanID` and `PLANS`.

---

## 16. Summary

This pricing implementation provides:

- Clean entitlement definitions
- Robust backend enforcement
- Predictable token metering
- Future-ready stripe sync logic
- UI-friendly entitlement exposure
- Extendable plan architecture

EngineO.ai can now:

- Launch pricing tiers
- Scale to Business/Enterprise
- Maintain control over compute cost
- Deliver value across DEO, AEO, PEO, and VEO
