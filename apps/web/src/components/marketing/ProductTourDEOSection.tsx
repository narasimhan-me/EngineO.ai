export function ProductTourDEOSection() {
  return (
    <section className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:px-8">
        <div className="flex-1 space-y-8">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              What EngineO.ai actually does
            </h2>
            <p className="mt-3 text-sm text-slate-600">EngineO.ai is not an SEO tool.</p>
            <p className="mt-2 text-sm text-slate-600">
              It is a DEO Platform &mdash; Discovery Engine Optimization &mdash; designed for the
              search + AI era.
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-900">EngineO.ai:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
              <li>Crawls your entire website</li>
              <li>Extracts visibility signals</li>
              <li>Computes a DEO Score</li>
              <li>Detects issues</li>
              <li>Generates AI fixes</li>
              <li>Automates rescans and recompute</li>
              <li>Helps you optimize products, pages, blogs, and collections</li>
            </ol>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              DEO Score (Discovery Engine Optimization)
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              The DEO Score is built from four core components:
            </p>
            <dl className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-900">Content Quality</dt>
                <dd className="mt-1">Depth, clarity, structure.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Entities &amp; Semantic Signals</dt>
                <dd className="mt-1">Metadata, headings, entity hints, topic relationships.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Technical Health</dt>
                <dd className="mt-1">
                  Indexability, status codes, canonical issues, crawlability.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Visibility Strength</dt>
                <dd className="mt-1">Answer-surface potential, link structure, brand navigation.</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-slate-600">
              The DEO Score gives you a single number representing your entire site&apos;s
              visibility across search engines and AI assistants.
            </p>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <div className="text-center text-xs text-slate-500">
              <div className="mx-auto mb-2 h-24 w-24 rounded-full border border-slate-300 bg-white shadow-sm" />
              <p className="font-semibold text-slate-700">DEO Score visualization</p>
              <p className="mt-1">
                Placeholder for score dial or card showing Content, Entities, Technical, and
                Visibility components.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
