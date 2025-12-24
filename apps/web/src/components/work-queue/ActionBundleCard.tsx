'use client';

import Link from 'next/link';
import type { WorkQueueActionBundle, WorkQueueViewer } from '@/lib/work-queue';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ActionBundleCardProps {
  bundle: WorkQueueActionBundle;
  projectId: string;
  viewer?: WorkQueueViewer;
  isHighlighted?: boolean;
  onRefresh?: () => void;
}

/**
 * [WORK-QUEUE-1] Action Bundle Card
 *
 * Fixed layout order:
 * 1. Health pill + bundle type tag
 * 2. Title = recommendedActionLabel
 * 3. Scope line: "Applies to N ..." + preview list (+N more)
 * 4. Badges row: Approval badge (if required) + AI usage badge
 * 5. Footer: Primary CTA + Secondary CTA (max 2 visible)
 */
export function ActionBundleCard({
  bundle,
  projectId,
  viewer,
  isHighlighted,
  onRefresh: _onRefresh,
}: ActionBundleCardProps) {
  // Determine health variant
  const getHealthVariant = (h: string) => {
    switch (h) {
      case 'CRITICAL': return 'destructive';
      case 'NEEDS_ATTENTION': return 'secondary'; // using secondary as warning
      case 'HEALTHY': return 'signal';
      default: return 'default';
    }
  };

  // Bundle type tag labels
  const bundleTypeLabels: Record<string, string> = {
    ASSET_OPTIMIZATION: 'Issue',
    AUTOMATION_RUN: 'Automation',
    GEO_EXPORT: 'Export',
  };

  // Derive CTAs based on state and bundle type
  const { primaryCta, secondaryCta, disabledReason } = deriveCtas(bundle, viewer);

  // Build CTA route
  const ctaRoute = getCTARoute(bundle, projectId);

  return (
    <Card
      className={cn(
        "transition-all",
        isHighlighted
          ? 'border-signal ring-1 ring-signal/20'
          : 'hover:border-border/30'
      )}
    >
      <CardHeader className="pb-2">
        {/* Row 1: Health pill + bundle type tag */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={getHealthVariant(bundle.health)}>
            {bundle.health === 'CRITICAL' && (
              <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {bundle.health}
          </Badge>

          <Badge variant="outline" className="text-muted-foreground border-border/20">
            {bundleTypeLabels[bundle.bundleType] || bundle.bundleType}
          </Badge>

          <Badge variant="secondary" className="ml-auto bg-muted text-muted-foreground">
            {formatState(bundle.state)}
          </Badge>
        </div>

        {/* Row 2: Title */}
        <CardTitle className="mt-2 text-lg font-semibold text-foreground">
          {bundle.recommendedActionLabel}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Row 3: Scope line */}
        <p className="text-sm text-foreground/80">
          Applies to{' '}
          <span className="font-mono text-signal">
            {bundle.scopeCount} {getScopeTypeLabel(bundle.scopeType, bundle.scopeCount)}
          </span>
          {bundle.scopePreviewList.length > 0 && (
            <>
              :{' '}
              <span className="text-muted-foreground">
                {bundle.scopePreviewList.slice(0, 5).join(', ')}
                {bundle.scopePreviewList.length > 5 &&
                  ` ${bundle.scopePreviewList[bundle.scopePreviewList.length - 1]}`}
              </span>
            </>
          )}
        </p>

        {/* Row 4: Badges row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Approval badge */}
          {bundle.approval?.approvalRequired && (
            <Badge variant="outline" className="border-border/20">
              {bundle.approval.approvalStatus === 'APPROVED' && (
                <svg className="mr-1 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {bundle.approval.approvalStatus === 'PENDING' ? 'Pending Approval' : ''}
              {bundle.approval.approvalStatus === 'APPROVED' ? 'Approved' : ''}
              {bundle.approval.approvalStatus === 'REJECTED' ? 'Rejected' : ''}
              {bundle.approval.approvalStatus === 'NOT_REQUESTED' ? 'Approval Required' : ''}
            </Badge>
          )}

          {/* AI usage badge */}
          <Badge
            variant="outline"
            className={cn(
              "border-border/20",
              bundle.aiUsage !== 'NONE' && "text-purple-400 border-purple-500/20 bg-purple-500/10"
            )}
            title={bundle.aiDisclosureText}
          >
            {bundle.aiUsage === 'NONE' ? (
              'No AI'
            ) : (
              <>
                <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                  <path d="M10 5a1 1 0 011 1v4.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 019 11V6a1 1 0 011-1z" />
                </svg>
                AI for Drafts
              </>
            )}
          </Badge>

          {/* Draft coverage badge */}
          {bundle.draft && bundle.draft.draftStatus !== 'NONE' && (
            <Badge variant="secondary" className="text-blue-400 bg-blue-500/10 border border-blue-500/20">
              {bundle.draft.draftCount} drafts ({bundle.draft.draftCoverage}% coverage)
            </Badge>
          )}

          {/* GEO share link status */}
          {bundle.geoExport && (
            <Badge variant="outline" className="text-muted-foreground border-border/20">
              Share links: {bundle.geoExport.shareLinkStatus}
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Row 5: Footer CTAs */}
      <CardFooter className="pt-2 flex items-center gap-3 border-t border-border/10">
        {primaryCta && (
          <Link
            href={ctaRoute}
            className={cn(
              "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
              disabledReason
                ? 'cursor-not-allowed bg-muted text-muted-foreground'
                : 'bg-signal text-obsidian hover:bg-signal/90 shadow-[0_0_10px_rgba(102,252,241,0.2)]'
            )}
            onClick={(e) => {
              if (disabledReason) {
                e.preventDefault();
              }
            }}
          >
            {primaryCta}
          </Link>
        )}
        {secondaryCta && (
          <Link
            href={ctaRoute}
            className="inline-flex items-center rounded-md border border-border/20 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/10"
          >
            {secondaryCta}
          </Link>
        )}
        {disabledReason && (
          <span className="text-sm text-muted-foreground italic">{disabledReason}</span>
        )}
      </CardFooter>
    </Card>
  );
}

/**
 * Format state for display.
 */
function formatState(state: string): string {
  const labels: Record<string, string> = {
    NEW: 'New',
    PREVIEWED: 'Previewed',
    DRAFTS_READY: 'Drafts Ready',
    PENDING_APPROVAL: 'Pending Approval',
    APPROVED: 'Approved',
    APPLIED: 'Applied',
    FAILED: 'Failed',
    BLOCKED: 'Blocked',
  };
  return labels[state] || state;
}

/**
 * [ASSETS-PAGES-1] Get scope type label for display.
 */
function getScopeTypeLabel(scopeType: string, count: number): string {
  const singular: Record<string, string> = {
    PRODUCTS: 'product',
    PAGES: 'page',
    COLLECTIONS: 'collection',
    STORE_WIDE: 'store-wide',
  };
  const plural: Record<string, string> = {
    PRODUCTS: 'products',
    PAGES: 'pages',
    COLLECTIONS: 'collections',
    STORE_WIDE: 'store-wide',
  };

  if (scopeType === 'STORE_WIDE') {
    return 'store-wide';
  }

  return count === 1 ? (singular[scopeType] || scopeType) : (plural[scopeType] || scopeType);
}

/**
 * Derive CTAs based on bundle state and viewer capabilities.
 * [ASSETS-PAGES-1.1-UI-HARDEN] Now handles missing scope for PAGES/COLLECTIONS.
 */
function deriveCtas(
  bundle: WorkQueueActionBundle,
  viewer?: WorkQueueViewer,
): {
  primaryCta: string | null;
  secondaryCta: string | null;
  disabledReason: string | null;
} {
  const { state, bundleType, approval } = bundle;
  const canApply = viewer?.capabilities.canApply ?? false;
  const canApprove = viewer?.capabilities.canApprove ?? false;
  const canGenerateDrafts = viewer?.capabilities.canGenerateDrafts ?? false;
  const canRequestApproval = viewer?.capabilities.canRequestApproval ?? false;

  // [ASSETS-PAGES-1.1-UI-HARDEN] Block actions for PAGES/COLLECTIONS without deterministic scope
  if (hasMissingScope(bundle)) {
    return {
      primaryCta: 'View Details',
      secondaryCta: null,
      disabledReason: 'Missing scope for pages/collections. Return to Work Queue.',
    };
  }

  // GEO Export special case
  if (bundleType === 'GEO_EXPORT') {
    return {
      primaryCta: 'View Export Options',
      secondaryCta: null,
      disabledReason: null,
    };
  }

  // State-driven CTAs
  switch (state) {
    case 'NEW':
      if (bundleType === 'AUTOMATION_RUN') {
        return {
          primaryCta: canGenerateDrafts ? 'Generate Drafts' : 'View Details',
          secondaryCta: null,
          disabledReason: canGenerateDrafts ? null : 'Viewer role cannot generate drafts',
        };
      }
      return {
        primaryCta: 'View Issues',
        secondaryCta: null,
        disabledReason: null,
      };

    case 'PREVIEWED':
      return {
        primaryCta: canGenerateDrafts ? 'Generate Full Drafts' : 'View Preview',
        secondaryCta: 'View Preview',
        disabledReason: canGenerateDrafts ? null : 'Viewer role cannot generate drafts',
      };

    case 'DRAFTS_READY':
      if (approval?.approvalRequired && approval.approvalStatus !== 'APPROVED') {
        return {
          primaryCta: canRequestApproval ? 'Request Approval' : 'View Drafts',
          secondaryCta: 'View Drafts',
          disabledReason: 'Approval required before apply',
        };
      }
      return {
        primaryCta: canApply ? 'Apply Changes' : 'View Drafts',
        secondaryCta: 'View Drafts',
        disabledReason: canApply ? null : 'Only owners can apply changes',
      };

    case 'PENDING_APPROVAL':
      return {
        primaryCta: canApprove ? 'Approve & Apply' : 'View Drafts',
        secondaryCta: canApprove ? 'Reject' : null,
        disabledReason: canApprove ? null : 'Awaiting owner approval',
      };

    case 'APPROVED':
      return {
        primaryCta: canApply ? 'Apply Changes' : 'View Drafts',
        secondaryCta: 'View Drafts',
        disabledReason: canApply ? null : 'Only owners can apply changes',
      };

    case 'APPLIED':
      return {
        primaryCta: 'View Results',
        secondaryCta: null,
        disabledReason: null,
      };

    case 'FAILED':
      return {
        primaryCta: canGenerateDrafts ? 'Retry' : 'View Details',
        secondaryCta: 'View Error',
        disabledReason: null,
      };

    case 'BLOCKED':
      return {
        primaryCta: 'View Details',
        secondaryCta: null,
        disabledReason: 'Action blocked - drafts may be expired',
      };

    default:
      return {
        primaryCta: 'View Details',
        secondaryCta: null,
        disabledReason: null,
      };
  }
}

/**
 * [ASSETS-PAGES-1.1-UI-HARDEN] Extract handle-only scope refs from bundle for deep linking.
 * Returns an array of refs like ['page_handle:about-us', 'page_handle:contact'] or null if not available.
 *
 * For PAGES/COLLECTIONS bundles, we need deterministic handle-based refs.
 * These come from scopeQueryRef (if it contains handle refs) or are derived from the bundle ID.
 */
function extractScopeAssetRefs(bundle: WorkQueueActionBundle): string[] | null {
  const { scopeType, scopeQueryRef, bundleId } = bundle;

  // Only relevant for PAGES/COLLECTIONS
  if (scopeType !== 'PAGES' && scopeType !== 'COLLECTIONS') {
    return null;
  }

  // Check if scopeQueryRef contains handle-based refs (comma-separated)
  if (scopeQueryRef) {
    const prefix = scopeType === 'PAGES' ? 'page_handle:' : 'collection_handle:';
    if (scopeQueryRef.includes(prefix)) {
      // scopeQueryRef might be a comma-separated list of refs
      return scopeQueryRef.split(',').map((ref) => ref.trim()).filter((ref) => ref.length > 0);
    }
  }

  // Try to extract from bundleId if it contains handle refs
  // Bundle ID format: AUTOMATION_RUN:FIX_MISSING_METADATA:{playbookId}:{assetType}:{projectId}:{scopeRef}
  const bundleIdParts = bundleId.split(':');
  if (bundleIdParts.length >= 6) {
    // The last part might contain scope refs
    const potentialRefs = bundleIdParts.slice(5).join(':');
    if (potentialRefs.includes('_handle:')) {
      return potentialRefs.split(',').map((ref) => ref.trim()).filter((ref) => ref.length > 0);
    }
  }

  // No deterministic refs available
  return null;
}

/**
 * [ASSETS-PAGES-1.1-UI-HARDEN] Check if bundle has missing scope for PAGES/COLLECTIONS.
 * Returns true if the bundle requires scope but doesn't have it.
 */
function hasMissingScope(bundle: WorkQueueActionBundle): boolean {
  const { bundleType, scopeType } = bundle;

  // Only AUTOMATION_RUN bundles for PAGES/COLLECTIONS require scope
  if (bundleType !== 'AUTOMATION_RUN') {
    return false;
  }

  if (scopeType !== 'PAGES' && scopeType !== 'COLLECTIONS') {
    return false;
  }

  // Check if we have deterministic scope refs
  const refs = extractScopeAssetRefs(bundle);
  return refs === null || refs.length === 0;
}

/**
 * Get CTA route based on bundle type, scopeType, and action.
 * [ASSETS-PAGES-1] Routes PAGES/COLLECTIONS bundles to their respective asset lists.
 * [ASSETS-PAGES-1.1] AUTOMATION_RUN bundles now deep-link to playbooks with assetType param.
 * [ASSETS-PAGES-1.1-UI-HARDEN] Include scopeAssetRefs for PAGES/COLLECTIONS when available.
 */
function getCTARoute(bundle: WorkQueueActionBundle, projectId: string): string {
  const { bundleType, recommendedActionKey, scopeType } = bundle;

  if (bundleType === 'GEO_EXPORT') {
    return `/projects/${projectId}/insights?tab=geo`;
  }

  // [ASSETS-PAGES-1.1] Route AUTOMATION_RUN bundles to playbooks with asset-scoped deep link
  if (bundleType === 'AUTOMATION_RUN') {
    // Extract playbookId from recommendedActionKey (e.g., 'FIX_MISSING_METADATA' maps to playbook)
    // For now, use the bundleId to determine the playbook since it contains the playbookId
    // Bundle ID format: AUTOMATION_RUN:FIX_MISSING_METADATA:{playbookId}:{assetType}:{projectId}
    const bundleIdParts = bundle.bundleId.split(':');
    const playbookId = bundleIdParts.length >= 3 ? bundleIdParts[2] : 'missing_seo_title';
    const assetType = bundleIdParts.length >= 4 ? bundleIdParts[3] : 'PRODUCTS';

    const params = new URLSearchParams();
    params.set('playbookId', playbookId);
    if (assetType !== 'PRODUCTS') {
      params.set('assetType', assetType);

      // [ASSETS-PAGES-1.1-UI-HARDEN] Include scopeAssetRefs for PAGES/COLLECTIONS
      const scopeRefs = extractScopeAssetRefs(bundle);
      if (scopeRefs && scopeRefs.length > 0) {
        params.set('scopeAssetRefs', scopeRefs.join(','));
      }
    }
    return `/projects/${projectId}/automation/playbooks?${params.toString()}`;
  }

  // [ASSETS-PAGES-1] Route to asset-specific pages with filters
  if (bundleType === 'ASSET_OPTIMIZATION') {
    const actionKeyParam = recommendedActionKey ? `?actionKey=${recommendedActionKey}` : '';

    switch (scopeType) {
      case 'PAGES':
        return `/projects/${projectId}/assets/pages${actionKeyParam}`;
      case 'COLLECTIONS':
        return `/projects/${projectId}/assets/collections${actionKeyParam}`;
      case 'PRODUCTS':
        // Route to products or relevant pillar
        switch (recommendedActionKey) {
          case 'FIX_MISSING_METADATA':
            return `/projects/${projectId}/metadata`;
          case 'RESOLVE_TECHNICAL_ISSUES':
            return `/projects/${projectId}/performance`;
          case 'IMPROVE_SEARCH_INTENT':
            return `/projects/${projectId}/keywords`;
          case 'OPTIMIZE_CONTENT':
            return `/projects/${projectId}/content`;
          default:
            return `/projects/${projectId}/products`;
        }
      default:
        return `/projects/${projectId}/deo`;
    }
  }

  // Fallback - route to relevant pillar
  switch (recommendedActionKey) {
    case 'FIX_MISSING_METADATA':
      return `/projects/${projectId}/metadata`;
    case 'RESOLVE_TECHNICAL_ISSUES':
      return `/projects/${projectId}/performance`;
    case 'IMPROVE_SEARCH_INTENT':
      return `/projects/${projectId}/keywords`;
    case 'OPTIMIZE_CONTENT':
      return `/projects/${projectId}/content`;
    default:
      return `/projects/${projectId}/deo`;
  }
}
