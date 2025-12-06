export type PlanId = 'free' | 'pro' | 'business';

export interface PlanLimits {
  projects: number; // -1 = unlimited
  crawledPages: number; // -1 = unlimited
  automationSuggestionsPerDay: number; // -1 = unlimited
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // monthly price in cents
  features: string[];
  limits: PlanLimits;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '1 project',
      '50 crawled pages',
      '5 automation suggestions per day',
      'Basic SEO analysis',
    ],
    limits: {
      projects: 1,
      crawledPages: 50,
      automationSuggestionsPerDay: 5,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2900, // $29/month
    features: [
      '5 projects',
      '500 crawled pages',
      '25 automation suggestions per day',
      'Advanced SEO analysis',
      'Priority support',
    ],
    limits: {
      projects: 5,
      crawledPages: 500,
      automationSuggestionsPerDay: 25,
    },
  },
  {
    id: 'business',
    name: 'Business',
    price: 9900, // $99/month
    features: [
      'Unlimited projects',
      'Unlimited crawled pages',
      'Unlimited automation suggestions',
      'Advanced SEO analysis',
      'Priority support',
      'API access',
    ],
    limits: {
      projects: -1,
      crawledPages: -1,
      automationSuggestionsPerDay: -1,
    },
  },
];

export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId);
}

/** Stripe Price IDs - set via environment */
export const STRIPE_PRICES: Record<Exclude<PlanId, 'free'>, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
};
