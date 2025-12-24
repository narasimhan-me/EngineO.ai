import Link from 'next/link';
import type { DeoScoreSignals } from '@/lib/deo-issues';
import { HEALTH_CARD_TO_WORK_QUEUE_MAP, buildWorkQueueUrl } from '@/lib/work-queue';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProjectHealthCardsProps {
  signals: DeoScoreSignals | null;
  projectId: string;
}

export function ProjectHealthCards({ signals, projectId }: ProjectHealthCardsProps) {
  const s = signals ?? {};

  const missingMetadataSeverity = 1 - (s.contentCoverage ?? 0);
  const thinContentSeverity = 1 - (s.thinContentQuality ?? 0);
  const weakEntitySeverity = 1 - (s.entityCoverage ?? 0);
  const lowVisibilitySeverity = 1 - (s.serpPresence ?? 0);
  const crawlErrorSeverity = 1 - (s.crawlHealth ?? 0);

  const cards = [
    {
      key: 'missing-metadata',
      label: 'Missing Metadata',
      severity: missingMetadataSeverity,
      description: 'Surfaces with incomplete titles or descriptions.',
    },
    {
      key: 'thin-content',
      label: 'Thin Content',
      severity: thinContentSeverity,
      description: 'Pages or products with very short content or thin flags.',
    },
    {
      key: 'weak-entities',
      label: 'Weak Entities',
      severity: weakEntitySeverity,
      description: 'Surfaces missing clear entity hints (title + H1 / metadata).',
    },
    {
      key: 'low-visibility',
      label: 'Low Visibility',
      severity: lowVisibilitySeverity,
      description: 'Surfaces that are not fully SERP / answer ready.',
    },
    {
      key: 'crawl-errors',
      label: 'Crawl Errors',
      severity: crawlErrorSeverity,
      description: 'Crawl failures or non-2xx/3xx HTTP responses.',
    },
  ];

  const getSeverityLabel = (value: number) => {
    const v = Math.max(0, Math.min(1, value));
    if (v < 0.2) return 'Stable';
    if (v < 0.4) return 'Concern';
    if (v < 0.7) return 'Risk';
    return 'Critical';
  };

  const getSeverityStyles = (value: number) => {
    const v = Math.max(0, Math.min(1, value));
    if (v < 0.2) return 'border-border/50 hover:border-signal/50';
    if (v < 0.4) return 'border-yellow-900/50 hover:border-yellow-500/50';
    if (v < 0.7) return 'border-orange-900/50 hover:border-orange-500/50';
    // Critical
    return 'border-destructive/40 bg-destructive/5 hover:border-destructive/80';
  };

  const getBadgeVariant = (value: number) => {
    const v = Math.max(0, Math.min(1, value));
    if (v < 0.2) return 'outline';
    if (v < 0.7) return 'secondary';
    return 'destructive';
  }

  // [WORK-QUEUE-1] Build Work Queue URL for each card
  const getWorkQueueUrl = (cardKey: string) => {
    const mapping = HEALTH_CARD_TO_WORK_QUEUE_MAP[cardKey];
    if (mapping) {
      return buildWorkQueueUrl(projectId, {
        tab: mapping.tab,
        actionKey: mapping.actionKey,
      });
    }
    // Fallback to general Work Queue
    return buildWorkQueueUrl(projectId);
  };

  return (
    <Card className="h-full bg-cockpit/20 border-border/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Health Vectors
        </CardTitle>
        <CardDescription className="text-[10px]">
          Real-time analysis of project discovery impediments.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const severity = card.severity ?? 0;
          const label = getSeverityLabel(severity);
          const style = getSeverityStyles(severity);
          const workQueueUrl = getWorkQueueUrl(card.key);

          return (
            <Link
              key={card.key}
              href={workQueueUrl}
              className={cn(
                "group relative flex flex-col justify-between rounded-lg border p-3 transition-all hover:bg-accent/5",
                style
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-foreground">{card.label}</span>
                <Badge variant={getBadgeVariant(severity)} className="text-[10px] h-5 px-1.5 uppercase font-mono">
                  {label}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug group-hover:text-foreground transition-colors">
                {card.description}
              </p>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
