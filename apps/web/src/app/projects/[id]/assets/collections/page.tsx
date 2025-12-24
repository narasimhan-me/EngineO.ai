'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { projectsApi } from '@/lib/api';
import { buildWorkQueueUrl } from '@/lib/work-queue';
import type { WorkQueueRecommendedActionKey } from '@/lib/work-queue';
import { Badge } from '@/components/ui/badge';

/**
 * [ASSETS-PAGES-1] Collections Asset List
 *
 * Displays Shopify collections (/collections/*) with health status and recommended actions.
 * Decision-first UX: one health pill, one action label per row.
 * Bulk actions route to Automation Playbooks.
 */

interface CollectionAsset {
  id: string;
  url: string;
  path: string;
  title: string | null;
  metaDescription: string | null;
  statusCode: number | null;
  wordCount: number | null;
  scannedAt: string;
  health: 'Healthy' | 'Needs Attention' | 'Critical';
  recommendedActionKey: WorkQueueRecommendedActionKey | null;
  recommendedActionLabel: string | null;
}

export default function CollectionsAssetListPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<CollectionAsset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Get filter from URL (from Work Queue click-through)
  const actionKeyFilter = searchParams.get('actionKey') as WorkQueueRecommendedActionKey | null;

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch crawl pages and filter to collections
      const crawlPages = await projectsApi.crawlPages(projectId);

      // Filter to only collections
      const collectionAssets: CollectionAsset[] = crawlPages
        .filter((p: { pageType: string }) => p.pageType === 'collection')
        .map((p: { id: string; url: string; path: string; title: string | null; metaDescription: string | null; statusCode: number | null; wordCount: number | null; scannedAt: string }) => {
          // Derive health and action from collection state
          let health: 'Healthy' | 'Needs Attention' | 'Critical' = 'Healthy';
          let recommendedActionKey: WorkQueueRecommendedActionKey | null = null;
          let recommendedActionLabel: string | null = null;

          // Missing metadata = Critical
          if (!p.title || !p.metaDescription) {
            health = 'Critical';
            recommendedActionKey = 'FIX_MISSING_METADATA';
            recommendedActionLabel = 'Fix missing metadata';
          }
          // Technical issues (4xx/5xx status) = Critical
          else if (p.statusCode && p.statusCode >= 400) {
            health = 'Critical';
            recommendedActionKey = 'RESOLVE_TECHNICAL_ISSUES';
            recommendedActionLabel = 'Resolve technical issues';
          }
          // Thin content = Needs Attention
          else if (p.wordCount !== null && p.wordCount < 300) {
            health = 'Needs Attention';
            recommendedActionKey = 'OPTIMIZE_CONTENT';
            recommendedActionLabel = 'Optimize content';
          }

          return {
            id: p.id,
            url: p.url,
            path: p.path,
            title: p.title,
            metaDescription: p.metaDescription,
            statusCode: p.statusCode,
            wordCount: p.wordCount,
            scannedAt: p.scannedAt,
            health,
            recommendedActionKey,
            recommendedActionLabel,
          };
        });

      // Apply actionKey filter if present
      const filtered = actionKeyFilter
        ? collectionAssets.filter((c) => c.recommendedActionKey === actionKeyFilter)
        : collectionAssets;

      setCollections(filtered);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load collections';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [projectId, actionKeyFilter]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleSelectAll = () => {
    if (selectedIds.size === collections.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(collections.map((c) => c.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkFix = () => {
    // Route to Work Queue with COLLECTIONS scope filter
    router.push(buildWorkQueueUrl(projectId, {
      actionKey: 'FIX_MISSING_METADATA',
      scopeType: 'COLLECTIONS',
    }));
  };

  // Health pill styling
  const getHealthVariant = (health: string) => {
    switch (health) {
      case 'Critical': return 'destructive';
      case 'Needs Attention': return 'secondary';
      case 'Healthy': return 'signal';
      default: return 'outline';
    }
  };

  // Extract collection handle from path (e.g., /collections/shoes -> shoes)
  const getCollectionHandle = (path: string): string => {
    const match = path.match(/\/collections\/([^/?]+)/);
    return match ? match[1] : path;
  };

  const criticalCount = collections.filter((c) => c.health === 'Critical').length;
  const needsAttentionCount = collections.filter((c) => c.health === 'Needs Attention').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Collections</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {collections.length} collections • {criticalCount} critical • {needsAttentionCount} need attention
          </p>
        </div>
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkFix}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Fix missing metadata ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Filter indicator */}
      {actionKeyFilter && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary">
          <span>Filtered by: {actionKeyFilter.replace(/_/g, ' ').toLowerCase()}</span>
          <button
            onClick={() => router.push(`/projects/${projectId}/assets/collections`)}
            className="font-medium underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="ml-3 text-muted-foreground">Loading collections...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={fetchCollections}
            className="mt-2 text-sm font-medium text-destructive hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Collections list */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-lg border border-border/10 bg-card">
          <table className="min-w-full divide-y divide-border/10">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === collections.length && collections.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-border bg-card text-signal focus:ring-signal"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Health
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Handle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {collections.map((collection) => (
                <tr key={collection.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(collection.id)}
                      onChange={() => handleSelectOne(collection.id)}
                      className="h-4 w-4 rounded border-border bg-card text-signal focus:ring-signal"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getHealthVariant(collection.health)}>
                      {collection.health}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    <code className="rounded bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground font-mono">
                      {getCollectionHandle(collection.path)}
                    </code>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-foreground">
                    {collection.title || <span className="italic text-muted-foreground">No title</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {collection.recommendedActionLabel ? (
                      <button
                        onClick={() => router.push(buildWorkQueueUrl(projectId, {
                          actionKey: collection.recommendedActionKey!,
                          scopeType: 'COLLECTIONS',
                        }))}
                        className="font-medium text-signal hover:underline"
                      >
                        {collection.recommendedActionLabel}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {collections.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No collections found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
