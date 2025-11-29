export interface Plan {
  id: string;
  name: string;
  price: number; // monthly price in cents
  features: string[];
  limits: {
    projects: number;
    scansPerMonth: number;
    aiSuggestionsPerMonth: number;
  };
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Up to 2 projects',
      '10 scans per month',
      '5 AI suggestions per month',
      'Basic SEO analysis',
    ],
    limits: {
      projects: 2,
      scansPerMonth: 10,
      aiSuggestionsPerMonth: 5,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 2900, // $29/month
    features: [
      'Up to 5 projects',
      '100 scans per month',
      '50 AI suggestions per month',
      'Advanced SEO analysis',
      'Email support',
    ],
    limits: {
      projects: 5,
      scansPerMonth: 100,
      aiSuggestionsPerMonth: 50,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 7900, // $79/month
    features: [
      'Up to 20 projects',
      '500 scans per month',
      '200 AI suggestions per month',
      'Advanced SEO analysis',
      'Priority email support',
      'API access',
    ],
    limits: {
      projects: 20,
      scansPerMonth: 500,
      aiSuggestionsPerMonth: 200,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 19900, // $199/month
    features: [
      'Unlimited projects',
      'Unlimited scans',
      'Unlimited AI suggestions',
      'Advanced SEO analysis',
      'Dedicated support',
      'API access',
      'Custom integrations',
    ],
    limits: {
      projects: -1, // -1 = unlimited
      scansPerMonth: -1,
      aiSuggestionsPerMonth: -1,
    },
  },
];

export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId);
}
