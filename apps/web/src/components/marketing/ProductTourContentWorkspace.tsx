export function ProductTourContentWorkspace() {
  return (
    <section className="border-b border-slate-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Content Optimization Workspace
            </h2>
            <p className="mt-3 text-sm text-slate-600">For all non-product pages:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Title + description editing</li>
              <li>AI suggestions</li>
              <li>Thin content detector</li>
              <li>Entity structure insights</li>
              <li>Crawl health</li>
              <li>Page-level issue list</li>
            </ul>
            <p className="mt-4 text-sm text-slate-600">Support for:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>WordPress</li>
              <li>Webflow</li>
              <li>Wix</li>
              <li>Squarespace</li>
              <li>Ghost</li>
              <li>Custom sites</li>
            </ul>
          </div>

          <div className="flex items-center justify-center">
            <div className="h-52 w-full max-w-md rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Content Optimization Workspace</p>
              <p className="mt-2">
                Screenshot placeholder showing metadata, AI suggestions, content depth, entities,
                and issues for a page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
