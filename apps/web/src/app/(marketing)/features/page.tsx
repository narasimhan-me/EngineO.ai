import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Features - SEOEngine.io',
  description: 'Everything you need to automate SEO — without hiring a full team. AI-powered optimization for Shopify and eCommerce.',
};

const featureCategories = [
  {
    title: 'AI SEO Automation',
    description: 'Let AI handle the heavy lifting of SEO optimization.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    features: [
      'Auto-fix missing titles, H1s, descriptions',
      'Auto-generate alt tags',
      'Fix broken links',
      'Image compression and optimization',
    ],
  },
  {
    title: 'Content Intelligence',
    description: 'AI-powered content creation and optimization.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    features: [
      'Keyword explorer',
      'Keyword clustering',
      'Content scoring',
      'Competitor analysis',
      'AI blog generator',
    ],
  },
  {
    title: 'eCommerce SEO',
    description: 'Deep Shopify integration for product optimization.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    features: [
      'Shopify product sync',
      'Variant SEO',
      'Collection page automation',
      'Schema markup for products',
      'Automated insights',
    ],
  },
  {
    title: 'Performance Monitoring',
    description: 'Track rankings and site health in real-time.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    features: [
      'Rank tracking',
      'GSC integration',
      'Analytics integration',
      'Site speed performance',
      'Crawl health',
    ],
  },
  {
    title: 'Competitor Insights',
    description: 'Stay ahead of your competition.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    features: [
      'Keyword overlap analysis',
      'Content gaps',
      'Ranking improvements',
      'Backlink monitoring',
    ],
  },
  {
    title: 'Automations',
    description: 'Set it and forget it.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    features: [
      'Scheduled SEO audits',
      'Auto-fix common issues',
      'Weekly reports',
      'Alert notifications',
    ],
  },
  {
    title: 'Local SEO',
    description: 'Optimize for local search results.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    features: [
      'Google Business Profile insights',
      'Local keyword generation',
      'Auto landing page templates',
    ],
  },
  {
    title: 'Social Media Auto Posting',
    description: 'Amplify your content reach.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    features: [
      'Auto-share new content',
      'Schedule social posts',
      'Multi-platform support',
      'Performance tracking',
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Everything you need to automate SEO
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Without hiring a full team. AI-powered optimization for Shopify and eCommerce stores.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureCategories.map((category, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-sky-300 transition-colors"
              >
                <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-4">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm">
                      <svg
                        className="w-4 h-4 text-sky-500 mr-2 mt-0.5 flex-shrink-0"
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
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Built for modern eCommerce teams
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to dominate search rankings
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Core Automation */}
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Core Automation</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Automated SEO issue detection</span>
                    <p className="text-slate-600 text-sm">Continuously scan for and fix SEO problems</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">AI-written metadata at scale</span>
                    <p className="text-slate-600 text-sm">Generate optimized titles and descriptions in bulk</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Schema markup generator</span>
                    <p className="text-slate-600 text-sm">Automatic structured data for rich snippets</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Redirect manager</span>
                    <p className="text-slate-600 text-sm">Handle 301s and broken links effortlessly</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Shopify Deep Integration */}
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Shopify Deep Integration</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Product sync</span>
                    <p className="text-slate-600 text-sm">Automatic sync of all products and collections</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Variant sync</span>
                    <p className="text-slate-600 text-sm">Optimize every product variant for search</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">AI SEO writing</span>
                    <p className="text-slate-600 text-sm">Generate product descriptions that convert</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Auto-apply SEO fixes</span>
                    <p className="text-slate-600 text-sm">One-click updates directly to your store</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* AI Content Generation */}
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">AI Content Generation</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Blog writer</span>
                    <p className="text-slate-600 text-sm">AI-generated blog posts optimized for SEO</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Product description enhancer</span>
                    <p className="text-slate-600 text-sm">Transform basic descriptions into compelling copy</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Landing page generator</span>
                    <p className="text-slate-600 text-sm">Create SEO-optimized landing pages instantly</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Brand voice learning</span>
                    <p className="text-slate-600 text-sm">AI that writes in your brand&apos;s unique style</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Competitive Insights */}
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Competitive Insights</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Keyword overlap</span>
                    <p className="text-slate-600 text-sm">See which keywords you share with competitors</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Content gaps</span>
                    <p className="text-slate-600 text-sm">Discover content opportunities you&apos;re missing</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Ranking improvements</span>
                    <p className="text-slate-600 text-sm">Track your gains against the competition</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-slate-900">Backlink monitoring</span>
                    <p className="text-slate-600 text-sm">Monitor competitor link building strategies</p>
                  </div>
                </li>
              </ul>
            </div>
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
            Start your free trial today and see the difference AI-powered SEO can make.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
