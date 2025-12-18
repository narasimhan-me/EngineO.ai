'use client';

import { useParams } from 'next/navigation';
import { GuardedLink } from '@/components/navigation/GuardedLink';

export default function MediaPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Media & Accessibility</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage product images, alt text coverage, video presence, and accessibility
          attributes across your catalog.
        </p>
      </div>

      {/* Coming Soon Notice */}
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
        <h2 className="text-lg font-semibold text-purple-900">
          Media & Accessibility Workspace Coming Soon
        </h2>
        <p className="mt-2 text-sm text-purple-800">
          This view will centralize media and accessibility gaps including missing
          product images, alt text coverage, video presence, and accessibility
          attributes that enhance discoverability across visual and voice interfaces.
        </p>

        <div className="mt-4">
          <p className="text-sm text-purple-800">
            For now, <strong>missing_product_image</strong> issues are surfaced via
            product-level DEO issues and will later power this pillar.
          </p>
        </div>

        <p className="mt-4 text-xs text-purple-700">
          Media-related DEO issues are tracked under the Media & Accessibility pillar.
          View them in the{' '}
          <GuardedLink
            href={`/projects/${projectId}/issues?pillar=media_accessibility`}
            className="font-medium underline"
          >
            Issues Engine
          </GuardedLink>
          .
        </p>
      </div>

      {/* Pillar Description */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          About the Media & Accessibility Pillar
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          This pillar covers product images, alt text coverage, video presence, and
          accessibility attributes that enhance discoverability across visual and voice
          interfaces. Images with proper alt text improve accessibility and visual
          search rankings. Missing media or poor accessibility can exclude you from
          image search, voice assistants, and accessibility-focused users.
        </p>
      </div>
    </div>
  );
}
