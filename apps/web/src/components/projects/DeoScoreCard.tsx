import type { DeoScoreBreakdown } from '@engineo/shared';

interface DeoScoreCardProps {
  score: DeoScoreBreakdown | null;
  lastComputedAt?: string | null;
}

export function DeoScoreCard({ score, lastComputedAt }: DeoScoreCardProps) {
  const overall = score?.overall ?? null;
  const formattedDate = lastComputedAt
    ? new Date(lastComputedAt).toLocaleString()
    : null;

  const scoreColor =
    overall == null
      ? 'text-gray-400'
      : overall >= 80
        ? 'text-green-600'
        : overall >= 60
          ? 'text-yellow-500'
          : overall >= 40
            ? 'text-orange-500'
            : 'text-red-500';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-700">DEO Score</h2>
          <p className={`mt-2 text-4xl font-semibold ${scoreColor}`}>
            {overall != null ? `${overall}` : '--'}
            <span className="ml-1 text-base font-normal text-gray-400">/100</span>
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            DEO v1
          </span>
          {formattedDate && (
            <span className="mt-2 text-xs text-gray-500">
              Last computed:{' '}
              <span className="font-medium text-gray-700">{formattedDate}</span>
            </span>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        DEO Score summarizes Content, Entities, Technical, and Visibility signals for this
        project using the v1 model.
      </p>
    </div>
  );
}
