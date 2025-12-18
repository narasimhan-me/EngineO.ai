'use client';

import { useParams } from 'next/navigation';
import { GuardedLink } from '@/components/navigation/GuardedLink';

export default function TechnicalPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Technical & Indexability
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor Core Web Vitals, crawl health, indexability status, and technical SEO
          foundations for your website.
        </p>
      </div>

      {/* Technical Pillar Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Technical Indexability Signals
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          This page will evolve into the workspace for the Technical Indexability
          pillar, covering:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-600">
          <li>Core Web Vitals (LCP, FID, CLS)</li>
          <li>Crawl status and health monitoring</li>
          <li>Indexability diagnostics</li>
          <li>Structured data validation</li>
          <li>HTTP status codes and redirect chains</li>
          <li>Mobile-friendliness checks</li>
        </ul>
      </div>

      {/* Pillar Description */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          About the Technical Indexability Pillar
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          This pillar covers Core Web Vitals, crawl health, indexability status,
          structured data validation, and technical SEO foundations. Technical issues
          can prevent search engines from crawling and indexing your content. Fast,
          accessible, and properly structured pages rank better and provide better user
          experiences.
        </p>
        <p className="mt-3 text-xs text-gray-500">
          Technical DEO issues are tracked under this pillar. View them in the{' '}
          <GuardedLink
            href={`/projects/${projectId}/issues?pillar=technical_indexability`}
            className="font-medium text-blue-600 hover:underline"
          >
            Issues Engine
          </GuardedLink>
          .
        </p>
      </div>
    </div>
  );
}
