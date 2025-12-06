import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'EngineO.ai for Shopify — DEO for your store',
  description:
    'Optimize your Shopify products, collections, pages, and blogs for search and AI with EngineO.ai — the Discovery Engine Optimization (DEO) platform.',
};

export default function ShopifyLandingPage() {
  return (
    <div className="bg-white">
      {/* SECTION 1 — Shopify Hero Section */}
      <section className="border-b border-slate-100 bg-gradient-to-b from-blue-50/40 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              EngineO.ai for Shopify
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Optimize your products, collections, pages &amp; blogs for search and AI —
              automatically.
            </h1>

            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              EngineO.ai connects to your Shopify store, crawls every product and content page,
              identifies DEO issues, and gives you AI-powered fixes across your entire store.
            </p>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              Boost organic visibility. Improve product discovery. Increase conversions.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Start Free
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Connect Your Store &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Why Shopify Stores Need DEO (not SEO) */}
      <section className="border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Why Shopify stores need DEO, not just SEO
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Your customers aren&rsquo;t just searching Google anymore.
          </p>

          <div className="mt-6 grid gap-4 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-900">They&rsquo;re searching:</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                <li>• Google</li>
                <li>• TikTok</li>
                <li>• YouTube</li>
                <li>• ChatGPT</li>
                <li>• Shopping AI</li>
                <li>• Retail AI engines</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-900">
                EngineO.ai gives Shopify brands AI-era visibility by optimizing:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                <li>• Content</li>
                <li>• Entities</li>
                <li>• Technical health</li>
                <li>• Visibility signals</li>
                <li>• Answer-surface readiness</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-700">This goes far beyond traditional SEO tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Deep Crawl of Your Shopify Store */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Deep crawl of your entire Shopify store
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            EngineO.ai automatically crawls your storefront so you see how discoverable your entire
            catalog really is.
          </p>

          <div className="mt-8 grid gap-4 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">EngineO.ai automatically crawls:</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                <li>• Product pages</li>
                <li>• Collection pages</li>
                <li>• Home page</li>
                <li>• Blog posts</li>
                <li>• About, Contact, Policies</li>
                <li>• All SEO liquid-generated pages</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
              <p className="text-xs text-slate-600">
                You get real DEO signals across your entire storefront — not just products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Product Optimization Workspace (Shopify Edition) */}
      <section className="border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Product Optimization Workspace — built for Shopify
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Built specifically for Shopify merchants:
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>• Product-level DEO score</li>
                <li>• AI-generated titles &amp; descriptions</li>
                <li>• Alt text + metadata analysis</li>
                <li>• Thin content detection</li>
                <li>• Missing metadata fixes</li>
                <li>• Shopify SEO sync (apply changes instantly)</li>
                <li>• Per-product issues</li>
                <li>• Collection-aware insights (later phase)</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Showcase your strongest features:
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li>✔ AI Metadata Generator</li>
                <li>✔ DEO-driven insights</li>
                <li>✔ Shopify sync</li>
                <li>✔ Variant-aware crawling</li>
                <li>✔ Mobile &amp; desktop UX</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Collection & Blog Optimization (New Content Workspace) */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Collection &amp; blog optimization with the Content Workspace
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            EngineO.ai now supports a Content Pages Workspace, enabling:
          </p>

          <ul className="mt-6 space-y-1.5 text-sm text-slate-700">
            <li>• Collection page optimization</li>
            <li>• Blog post metadata optimization</li>
            <li>• Home page insights</li>
            <li>• Landing page DEO</li>
          </ul>

          <p className="mt-4 max-w-3xl text-sm text-slate-600">
            This is where EngineO.ai outperforms tools like Plug in SEO and TinySEO — by treating
            products, collections, and content pages as a single discovery surface.
          </p>
        </div>
      </section>

      {/* SECTION 6 — Issues Engine for Shopify */}
      <section className="border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Issues Engine for Shopify
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">Real issues. Real fixes.</p>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>• Missing product metadata</li>
                <li>• Thin or duplicate descriptions</li>
                <li>• Weak entity structure</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>• Broken links</li>
                <li>• Crawl failures</li>
                <li>• Low visibility readiness</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>• Weak navigation signals</li>
                <li>• Answer-surface potential gaps</li>
              </ul>
              <p className="mt-3 text-xs text-slate-600">
                Each issue links directly to the affected product or page → workspace → fix.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — Auto-Crawl + Auto-Recompute (Shopify Edition) */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Auto-crawl &amp; auto-recompute — Shopify edition
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Your store updates often — EngineO.ai keeps up:
          </p>

          <ul className="mt-6 space-y-1.5 text-sm text-slate-700">
            <li>• Nightly store crawl</li>
            <li>• Automatic DEO scoring</li>
            <li>• Automatic issue updates</li>
            <li>• Shopify metadata drift detection</li>
            <li>• Trendlines (coming soon)</li>
          </ul>

          <p className="mt-4 max-w-3xl text-sm text-slate-600">
            You never need to &ldquo;rescan&rdquo; manually.
          </p>
        </div>
      </section>

      {/* SECTION 8 — Supported Shopify Themes, Apps, & Stacks */}
      <section className="border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Works with your Shopify theme, apps, and stack
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">EngineO.ai works with:</p>

          <ul className="mt-6 space-y-1.5 text-sm text-slate-700">
            <li>• Any Shopify theme</li>
            <li>• Shopify Online Store 2.0</li>
            <li>• Hydrogen storefronts</li>
            <li>• Headless Shopify</li>
            <li>• Custom Liquid templates</li>
            <li>• Shopify Markets</li>
            <li>• Shopify Flow (for automation in future phases)</li>
          </ul>

          <p className="mt-4 max-w-3xl text-sm text-slate-600">
            This is important for merchant confidence.
          </p>
        </div>
      </section>

      {/* SECTION 9 — Shopify-Specific FAQ */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Shopify-specific FAQ
          </h2>
          <div className="mt-8 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Does EngineO.ai modify my theme?
              </p>
              <p className="mt-1 text-sm text-slate-600">
                No. All updates go through Shopify&rsquo;s SEO fields only.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Does it affect my store speed?</p>
              <p className="mt-1 text-sm text-slate-600">No. Crawling is external and optimized.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Do I need theme access?</p>
              <p className="mt-1 text-sm text-slate-600">No. Just store API permissions.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Can it optimize my blogs and collections?
              </p>
              <p className="mt-1 text-sm text-slate-600">Yes — via the Content Workspace.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                How is this better than SEO apps in the Shopify App Store?
              </p>
              <p className="mt-1 text-sm text-slate-600">
                DEO ≠ SEO. EngineO.ai optimizes for both search engines and AI engines (ChatGPT,
                Gemini, Perplexity, retail AIs).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10 — Final CTA */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Ready to optimize your entire Shopify store?
            </h2>
            <p className="text-sm text-slate-200">Connect your store and get:</p>
            <ul className="space-y-1.5 text-sm text-slate-200">
              <li>• DEO Score</li>
              <li>• Issues list</li>
              <li>• AI-powered product fixes</li>
              <li>• Collection &amp; page metadata</li>
              <li>• Automated daily updates</li>
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                Start Free
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-100 hover:text-white"
              >
                Connect Your Store &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
