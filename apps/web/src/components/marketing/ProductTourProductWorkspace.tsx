export function ProductTourProductWorkspace() {
  return (
    <section className="border-b border-slate-100 bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Product Optimization Workspace
            </h2>
            <p className="mt-3 text-sm text-slate-600">For ecommerce stores:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Product overview</li>
              <li>AI metadata suggestions</li>
              <li>SEO + DEO insights</li>
              <li>Shopify sync</li>
              <li>Variant-aware crawling</li>
              <li>Issue badges</li>
              <li>Optimization history (future)</li>
            </ul>
          </div>

          <div className="flex items-center justify-center">
            <div className="h-52 w-full max-w-md rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Product Optimization Workspace</p>
              <p className="mt-2">
                Screenshot placeholder for the per-product optimization view with DEO Score, AI
                suggestions, and issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
