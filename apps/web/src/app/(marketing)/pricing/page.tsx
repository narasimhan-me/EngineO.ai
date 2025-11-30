'use client';

import { useState } from 'react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    monthlyPrice: '$19',
    yearlyPrice: '$15',
    period: 'mo',
    description: 'For new stores and side hustlers.',
    features: [
      'Up to 3 Projects',
      '500 Synced Products',
      '200k AI Tokens / Month',
      'SEO Audit & Score',
      'AI Metadata Suggestions',
      'Basic Automations',
      'Shopify Integration',
    ],
    cta: 'Start Free',
    href: '/signup?plan=starter',
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: '$59',
    yearlyPrice: '$47',
    period: 'mo',
    description: 'For growing eCommerce brands.',
    features: [
      'Everything in Starter',
      '10 Projects',
      '5,000 Products',
      '2M AI Tokens / Month',
      'Smart Schema Markup',
      'AI Content Generator',
      'Competitor Insights',
      'Redirect Manager',
    ],
    cta: 'Upgrade to Pro',
    href: '/signup?plan=pro',
    highlighted: true,
  },
  {
    name: 'Agency',
    monthlyPrice: '$199',
    yearlyPrice: '$159',
    period: 'mo',
    description: 'For agencies and large stores.',
    features: [
      'Unlimited Projects',
      'Unlimited Products',
      '10M AI Tokens / Month',
      'Team Accounts',
      'Advanced Automation',
      'Weekly Client Reports',
      'Priority Support',
    ],
    cta: 'Talk to Sales',
    href: '/contact',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'How does the free trial work?',
    answer: 'Start with our Starter plan free for 14 days. No credit card required. You get full access to all Starter features during the trial period.',
  },
  {
    question: 'Will this affect my Shopify theme?',
    answer: 'No. SEOEngine.io only modifies product metadata (titles, descriptions, alt tags) and structured data. We never touch your theme files or design.',
  },
  {
    question: 'Do I need a developer?',
    answer: 'Not at all. SEOEngine.io is designed for non-technical users. Connect your Shopify store with one click and start optimizing immediately.',
  },
  {
    question: 'What is an AI token?',
    answer: 'AI tokens are used when generating content like product descriptions, blog posts, or meta tags. Each plan includes a monthly token allocation. Unused tokens don\'t roll over.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your current billing period.',
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Simple, transparent pricing for every type of business
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isYearly ? 'bg-sky-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  isYearly ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
              Annual
            </span>
            {isYearly && (
              <span className="text-xs font-semibold text-sky-600 bg-sky-100 px-2 py-1 rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 border-2 ${
                  plan.highlighted
                    ? 'border-sky-500 ring-2 ring-sky-500 ring-opacity-20 shadow-lg'
                    : 'border-slate-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-900">
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-slate-500 ml-1">/{plan.period}</span>
                </div>
                <p className="text-slate-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-sky-500 mr-2 mt-0.5 flex-shrink-0"
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
                      <span className="text-slate-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-sky-500 text-white hover:bg-sky-600'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
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
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to automate your SEO?
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Start your free trial today. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-lg"
          >
            Start Free Today
          </Link>
        </div>
      </section>
    </div>
  );
}
