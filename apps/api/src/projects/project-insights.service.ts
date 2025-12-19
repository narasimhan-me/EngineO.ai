import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiUsageLedgerService } from '../ai/ai-usage-ledger.service';
import { AiUsageQuotaService } from '../ai/ai-usage-quota.service';
import { DeoIssuesService } from './deo-issues.service';

export type InsightSeverity = 'critical' | 'warning' | 'info';

export interface ProjectInsightsResponse {
  projectId: string;
  generatedAt: string;
  window: { days: number; from: string; to: string };
  overview: {
    improved: {
      deoScore: { current: number | null; previous: number | null; delta: number | null; why: string };
      componentDeltas: Array<{ key: string; label: string; current: number | null; previous: number | null; delta: number | null; why: string }>;
    };
    saved: {
      aiRunsUsed: number;
      aiRunsAvoidedViaReuse: number;
      reuseRatePercent: number;
      quota: { monthlyLimit: number | null; used: number; remaining: number | null; usedPercent: number | null; why: string };
      trust: { applyNeverUsesAi: true; message: string };
    };
    resolved: { actionsCount: number; why: string };
    next: { title: string; why: string; href: string } | null;
  };
  progress: {
    deoScoreTrend: Array<{ at: string; overall: number }>;
    fixesAppliedTrend: Array<{ day: string; count: number }>;
    openIssuesNow: { total: number; critical: number; warning: number; info: number };
  };
  issueResolution: {
    byPillar: Array<{ pillar: string; count: number }>;
    avgTimeToFixHours: number | null;
    topRecent: Array<{ title: string; at: string; pillar: string; why: string; href: string }>;
    openHighImpact: Array<{ id: string; title: string; severity: InsightSeverity; pillarId?: string; why: string; href: string }>;
  };
  opportunities: Array<{ id: string; title: string; why: string; href: string; severity?: InsightSeverity; pillarId?: string }>;
}

function toIsoDay(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function percent(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

@Injectable()
export class ProjectInsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiUsageLedgerService: AiUsageLedgerService,
    private readonly aiUsageQuotaService: AiUsageQuotaService,
    private readonly deoIssuesService: DeoIssuesService,
  ) {}

  async getProjectInsights(projectId: string, userId: string): Promise<ProjectInsightsResponse> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException('You do not have access to this project');

    const now = new Date();
    const days = 30;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const [
      issuesRes,
      latestSnapshot,
      previousSnapshot,
      scoreTrendRows,
      aiSummary,
      quotaEval,
      intentApps,
      competitiveApps,
      mediaApps,
      offsiteApps,
      localApps,
      appliedSuggestions,
    ] = await Promise.all([
      this.deoIssuesService.getIssuesForProjectReadOnly(projectId, userId),
      this.prisma.deoScoreSnapshot.findFirst({ where: { projectId }, orderBy: { computedAt: 'desc' } }),
      this.prisma.deoScoreSnapshot.findFirst({ where: { projectId, computedAt: { lte: from } }, orderBy: { computedAt: 'desc' } }),
      this.prisma.deoScoreSnapshot.findMany({
        where: { projectId, computedAt: { gte: from } },
        orderBy: { computedAt: 'asc' },
        select: { computedAt: true, overallScore: true },
        take: 200,
      }),
      this.aiUsageLedgerService.getProjectSummary(projectId),
      this.aiUsageQuotaService.evaluateQuotaForAction({ userId, projectId, action: 'PREVIEW_GENERATE' }),
      this.prisma.productIntentFixApplication.findMany({
        where: { product: { projectId }, appliedAt: { gte: from, lte: now } },
        select: {
          appliedAt: true,
          productId: true,
          intentType: true,
          query: true,
          draft: { select: { createdAt: true } },
        },
        orderBy: { appliedAt: 'desc' },
        take: 200,
      }),
      this.prisma.productCompetitiveFixApplication.findMany({
        where: { product: { projectId }, appliedAt: { gte: from, lte: now } },
        select: {
          appliedAt: true,
          productId: true,
          gapType: true,
          areaId: true,
          draft: { select: { createdAt: true } },
        },
        orderBy: { appliedAt: 'desc' },
        take: 200,
      }),
      this.prisma.productMediaFixApplication.findMany({
        where: { product: { projectId }, appliedAt: { gte: from, lte: now } },
        select: {
          appliedAt: true,
          productId: true,
          draftType: true,
          draft: { select: { createdAt: true } },
        },
        orderBy: { appliedAt: 'desc' },
        take: 200,
      }),
      this.prisma.projectOffsiteFixApplication.findMany({
        where: { projectId, appliedAt: { gte: from, lte: now } },
        select: {
          appliedAt: true,
          gapType: true,
          signalType: true,
          draft: { select: { createdAt: true } },
        },
        orderBy: { appliedAt: 'desc' },
        take: 200,
      }),
      this.prisma.projectLocalFixApplication.findMany({
        where: { projectId, appliedAt: { gte: from, lte: now } },
        select: {
          appliedAt: true,
          gapType: true,
          signalType: true,
          draft: { select: { createdAt: true } },
        },
        orderBy: { appliedAt: 'desc' },
        take: 200,
      }),
      this.prisma.automationSuggestion.findMany({
        where: { projectId, applied: true, appliedAt: { gte: from, lte: now } },
        select: { appliedAt: true, generatedAt: true, issueType: true, targetType: true },
        orderBy: { appliedAt: 'desc' },
        take: 200,
      }),
    ]);

    const issues = issuesRes.issues ?? [];
    const openCritical = issues.filter((i) => i.severity === 'critical');
    const openWarning = issues.filter((i) => i.severity === 'warning');
    const openInfo = issues.filter((i) => i.severity === 'info');

    const nextIssue = openCritical[0] ?? openWarning[0] ?? null;
    const next =
      nextIssue
        ? {
            title: nextIssue.title,
            why: nextIssue.whyItMatters || nextIssue.description || 'Addressing high-impact gaps improves discovery coverage.',
            href: nextIssue.pillarId ? `/projects/${projectId}/issues?pillar=${encodeURIComponent(nextIssue.pillarId)}` : `/projects/${projectId}/issues`,
          }
        : null;

    const latestOverall = latestSnapshot?.overallScore ?? null;
    const prevOverall = previousSnapshot?.overallScore ?? (scoreTrendRows[0]?.overallScore ?? null);
    const deoDelta = latestOverall != null && prevOverall != null ? latestOverall - prevOverall : null;

    const latestV2 = (latestSnapshot?.metadata as any)?.v2?.components ?? null;
    const prevV2 = ((previousSnapshot?.metadata as any)?.v2?.components ?? (scoreTrendRows[0] as any)?.metadata?.v2?.components) ?? null;

    const componentKeys: Array<{ key: string; label: string }> = [
      { key: 'intentMatch', label: 'Search & Intent' },
      { key: 'aiVisibility', label: 'AI Visibility' },
      { key: 'answerability', label: 'Answerability' },
      { key: 'contentCompleteness', label: 'Content Completeness' },
      { key: 'technicalQuality', label: 'Technical Quality' },
      { key: 'entityStrength', label: 'Entity Strength' },
    ];

    const componentDeltas = componentKeys.map(({ key, label }) => {
      const current = typeof latestV2?.[key] === 'number' ? Math.round(latestV2[key]) : null;
      const previous = typeof prevV2?.[key] === 'number' ? Math.round(prevV2[key]) : null;
      const delta = current != null && previous != null ? current - previous : null;
      return {
        key,
        label,
        current,
        previous,
        delta,
        why: 'Derived from DEO Score v2 explainability components (directional; not a guarantee).',
      };
    });

    const actionsCount =
      intentApps.length +
      competitiveApps.length +
      mediaApps.length +
      offsiteApps.length +
      localApps.length +
      appliedSuggestions.length;

    const byPillar: Array<{ pillar: string; count: number }> = [
      { pillar: 'Search & Intent', count: intentApps.length },
      { pillar: 'Competitors', count: competitiveApps.length },
      { pillar: 'Media', count: mediaApps.length },
      { pillar: 'Off-site Signals', count: offsiteApps.length },
      { pillar: 'Local Discovery', count: localApps.length },
      { pillar: 'Automation Suggestions', count: appliedSuggestions.length },
    ].filter((x) => x.count > 0);

    const durationsHours: number[] = [];
    for (const a of intentApps) durationsHours.push((a.appliedAt.getTime() - a.draft.createdAt.getTime()) / 3600000);
    for (const a of competitiveApps) durationsHours.push((a.appliedAt.getTime() - a.draft.createdAt.getTime()) / 3600000);
    for (const a of mediaApps) durationsHours.push((a.appliedAt.getTime() - a.draft.createdAt.getTime()) / 3600000);
    for (const a of offsiteApps) durationsHours.push((a.appliedAt.getTime() - a.draft.createdAt.getTime()) / 3600000);
    for (const a of localApps) durationsHours.push((a.appliedAt.getTime() - a.draft.createdAt.getTime()) / 3600000);
    for (const a of appliedSuggestions) {
      if (a.appliedAt) durationsHours.push((a.appliedAt.getTime() - a.generatedAt.getTime()) / 3600000);
    }

    const avgTimeToFixHours =
      durationsHours.length > 0
        ? Math.round((durationsHours.reduce((sum, v) => sum + v, 0) / durationsHours.length) * 10) / 10
        : null;

    const recentActions: Array<{ at: Date; title: string; pillar: string; why: string; href: string }> = [];
    for (const a of intentApps.slice(0, 20)) {
      recentActions.push({
        at: a.appliedAt,
        title: `Applied Search & Intent fix (${String(a.intentType).toLowerCase()})`,
        pillar: 'Search & Intent',
        why: `Added coverage for "${a.query}" without using AI during apply.`,
        href: `/projects/${projectId}/products/${a.productId}?focus=search-intent`,
      });
    }
    for (const a of competitiveApps.slice(0, 20)) {
      recentActions.push({
        at: a.appliedAt,
        title: 'Applied Competitive fix',
        pillar: 'Competitors',
        why: `Addressed a ${String(a.gapType).toLowerCase()} gap for area ${a.areaId}.`,
        href: `/projects/${projectId}/products/${a.productId}?focus=competitors`,
      });
    }
    for (const a of mediaApps.slice(0, 20)) {
      recentActions.push({
        at: a.appliedAt,
        title: 'Applied Media fix',
        pillar: 'Media',
        why: 'Improved image accessibility metadata without using AI during apply.',
        href: `/projects/${projectId}/products/${a.productId}?focus=media`,
      });
    }
    for (const a of offsiteApps.slice(0, 20)) {
      recentActions.push({
        at: a.appliedAt,
        title: 'Applied Off-site Signals fix',
        pillar: 'Off-site Signals',
        why: `Addressed ${String(a.gapType).toLowerCase()} for ${String(a.signalType).toLowerCase()}.`,
        href: `/projects/${projectId}/backlinks`,
      });
    }
    for (const a of localApps.slice(0, 20)) {
      recentActions.push({
        at: a.appliedAt,
        title: 'Applied Local Discovery fix',
        pillar: 'Local Discovery',
        why: `Addressed ${String(a.gapType).toLowerCase()} for ${String(a.signalType).toLowerCase()}.`,
        href: `/projects/${projectId}/local`,
      });
    }
    for (const a of appliedSuggestions.slice(0, 20)) {
      if (!a.appliedAt) continue;
      recentActions.push({
        at: a.appliedAt,
        title: 'Applied Automation Suggestion',
        pillar: 'Automation Suggestions',
        why: `Marked ${String(a.issueType).toLowerCase()} suggestion as applied.`,
        href: `/projects/${projectId}/automation`,
      });
    }

    recentActions.sort((a, b) => b.at.getTime() - a.at.getTime());
    const topRecent = recentActions.slice(0, 8).map((a) => ({
      title: a.title,
      at: a.at.toISOString(),
      pillar: a.pillar,
      why: a.why,
      href: a.href,
    }));

    const allAppliedAts = [
      ...intentApps.map((a) => a.appliedAt),
      ...competitiveApps.map((a) => a.appliedAt),
      ...mediaApps.map((a) => a.appliedAt),
      ...offsiteApps.map((a) => a.appliedAt),
      ...localApps.map((a) => a.appliedAt),
      ...appliedSuggestions.map((a) => a.appliedAt).filter((d): d is Date => !!d),
    ];

    const trendMap = new Map<string, number>();
    for (const at of allAppliedAts) {
      const day = toIsoDay(at);
      trendMap.set(day, (trendMap.get(day) ?? 0) + 1);
    }
    const fixesAppliedTrend = [...trendMap.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([day, count]) => ({ day, count }));

    const openHighImpact = openCritical.slice(0, 8).map((i) => ({
      id: i.id,
      title: i.title,
      severity: i.severity as InsightSeverity,
      pillarId: i.pillarId,
      why: i.whyItMatters || i.description || 'This gap is flagged as high impact.',
      href: i.pillarId ? `/projects/${projectId}/issues?pillar=${encodeURIComponent(i.pillarId)}` : `/projects/${projectId}/issues`,
    }));

    const opportunities = [
      ...openCritical.slice(0, 6).map((i) => ({
        id: `issue:${i.id}`,
        title: i.title,
        why: i.whyItMatters || i.description || 'This gap affects discovery coverage.',
        href: i.pillarId ? `/projects/${projectId}/issues?pillar=${encodeURIComponent(i.pillarId)}` : `/projects/${projectId}/issues`,
        severity: i.severity as InsightSeverity,
        pillarId: i.pillarId,
      })),
      ...openWarning.slice(0, 4).map((i) => ({
        id: `issue:${i.id}`,
        title: i.title,
        why: i.whyItMatters || i.description || 'This gap affects discovery coverage.',
        href: i.pillarId ? `/projects/${projectId}/issues?pillar=${encodeURIComponent(i.pillarId)}` : `/projects/${projectId}/issues`,
        severity: i.severity as InsightSeverity,
        pillarId: i.pillarId,
      })),
    ];

    const aiRunsUsed = quotaEval.currentMonthAiRuns;
    const monthlyLimit = quotaEval.policy.monthlyAiRunsLimit;
    const remaining = quotaEval.remainingAiRuns;
    const usedPercent = quotaEval.currentUsagePercent != null ? Math.round(quotaEval.currentUsagePercent) : null;

    return {
      projectId,
      generatedAt: new Date().toISOString(),
      window: { days, from: from.toISOString(), to: now.toISOString() },
      overview: {
        improved: {
          deoScore: {
            current: latestOverall != null ? Math.round(latestOverall) : null,
            previous: prevOverall != null ? Math.round(prevOverall) : null,
            delta: deoDelta != null ? Math.round(deoDelta) : null,
            why: 'Computed from DEO score snapshots (directional; not a ranking or revenue guarantee).',
          },
          componentDeltas,
        },
        saved: {
          aiRunsUsed,
          aiRunsAvoidedViaReuse: aiSummary.aiRunsAvoided,
          reuseRatePercent: percent(aiSummary.reusedRuns, aiSummary.totalRuns),
          quota: {
            monthlyLimit,
            used: aiRunsUsed,
            remaining,
            usedPercent,
            why: 'Quota is evaluated from the AI usage ledger (AutomationPlaybookRun) with reset offsets applied when present.',
          },
          trust: {
            applyNeverUsesAi: true,
            message: 'EngineO.ai avoids AI usage whenever a valid draft or reuse exists. Apply never uses AI.',
          },
        },
        resolved: {
          actionsCount,
          why: 'Derived from fix application logs and applied automation suggestions in the last 30 days.',
        },
        next,
      },
      progress: {
        deoScoreTrend: scoreTrendRows.map((r) => ({ at: r.computedAt.toISOString(), overall: r.overallScore })),
        fixesAppliedTrend,
        openIssuesNow: {
          total: issues.length,
          critical: openCritical.length,
          warning: openWarning.length,
          info: openInfo.length,
        },
      },
      issueResolution: {
        byPillar,
        avgTimeToFixHours,
        topRecent,
        openHighImpact,
      },
      opportunities,
    };
  }
}
