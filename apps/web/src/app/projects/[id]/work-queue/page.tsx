'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { projectsApi } from '@/lib/api';
import type {
  WorkQueueResponse,
  WorkQueueTab,
} from '@/lib/work-queue';
import { ActionBundleCard } from '@/components/work-queue/ActionBundleCard';
import { WorkQueueTabs } from '@/components/work-queue/WorkQueueTabs';

/**
 * [WORK-QUEUE-1] Work Queue Page
 *
 * Displays derived action bundles with tab-based filtering.
 * Bundles are sorted by state priority, health, impact rank.
 */
export default function WorkQueuePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<WorkQueueResponse | null>(null);

  // Get current tab from URL or default
  const currentTab = (searchParams.get('tab') as WorkQueueTab) || undefined;
  const highlightBundleId = searchParams.get('bundleId') || undefined;

  const fetchWorkQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.workQueue(projectId, { tab: currentTab });
      setResponse(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load work queue';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [projectId, currentTab]);

  useEffect(() => {
    fetchWorkQueue();
  }, [fetchWorkQueue]);

  const handleTabChange = (tab: WorkQueueTab | undefined) => {
    const params = new URLSearchParams();
    if (tab) params.set('tab', tab);
    if (highlightBundleId) params.set('bundleId', highlightBundleId);
    const query = params.toString();
    router.push(`/projects/${projectId}/work-queue${query ? `?${query}` : ''}`);
  };

  const tabs: { key: WorkQueueTab; label: string }[] = [
    { key: 'Critical', label: 'Critical' },
    { key: 'NeedsAttention', label: 'Needs Attention' },
    { key: 'PendingApproval', label: 'Pending Approval' },
    { key: 'DraftsReady', label: 'Drafts Ready' },
    { key: 'AppliedRecently', label: 'Applied Recently' },
  ];

  // Group bundles by tab for displaying
  const items = response?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Queue</h1>
          <p className="mt-1 text-sm text-gray-500">
            Prioritized action items derived from your store&apos;s optimization status.
          </p>
        </div>
        {response?.viewer && (
          <div className="text-sm text-gray-500">
            Role: <span className="font-medium">{response.viewer.role}</span>
            {response.viewer.isMultiUserProject && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                Multi-user
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <WorkQueueTabs
        tabs={tabs}
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-500">Loading work queue...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchWorkQueue}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {currentTab === 'AppliedRecently'
              ? 'No recently applied actions'
              : 'All caught up!'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {currentTab === 'AppliedRecently'
              ? 'Actions you apply will appear here for 7 days.'
              : 'No action items in this category. Check other tabs or come back later.'}
          </p>
        </div>
      )}

      {/* Bundle cards */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((bundle) => (
            <ActionBundleCard
              key={bundle.bundleId}
              bundle={bundle}
              projectId={projectId}
              viewer={response?.viewer}
              isHighlighted={bundle.bundleId === highlightBundleId}
              onRefresh={fetchWorkQueue}
            />
          ))}
        </div>
      )}
    </div>
  );
}
