'use client';

import type { WorkQueueTab } from '@/lib/work-queue';

interface WorkQueueTabsProps {
  tabs: { key: WorkQueueTab; label: string }[];
  currentTab?: WorkQueueTab;
  onTabChange: (tab: WorkQueueTab | undefined) => void;
}

/**
 * [WORK-QUEUE-1] Work Queue Tabs Component
 *
 * Tab navigation: Critical | Needs Attention | Pending Approval | Drafts Ready | Applied Recently
 */
export function WorkQueueTabs({ tabs, currentTab, onTabChange }: WorkQueueTabsProps) {
  return (
    <div className="border-b border-border/10">
      <nav className="-mb-px flex space-x-8" aria-label="Work Queue Tabs">
        {/* All tab - show when no specific tab is selected */}
        <button
          onClick={() => onTabChange(undefined)}
          className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${!currentTab
              ? 'border-signal text-signal'
              : 'border-transparent text-muted-foreground hover:border-border/30 hover:text-foreground'
            }`}
        >
          All
        </button>

        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${currentTab === tab.key
                ? 'border-signal text-signal'
                : 'border-transparent text-muted-foreground hover:border-border/30 hover:text-foreground'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
