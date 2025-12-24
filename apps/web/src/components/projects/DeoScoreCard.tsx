import type { DeoScoreBreakdown } from '@/lib/deo-issues';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DeoScoreCardProps {
  score: DeoScoreBreakdown | null;
  lastComputedAt?: string | null;
  onRunFirstCrawl?: () => void;
}

export function DeoScoreCard({
  score,
  lastComputedAt,
  onRunFirstCrawl,
}: DeoScoreCardProps) {
  const overall = score?.overall ?? null;
  const formattedDate = lastComputedAt
    ? new Date(lastComputedAt).toLocaleString()
    : null;

  // Obsidian Signal colors
  const scoreColor =
    overall == null
      ? 'text-muted-foreground'
      : overall >= 80
        ? 'text-signal'
        : overall >= 60
          ? 'text-yellow-400'
          : overall >= 40
            ? 'text-orange-400'
            : 'text-destructive';

  return (
    <Card className="border-signal/20 bg-cockpit/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              DEO Score
            </h2>
            <div className="mt-2 flex items-baseline">
              <span
                className={cn('text-5xl font-bold font-mono', scoreColor)}
              >
                {overall != null ? `${overall}` : '--'}
              </span>
              <span className="ml-2 text-sm text-muted-foreground font-mono">
                /100
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="signal" className="uppercase tracking-widest text-[10px]">
              DEO v1.0
            </Badge>
            {formattedDate && (
              <span className="text-[10px] text-muted-foreground font-mono">
                Updated: <span className="text-foreground">{formattedDate}</span>
              </span>
            )}
          </div>
        </div>

        {overall == null ? (
          <div className="mt-4 border-t border-border/10 pt-4">
            <p className="mb-3 text-xs text-muted-foreground">
              No DEO Score computed. Initialize the first crawl to generate your baseline.
            </p>
            {onRunFirstCrawl && (
              <button
                onClick={onRunFirstCrawl}
                className="inline-flex items-center rounded bg-signal/10 px-3 py-1.5 text-xs font-medium text-signal hover:bg-signal/20 transition-colors border border-signal/20 uppercase tracking-wide"
              >
                Run Baseline Crawl
              </button>
            )}
          </div>
        ) : (
          <p className="mt-4 text-[10px] text-muted-foreground uppercase tracking-wide">
            Aggregated signal across Content, Entity, Technical & Visibility vectors.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
