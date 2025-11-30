import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Features - SEOEngine.io',
  description: 'Discover all the powerful features of SEOEngine.io for automated SEO optimization.',
};

const features = [
  {
    category: 'AI-Powered Analysis',
    items: [
      {
        title: 'Smart Title Optimization',
        description: 'AI generates SEO-optimized titles that balance keywords with readability and click-through rates.',
      },
      {
        title: 'Meta Description Generation',
        description: 'Automatically create compelling meta descriptions that improve search visibility and CTR.',
      },
      {
        title: 'Content Suggestions',
        description: 'Get AI-powered recommendations for improving your product descriptions and page content.',
      },
    ],
  },
  {
    category: 'Shopify Integration',
    items: [
      {
        title: 'One-Click Connect',
        description: 'Securely connect your Shopify store with OAuth in seconds. No code changes required.',
      },
      {
        title: 'Product Sync',
        description: 'Automatically sync all your products and keep SEO data up-to-date as you make changes.',
      },
      {
        title: 'Direct Updates',
        description: 'Apply SEO suggestions directly to your Shopify products with a single click.',
      },
    ],
  },
  {
    category: 'Technical SEO',
    items: [
      {
        title: 'Site Crawling',
        description: 'Comprehensive crawling of your website to identify technical SEO issues and opportunities.',
      },
      {
        title: 'Issue Detection',
        description: 'Automatically detect broken links, missing meta tags, duplicate content, and more.',
      },
      {
        title: 'Performance Monitoring',
        description: 'Track page load times and Core Web Vitals that impact your search rankings.',
      },
    ],
  },
  {
    category: 'Analytics & Reporting',
    items: [
      {
        title: 'SEO Score Tracking',
        description: 'Monitor your overall SEO health with easy-to-understand scores and metrics.',
      },
      {
        title: 'Progress Reports',
        description: 'See how your optimizations are improving rankings and organic traffic over time.',
      },
      {
        title: 'Competitor Insights',
        description: 'Understand how you stack up against competitors in your niche.',
      },
    ],
  },
  {
    category: 'Automation',
    items: [
      {
        title: 'Scheduled Scans',
        description: 'Set up automatic scans to continuously monitor your site for new issues.',
      },
      {
        title: 'Bulk Operations',
        description: 'Apply optimizations to hundreds of products at once with bulk actions.',
      },
      {
        title: 'Auto-Fix Suggestions',
        description: 'Let AI automatically fix common issues while you focus on growing your business.',
      },
    ],
  },
  {
    category: 'Team Collaboration',
    items: [
      {
        title: 'Multi-User Access',
        description: 'Invite team members to collaborate on SEO improvements with role-based permissions.',
      },
      {
        title: 'Project Management',
        description: 'Organize multiple stores and websites into projects for easy management.',
      },
      {
        title: 'Activity History',
        description: 'Track all changes and optimizations with a complete audit trail.',
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features for Better SEO
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to optimize your Shopify store or website for search engines,
            powered by AI and automation.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {features.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-16 last:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                {section.category}
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {section.items.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to supercharge your SEO?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Start your free trial today and see the difference AI-powered SEO can make.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
