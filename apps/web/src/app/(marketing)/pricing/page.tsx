import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing - SEOEngine.io',
  description: 'Simple, transparent pricing for SEO automation. Choose the plan that fits your needs.',
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out SEOEngine',
    features: [
      '1 project',
      '50 pages analyzed',
      'Basic SEO suggestions',
      'Manual crawl only',
      'Community support',
    ],
    cta: 'Start Free',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '$29',
    period: 'per month',
    description: 'Great for small Shopify stores',
    features: [
      '3 projects',
      '500 pages analyzed',
      'AI-powered suggestions',
      'Weekly automated scans',
      'Shopify integration',
      'Email support',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=starter',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$79',
    period: 'per month',
    description: 'For growing eCommerce businesses',
    features: [
      '10 projects',
      '5,000 pages analyzed',
      'Advanced AI suggestions',
      'Daily automated scans',
      'Bulk operations',
      'Priority support',
      'Team collaboration',
      'API access',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For large stores and agencies',
    features: [
      'Unlimited projects',
      'Unlimited pages',
      'Custom AI training',
      'Real-time monitoring',
      'White-label options',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-sm border-2 ${
                  plan.highlighted
                    ? 'border-blue-600 ring-2 ring-blue-600 ring-opacity-50'
                    : 'border-gray-100'
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect
                immediately and we&apos;ll prorate your billing accordingly.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens when I reach my page limit?
              </h3>
              <p className="text-gray-600">
                You&apos;ll receive a notification when you&apos;re approaching your limit.
                You can upgrade to a higher plan or wait until your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 14-day money-back guarantee on all paid plans. If you&apos;re not
                satisfied, contact us for a full refund.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use industry-standard encryption and never store your Shopify
                credentials. All data is processed securely in compliance with GDPR.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
