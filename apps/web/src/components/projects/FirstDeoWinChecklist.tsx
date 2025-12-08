'use client';

interface FirstDeoWinChecklistProps {
  projectName?: string;
  hasConnectedSource: boolean;
  hasRunCrawl: boolean;
  hasDeoScore: boolean;
  hasOptimizedThreeProducts: boolean;
  onConnectSource: () => void;
  onRunFirstCrawl: () => void;
  onViewScoreAndIssues: () => void;
  onGoToProducts: () => void;
}

interface Step {
  id: string;
  label: string;
  description: string;
  done: boolean;
  ctaLabel: string;
  onAction: () => void;
}

export function FirstDeoWinChecklist({
  projectName,
  hasConnectedSource,
  hasRunCrawl,
  hasDeoScore,
  hasOptimizedThreeProducts,
  onConnectSource,
  onRunFirstCrawl,
  onViewScoreAndIssues,
  onGoToProducts,
}: FirstDeoWinChecklistProps) {
  const steps: Step[] = [
    {
      id: 'connect_source',
      label: 'Connect your store or site',
      description: 'Connect Shopify or your site so EngineO can crawl and optimize your catalog.',
      done: hasConnectedSource,
      ctaLabel: 'Connect store',
      onAction: onConnectSource,
    },
    {
      id: 'run_first_crawl',
      label: 'Run your first DEO crawl',
      description: 'Crawl your site to discover pages, products, and surface DEO issues.',
      done: hasRunCrawl,
      ctaLabel: 'Run crawl now',
      onAction: onRunFirstCrawl,
    },
    {
      id: 'review_deo_score',
      label: 'Review your DEO Score & issues',
      description: 'See your overall DEO Score and prioritized list of issues to fix.',
      done: hasDeoScore,
      ctaLabel: 'View DEO Score',
      onAction: onViewScoreAndIssues,
    },
    {
      id: 'optimize_three_products',
      label: 'Optimize 3 key products with AI',
      description: 'Use AI suggestions to improve SEO metadata for at least 3 products.',
      done: hasOptimizedThreeProducts,
      ctaLabel: 'Go to Products',
      onAction: onGoToProducts,
    },
  ];

  const completedCount = steps.filter((step) => step.done).length;

  // Hide checklist when all steps are complete
  if (completedCount === steps.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm mb-6">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900">First DEO win</h3>
        {projectName && (
          <p className="text-xs text-gray-500">for {projectName}</p>
        )}
      </div>

      <p className="text-xs text-gray-600 mb-3">
        Follow these steps to get your first obvious DEO win in about 10–20 minutes.
      </p>

      <p className="text-xs font-medium text-gray-700 mb-4">
        {completedCount} of {steps.length} steps complete
      </p>

      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start gap-3">
            {/* Status indicator */}
            <div className="flex-shrink-0 mt-0.5">
              {step.done ? (
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="9" strokeWidth="2" />
                </svg>
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${step.done ? 'text-gray-500' : 'text-gray-900'}`}>
                {step.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
            </div>

            {/* Action button */}
            <div className="flex-shrink-0">
              {step.done ? (
                <button
                  onClick={step.onAction}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View
                </button>
              ) : (
                <button
                  onClick={step.onAction}
                  className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  {step.ctaLabel}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
