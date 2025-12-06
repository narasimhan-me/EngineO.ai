export function DeoEngineSection() {
  return (
    <section className="border-b border-slate-100 bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            How EngineO.ai implements DEO
          </h2>
          <p className="text-sm text-slate-600">
            EngineO.ai is the first platform built around DEO:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>
              <span className="font-semibold text-slate-900">Automated full-site crawl</span> &mdash;
              finds every URL and extracts signals.
            </li>
            <li>
              <span className="font-semibold text-slate-900">DEO Score</span> &mdash; your universal
              visibility metric.
            </li>
            <li>
              <span className="font-semibold text-slate-900">Issues Engine</span> &mdash; clear,
              actionable problem detection.
            </li>
            <li>
              <span className="font-semibold text-slate-900">AI Optimization Workspaces</span>{' '}
              &mdash; one for products, one for all content pages.
            </li>
            <li>
              <span className="font-semibold text-slate-900">Automation layer</span> &mdash; daily
              crawling, recompute, issue updates.
            </li>
            <li>
              <span className="font-semibold text-slate-900">CMS-agnostic</span> &mdash; works with
              Shopify, WordPress, Webflow, SaaS sites, blogs &mdash; everything.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
