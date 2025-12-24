'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import { projectsApi } from '@/lib/api';
import type { ProjectInsightsResponse } from '@/lib/insights';
import { InsightsSubnav } from '@/components/projects/InsightsSubnav';
import { Sparkline } from '@/components/projects/Sparkline';

/**
 * [INSIGHTS-1] Project Insights Dashboard
 *
 * Read-only derived insights page showing:
 * - Overview cards (improved, saved, resolved, next)
 * - DEO Progress trends
 * - Issue resolution metrics
 * - Opportunity signals
 *
 * Trust invariant: This page never triggers AI or mutations.
 */
export default function InsightsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [insights, setInsights] = useState<ProjectInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.insights(projectId);
      setInsights(data);
    } catch (err) {
      console.error('[InsightsPage] Failed to fetch insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchInsights();
  }, [router, fetchInsights]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading insights...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  const { overview, progress, issueResolution, opportunities } = insights;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        <p className="text-muted-foreground mt-1">
          Read-only analytics derived from your DEO data. No AI calls, no mutations.
        </p>
      </div>

      {/* Subnav */}
      <InsightsSubnav projectId={projectId} activeTab="overview" />

      {/* Overview Cards */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Improved Card */}
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
          <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">Improved</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-700 dark:text-green-400">
              {overview.improved.deoScore.current}
            </span>
            <span className="text-sm text-green-600 dark:text-green-500/80">
              {overview.improved.deoScore.trend === 'up' && '+'}
              {overview.improved.deoScore.delta} pts
            </span>
          </div>
          <p className="mt-1 text-xs text-green-600 dark:text-green-500/70">
            DEO Score vs {insights.window.days} days ago
          </p>
        </div>

        {/* Saved Card */}
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400">Saved</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {overview.saved.aiRunsAvoidedViaReuse}
            </span>
            <span className="text-sm text-blue-600 dark:text-blue-500/80">
              AI runs avoided
            </span>
          </div>
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-500/70">
            {overview.saved.reuseRatePercent}% reuse rate
          </p>
          <p className="mt-2 text-[11px] text-blue-500 dark:text-blue-400/70">
            {overview.saved.trust.invariantMessage}
          </p>
        </div>

        {/* Resolved Card */}
        <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-4">
          <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400">Resolved</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {overview.resolved.actionsCount}
            </span>
            <span className="text-sm text-purple-600 dark:text-purple-500/80">
              fixes applied
            </span>
          </div>
          <p className="mt-1 text-xs text-purple-600 dark:text-purple-500/70">
            {overview.resolved.why}
          </p>
        </div>

        {/* Next Opportunity Card */}
        <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
          <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-400">Next Opportunity</h3>
          {overview.next ? (
            <>
              <p className="mt-2 text-sm font-medium text-orange-800 dark:text-orange-300">
                {overview.next.title}
              </p>
              <p className="mt-1 text-xs text-orange-600 dark:text-orange-400/80">
                {overview.next.why}
              </p>
              <Link
                href={overview.next.href}
                className="mt-2 inline-flex text-xs font-medium text-orange-700 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300"
              >
                View opportunity &rarr;
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-orange-600 dark:text-orange-400/80">
              No high-priority opportunities found
            </p>
          )}
        </div>
      </section>

      {/* [BILLING-GTM-1] Contextual Upgrade Prompt - appears when quota pressure is high or exhausted */}
      {(overview.saved.quota.usedPercent !== null && overview.saved.quota.usedPercent >= 80) || overview.saved.quota.remaining === 0 ? (
        <section className="mt-6">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  {overview.saved.quota.remaining === 0 ? 'AI Quota Exhausted' : 'AI Quota Running Low'}
                </h3>
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-500/80">
                  You&apos;ve saved {overview.saved.aiRunsAvoidedViaReuse} AI runs via reuse and applied {overview.resolved.actionsCount} fixes this period.
                  {overview.saved.quota.remaining === 0
                    ? ' Your quota has been fully used.'
                    : ` You're at ${overview.saved.quota.usedPercent}% of your monthly limit.`}
                </p>
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-500/70">
                  {overview.saved.trust.invariantMessage}
                </p>
                <Link
                  href="/settings/billing"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                >
                  Upgrade for more AI runs
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* DEO Progress Section */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">DEO Progress</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* DEO Score Trend */}
          <div className="rounded-lg border border-border/10 bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">DEO Score Trend</h3>
            <Sparkline
              data={progress.deoScoreTrend.map(d => ({ x: d.date, y: d.score }))}
              height={120}
              color="#10B981"
            />
          </div>

          {/* Fixes Applied Trend */}
          <div className="rounded-lg border border-border/10 bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Fixes Applied</h3>
            <Sparkline
              data={progress.fixesAppliedTrend.map(d => ({ x: d.date, y: d.count }))}
              height={120}
              color="#6366F1"
            />
          </div>
        </div>

        {/* Open Issues Now */}
        <div className="mt-4 rounded-lg border border-border/10 bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Open Issues</h3>
          <div className="flex gap-6">
            <div className="text-center">
              <span className="block text-2xl font-bold text-destructive">
                {progress.openIssuesNow.critical}
              </span>
              <span className="text-xs text-muted-foreground">Critical</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-yellow-500">
                {progress.openIssuesNow.warning}
              </span>
              <span className="text-xs text-muted-foreground">Warning</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-blue-500">
                {progress.openIssuesNow.info}
              </span>
              <span className="text-xs text-muted-foreground">Info</span>
            </div>
            <div className="text-center border-l border-border/10 pl-6">
              <span className="block text-2xl font-bold text-foreground">
                {progress.openIssuesNow.total}
              </span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>
        </div>
      </section>

      {/* Issue Resolution Section */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Issue Resolution</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* By Pillar */}
          <div className="rounded-lg border border-border/10 bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">By Pillar</h3>
            <div className="space-y-3">
              {issueResolution.byPillar.map(pillar => (
                <div key={pillar.pillarId} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{pillar.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-600 dark:text-green-500">
                      {pillar.resolved} fixed
                    </span>
                    <span className="text-xs text-muted-foreground/50">/</span>
                    <span className="text-sm text-muted-foreground">
                      {pillar.open} open
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent & High Impact */}
          <div className="rounded-lg border border-border/10 bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">High-Impact Open Issues</h3>
            {issueResolution.openHighImpact.length === 0 ? (
              <p className="text-sm text-muted-foreground">No high-impact issues open</p>
            ) : (
              <ul className="space-y-2">
                {issueResolution.openHighImpact.slice(0, 5).map(issue => (
                  <li key={issue.issueId} className="flex items-center justify-between">
                    <span className="text-sm text-foreground truncate max-w-[200px]">
                      {issue.title}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${issue.severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                        issue.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-blue-500/10 text-blue-500'
                      }`}>
                      {issue.affectedCount} affected
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Opportunities</h2>
        {opportunities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No opportunities identified</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map(opp => (
              <Link
                key={opp.id}
                href={opp.href}
                className="block rounded-lg border border-border/10 bg-card p-4 hover:border-signal/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium text-foreground">{opp.title}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-medium ${opp.estimatedImpact === 'high' ? 'bg-green-500/10 text-green-500' :
                      opp.estimatedImpact === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-muted text-muted-foreground'
                    }`}>
                    {opp.estimatedImpact}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{opp.why}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground/60 uppercase">{opp.pillarId}</span>
                  <span className="text-[10px] text-muted-foreground/60">|</span>
                  <span className="text-[10px] text-muted-foreground/60">{opp.fixType}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t border-border/10 pt-4">
        <p className="text-xs text-muted-foreground">
          Generated at {new Date(insights.generatedAt).toLocaleString()} |{' '}
          Window: {insights.window.days} days ({insights.window.from} to {insights.window.to})
        </p>
      </footer>
    </div>
  );
}
