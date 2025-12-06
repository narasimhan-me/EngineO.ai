export function ProductTourCrawlSection() {
  return (
    <section className="border-b border-slate-100 bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Full-site crawling engine
            </h2>
            <p className="mt-3 text-sm text-slate-600">A dedicated crawling system that finds:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Product pages</li>
              <li>Collection/category pages</li>
              <li>Blog posts</li>
              <li>Landing pages</li>
              <li>Home page</li>
              <li>Documentation</li>
              <li>Custom routes</li>
              <li>Hub pages</li>
              <li>Navigation pages</li>
            </ul>
            <p className="mt-4 text-sm text-slate-600">
              We crawl your entire website automatically.
            </p>
            <p className="mt-1 text-sm text-slate-600">No setup. No plugins. No code.</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="h-48 w-full max-w-md rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Crawl graph</p>
              <p className="mt-2">
                Placeholder visualization showing EngineO.ai discovering products, collections,
                blogs, landing pages, and more across your site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
