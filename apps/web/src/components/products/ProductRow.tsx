import { useState, type MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import type { DeoIssueSeverity } from '@/lib/deo-issues';
import type { DeoPillarId } from '@/lib/deo-pillars';
import type { Product, ProductStatus } from '@/lib/products';
import { ProductDetailPanel } from './ProductDetailPanel';

/**
 * [DEO-UX-REFRESH-1] Issue summary by pillar for display in products list
 */
export interface PillarIssueSummary {
  pillarId: DeoPillarId;
  label: string;
  count: number;
}

interface ProductRowProps {
  product: Product;
  projectId: string;
  status: ProductStatus;
  isExpanded: boolean;
  onToggle: () => void;
  onScan: () => void;
  onSyncProject: () => void;
  isSyncing: boolean;
  isScanning: boolean;
  issueCount?: number;
  maxIssueSeverity?: DeoIssueSeverity | null;
  /** [DEO-UX-REFRESH-1] Issue breakdown by pillar */
  issuesByPillar?: PillarIssueSummary[];
}

export function ProductRow({
  product,
  projectId,
  status,
  isExpanded,
  onToggle: _onToggle,
  onScan,
  onSyncProject,
  isSyncing,
  isScanning,
  issueCount: _issueCount, // [DEO-UX-REFRESH-1] Kept for API compat, replaced by pillar chips
  maxIssueSeverity,
  issuesByPillar,
}: ProductRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const workspacePath = `/projects/${projectId}/products/${product.id}`;

  // [DEO-UX-REFRESH-1] Row is no longer clickable - single primary CTA only

  const handleMenuToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMenuOpen((open) => !open);
  };

  const handleScan = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onScan();
    setMenuOpen(false);
  };

  const handleSync = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onSyncProject();
    setMenuOpen(false);
  };

  // [DEO-UX-REFRESH-1] Prepare pillar chips (max 3 shown, rest collapsed)
  const MAX_PILLAR_CHIPS = 3;
  const visiblePillars = (issuesByPillar ?? []).slice(0, MAX_PILLAR_CHIPS);
  const hiddenPillarCount = (issuesByPillar ?? []).length - MAX_PILLAR_CHIPS;

  // Status labels explicitly reference metadata status (not overall DEO health)
  const statusLabel =
    status === 'optimized'
      ? 'Metadata optimized'
      : status === 'needs-optimization'
        ? 'Metadata needs work'
        : 'Metadata missing';

  const statusClasses =
    status === 'optimized'
      ? 'bg-green-50 text-green-800 ring-1 ring-green-100'
      : status === 'needs-optimization'
        ? 'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-100'
        : 'bg-red-50 text-red-800 ring-1 ring-red-100';

  const hasMetaTitle = !!product.seoTitle?.trim();
  const hasMetaDescription = !!product.seoDescription?.trim();

  return (
    <div className="relative">
      {/* [DEO-UX-REFRESH-1] Row is NOT clickable - use the "Open" button as the single primary CTA */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Header section – image + title + handle + status (mobile) */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <Image
              src={product.imageUrls[0]}
              alt={product.title}
              width={40}
              height={40}
              className="h-10 w-10 flex-shrink-0 rounded object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gray-100">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 text-sm font-medium text-gray-900 sm:line-clamp-1">
              {product.title}
            </div>
            <div className="mt-0.5 truncate text-xs text-gray-500">
              {product.handle ?? product.externalId}
            </div>
            {/* [DEO-UX-REFRESH-1] Status chip (mobile only) - removed inline "Open Workspace" link */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:hidden">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses}`}
              >
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Middle section – status (desktop) + micro indicators + pillar chips */}
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            {/* Status chip - desktop only */}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses}`}
            >
              {statusLabel}
            </span>
            {/* Scan SEO button - desktop only */}
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <svg
                    className="mr-1 h-3 w-3 animate-spin text-blue-700"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Scanning...
                </>
              ) : (
                <>
                  <svg
                    className="mr-1 h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Scan SEO
                </>
              )}
            </button>
          </div>

          {/* Metadata indicators + [DEO-UX-REFRESH-1] Pillar issue chips */}
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 sm:mt-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  hasMetaTitle ? 'bg-green-500' : 'bg-red-400'
                }`}
              />
              <span>Title</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  hasMetaDescription ? 'bg-green-500' : 'bg-red-400'
                }`}
              />
              <span>Description</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              <span>Alt text</span>
            </span>

            {/* [DEO-UX-REFRESH-1] Issue-by-pillar summary chips */}
            {visiblePillars.length > 0 && (
              <>
                {visiblePillars.map((pillar) => (
                  <Link
                    key={pillar.pillarId}
                    href={`${workspacePath}?tab=issues&pillar=${pillar.pillarId}`}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      maxIssueSeverity === 'critical'
                        ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        : maxIssueSeverity === 'warning'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                          : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <span>{pillar.label}</span>
                    <span className="font-semibold">{pillar.count}</span>
                  </Link>
                ))}
                {hiddenPillarCount > 0 && (
                  <Link
                    href={`${workspacePath}?tab=issues`}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                  >
                    +{hiddenPillarCount} more
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* [DEO-UX-REFRESH-1] Actions section - single primary CTA (Open button) */}
        <div className="mt-2 flex flex-col gap-2 sm:ml-4 sm:mt-0 sm:flex-row sm:items-center sm:justify-end">
          {/* [DEO-UX-REFRESH-1] Single primary CTA: "Open" button */}
          <Link
            href={workspacePath}
            className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto sm:py-1.5"
          >
            Open
          </Link>

          {/* Secondary actions row - Scan SEO (mobile) + Overflow menu */}
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            {/* Scan SEO button - mobile only */}
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 sm:hidden"
            >
              {isScanning ? (
                <>
                  <svg
                    className="mr-1 h-3 w-3 animate-spin text-blue-700"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Scanning...
                </>
              ) : (
                <>
                  <svg
                    className="mr-1 h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Scan SEO
                </>
              )}
            </button>

            {/* Overflow menu - [DEO-UX-REFRESH-1] "View details" REMOVED */}
            <div className="relative">
              <button
                type="button"
                onClick={handleMenuToggle}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
                  />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-44 rounded-md border border-gray-200 bg-white py-1 text-sm text-gray-700 shadow-lg">
                  {/* [DEO-UX-REFRESH-1] Removed "View details" - single primary CTA only */}
                  <button
                    type="button"
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="block w-full px-3 py-1.5 text-left hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    {isSyncing ? 'Syncing…' : 'Sync'}
                  </button>
                  <button
                    type="button"
                    disabled
                    className="block w-full cursor-not-allowed px-3 py-1.5 text-left text-gray-400"
                    title="Editing coming soon"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled
                    className="block w-full cursor-not-allowed px-3 py-1.5 text-left text-gray-400"
                    title="Remove coming soon"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && <ProductDetailPanel product={product} />}
    </div>
  );
}
