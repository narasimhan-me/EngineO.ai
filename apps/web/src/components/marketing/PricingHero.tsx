import Link from 'next/link';

/**
 * [BILLING-GTM-1] Pricing hero with DEO + trust-safe AI governance framing.
 * - Removed "Contact Sales" CTA (enterprise out of scope for v1)
 * - Avoids ranking/revenue guarantees
 */
export function PricingHero() {
  return (
    <section className="border-b border-slate-100 bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          DEO plans that grow with your business
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Optimize your site for search and AI discovery. Reuse saves AI runs. Apply is always free.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Start Free
          </Link>
          <Link
            href="#features"
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            See how it works &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
