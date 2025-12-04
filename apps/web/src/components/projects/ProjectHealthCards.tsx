import type { DeoScoreSignals } from '@engineo/shared';

interface ProjectHealthCardsProps {
  signals: DeoScoreSignals | null;
}

export function ProjectHealthCards({ signals }: ProjectHealthCardsProps) {
  const s = signals ?? {};

  const missingMetadataSeverity = 1 - (s.contentCoverage ?? 0);
  const thinContentSeverity = 1 - (s.thinContentQuality ?? 0);
  const weakEntitySeverity = 1 - (s.entityCoverage ?? 0);
  const lowVisibilitySeverity = 1 - (s.serpPresence ?? 0);
  const crawlErrorSeverity = 1 - (s.crawlHealth ?? 0);

  const cards = [
    {
      key: 'missing-metadata',
      label: 'Missing metadata',
      severity: missingMetadataSeverity,
      description: 'Surfaces with incomplete titles or descriptions.',
    },
    {
      key: 'thin-content',
      label: 'Thin content',
      severity: thinContentSeverity,
      description: 'Pages or products with very short content or thin flags.',
    },
    {
      key: 'weak-entities',
      label: 'Weak entity coverage',
      severity: weakEntitySeverity,
      description: 'Surfaces missing clear entity hints (title + H1 / metadata).',
    },
    {
      key: 'low-visibility',
      label: 'Low visibility readiness',
      severity: lowVisibilitySeverity,
      description: 'Surfaces that are not fully SERP / answer ready.',
    },
    {
      key: 'crawl-errors',
      label: 'Crawl errors',
      severity: crawlErrorSeverity,
      description: 'Crawl failures or non-2xx/3xx HTTP responses.',
    },
  ];

  const getSeverityLabel = (value: number) => {
    const v = Math.max(0, Math.min(1, value));
    if (v < 0.2) return 'Low';
    if (v < 0.4) return 'Moderate';
    if (v < 0.7) return 'High';
    return 'Critical';
  };

  const getSeverityColor = (value: number) => {
    const v = Math.max(0, Math.min(1, value));
    if (v < 0.2) return 'bg-green-50 text-green-700 border-green-100';
    if (v < 0.4) return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    if (v < 0.7) return 'bg-orange-50 text-orange-700 border-orange-100';
    return 'bg-red-50 text-red-700 border-red-100';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700">Issues by Category</h3>
      <p className="mt-1 text-xs text-gray-500">
        High-level DEO issue categories derived from normalized signals (0-1). Higher severity
        indicates more work needed.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {cards.map((card) => {
          const severity = card.severity ?? 0;
          const label = getSeverityLabel(severity);
          const color = getSeverityColor(severity);
          return (
            <div
              key={card.key}
              className={`flex flex-col rounded-md border p-3 text-xs ${color}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{card.label}</span>
                <span className="rounded-full bg-white/60 px-2 py-0.5 text-[11px] font-semibold">
                  {label}
                </span>
              </div>
              <p className="mt-1 text-[11px] opacity-80">{card.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
