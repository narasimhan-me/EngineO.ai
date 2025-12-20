'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { publicApi, type GeoReportPublicShareViewResponse, type GeoReportData } from '@/lib/api';

/**
 * [GEO-EXPORT-1] Public GEO Report Share View
 *
 * Public page for viewing shared GEO reports.
 * No authentication required - uses share token for access.
 *
 * Decision Locks:
 * - "Attribution readiness" instead of "citation confidence"
 * - "Answer engines" instead of specific vendor names
 * - Includes disclaimer about internal readiness signals
 */
export default function PublicGeoReportPage() {
  const params = useParams();
  const shareToken = params.token as string;

  const [loading, setLoading] = useState(true);
  const [viewData, setViewData] = useState<GeoReportPublicShareViewResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await publicApi.getGeoReportShareView(shareToken);
        setViewData(data);
      } catch (err) {
        console.error('Error fetching share view:', err);
        setViewData({ status: 'not_found' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading report...</div>
      </div>
    );
  }

  if (!viewData || viewData.status === 'not_found') {
    return <ErrorState type="not_found" />;
  }

  if (viewData.status === 'expired') {
    return <ErrorState type="expired" />;
  }

  if (viewData.status === 'revoked') {
    return <ErrorState type="revoked" />;
  }

  const report = viewData.report!;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with share badge */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                Shared Report
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                Read-only
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {viewData.expiresAt && (
                <span>Expires: {new Date(viewData.expiresAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Report Header */}
          <div className="border-b border-gray-200 px-8 py-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GEO Readiness Report</h1>
                <p className="mt-1 text-gray-600">{report.projectName}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                {viewData.generatedAt && (
                  <div>Generated: {new Date(viewData.generatedAt).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <div className="border-b border-gray-200 px-8 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-md border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Answer Ready</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {report.overview.productsAnswerReadyPercent}%
                </div>
                <div className="text-xs text-gray-500">
                  {report.overview.productsAnswerReadyCount} of {report.overview.productsTotal} products
                </div>
              </div>
              <div className="rounded-md border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Total Answers</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {report.overview.answersTotal}
                </div>
              </div>
              <div className="rounded-md border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Reuse Rate</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {report.overview.reuseRatePercent}%
                </div>
              </div>
              <div className="rounded-md border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Attribution Readiness</div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
                    <span className="text-sm">{report.overview.confidenceDistribution.high}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-full bg-yellow-500"></span>
                    <span className="text-sm">{report.overview.confidenceDistribution.medium}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-full bg-red-500"></span>
                    <span className="text-sm">{report.overview.confidenceDistribution.low}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Intent Coverage */}
          <div className="border-b border-gray-200 px-8 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Intent Coverage</h2>
            <div className="space-y-3">
              {report.coverage.byIntent.map((intent) => (
                <div key={intent.intentType} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{intent.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {intent.productsCovered}/{intent.productsTotal} products
                    </span>
                    <span className="text-xs text-gray-500">{intent.coveragePercent}%</span>
                  </div>
                </div>
              ))}
            </div>
            {report.coverage.gaps.length > 0 && (
              <div className="mt-4 rounded-md bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  <strong>Coverage gaps:</strong> {report.coverage.gaps.map((g) => g.replace(/_/g, ' ')).join(', ')}
                </p>
              </div>
            )}
            <p className="mt-3 text-sm text-gray-600">{report.coverage.summary}</p>
          </div>

          {/* Trust Signals */}
          {report.trustSignals.topBlockers.length > 0 && (
            <div className="border-b border-gray-200 px-8 py-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trust Signals</h2>
              <div className="space-y-2">
                {report.trustSignals.topBlockers.map((blocker, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{blocker.label}</span>
                    <span className="text-gray-500">{blocker.affectedProducts} products</span>
                  </div>
                ))}
              </div>
              {report.trustSignals.avgTimeToImproveHours !== null && (
                <p className="mt-3 text-sm text-gray-600">
                  Avg. time to improve: {report.trustSignals.avgTimeToImproveHours}h
                </p>
              )}
              <p className="mt-3 text-sm text-gray-600">{report.trustSignals.summary}</p>
            </div>
          )}

          {/* Opportunities */}
          {report.opportunities.length > 0 && (
            <div className="border-b border-gray-200 px-8 py-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Opportunities</h2>
              <div className="space-y-3">
                {report.opportunities.map((opp, idx) => (
                  <div key={idx} className="rounded-md border border-gray-200 p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{opp.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{opp.why}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            opp.category === 'coverage'
                              ? 'bg-blue-100 text-blue-700'
                              : opp.category === 'reuse'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {opp.category}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            opp.estimatedImpact === 'high'
                              ? 'bg-green-100 text-green-800'
                              : opp.estimatedImpact === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {opp.estimatedImpact}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="px-8 py-6 bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-500 italic">{report.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ type }: { type: 'not_found' | 'expired' | 'revoked' }) {
  const messages = {
    not_found: {
      title: 'Report Not Found',
      description: 'This shared report link does not exist or may have been removed.',
      icon: (
        <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    expired: {
      title: 'Link Expired',
      description: 'This shared report link has expired. Please request a new link from the report owner.',
      icon: (
        <svg className="h-12 w-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    revoked: {
      title: 'Access Revoked',
      description: 'This shared report link has been revoked by the owner and is no longer accessible.',
      icon: (
        <svg className="h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
  };

  const { title, description, icon } = messages[type];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4">{icon}</div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600 max-w-md">{description}</p>
      </div>
    </div>
  );
}
